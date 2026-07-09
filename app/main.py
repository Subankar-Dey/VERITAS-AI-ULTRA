from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from app.credibility import calculate_trust
from app.image_detector import predict_image
from app.predictor import predict_news
from app.similarity import calculate_similarity
from app.verifier import verify_news

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="AI Verify - News Verification")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


class TextAnalysisRequest(BaseModel):
    text: str


class ImageAnalysisRequest(BaseModel):
    # Kept for API parity; the actual file is uploaded separately.
    pass


def _strip_emoji(text: str) -> str:
    import re
    return re.sub(r"[^\w\s,./%-]", "", text).strip()


@app.post("/api/analyze/text")
async def analyze_text_json(req: TextAnalysisRequest):
    """JSON endpoint consumed by VeritasAI Ultra Express server."""
    news = req.text.strip()

    label, confidence, real_confidence = predict_news(news)
    articles = verify_news(news)
    similarity_score, best_article = calculate_similarity(news, articles)
    trust, verdict_label, matched_sources = calculate_trust(
        real_confidence, similarity_score, articles
    )

    is_fake = "FAKE" in label
    verdict = "Likely Fake" if is_fake else "Authentic"

    risk_meter = round(100 - trust, 2)
    if risk_meter >= 60:
        risk_level = "High"
    elif risk_meter >= 35:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    clean_label = _strip_emoji(verdict_label)

    if is_fake:
        explanation = (
            f"DistilBERT-v4 analysis flags this content as potentially fabricated "
            f"(model confidence {confidence:.1f}%). "
            f"Composite trust score: {trust:.1f}/100 — {clean_label}. "
            f"Semantic similarity to verified live news: {similarity_score:.1f}%."
        )
    else:
        explanation = (
            f"DistilBERT-v4 analysis rates this content as authentic "
            f"(model confidence {confidence:.1f}%). "
            f"Composite trust score: {trust:.1f}/100 — {clean_label}. "
            f"Semantic similarity to verified live news: {similarity_score:.1f}%."
        )

    trusted_names = ", ".join(s["source"] for s in matched_sources) if matched_sources else "none matched trusted list"
    detailed_analysis = [
        f"DistilBERT Classification: {label} — model confidence {confidence:.1f}%.",
        f"Real-News Probability: Softmax REAL-class probability is {real_confidence:.1f}%.",
        f"Semantic Similarity: Best cosine match against live retrieved articles is {similarity_score:.1f}%.",
        f"Source Credibility: {len(matched_sources)} trusted outlet(s) corroborate this story ({trusted_names}).",
        f"Composite Trust Score: {trust:.1f}/100 — weighted from DistilBERT (25%), semantic similarity (45%), source credibility (30%).",
    ]

    attention_scores = [
        {"name": "DistilBERT Confidence", "score": round(confidence)},
        {"name": "Real-News Probability", "score": round(real_confidence)},
        {"name": "Semantic Similarity", "score": round(similarity_score)},
        {"name": "Composite Trust Score", "score": round(trust)},
    ]

    raw_sources = matched_sources if matched_sources else articles[:4]
    sources = [{"title": s["title"], "url": s["url"]} for s in raw_sources if s.get("url") and s.get("title")]

    return {
        "verdict": verdict,
        "confidence": round(confidence),
        "riskLevel": risk_level,
        "explanation": explanation,
        "detailedAnalysis": detailed_analysis,
        "explainableAI": {
            "riskMeter": round(risk_meter),
            "heatmapCoordinates": [],
            "attentionScores": attention_scores,
            "highlightedTextSpans": [],
        },
        "isDemo": False,
        "modelVersion": "distilbert-v4",
        "sources": sources,
    }


@app.post("/api/analyze/image")
async def analyze_image_json(file: UploadFile = File(...)):
    """JSON endpoint for the forensic image detector."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid media asset supplied.")
    contents = await file.read()
    try:
        result = predict_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request, "result": None, "news": "", "image_result": None, "image_error": None}
    )


def _verdict_class(trust: float) -> str:
    if trust >= 75:
        return "good"
    if trust >= 55:
        return "warn"
    return "bad"


def _image_risk_class(risk: str) -> str:
    return {"CRITICAL": "bad", "HIGH": "bad", "LOW": "good"}.get(risk, "warn")


@app.post("/verify", response_class=HTMLResponse)
async def verify(request: Request, news: str = Form(...)):
    label, confidence, real_confidence = predict_news(news)
    articles = verify_news(news)
    similarity_score, best_article = calculate_similarity(news, articles)
    trust, verdict, matched_sources = calculate_trust(
        real_confidence, similarity_score, articles
    )

    result = {
        "label": label,
        "confidence": confidence,
        "real_confidence": real_confidence,
        "trust": trust,
        "verdict": verdict,
        "verdict_class": _verdict_class(trust),
        "matched_sources": matched_sources,
        "similarity": similarity_score,
        "best_article": best_article,
        "articles": articles,
    }

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "result": result,
            "news": news,
            "image_result": None,
            "image_error": None,
        },
    )


@app.post("/verify_image", response_class=HTMLResponse)
async def verify_image(request: Request, file: UploadFile = File(...)):
    image_result = None
    image_error = None
    if not file.content_type or not file.content_type.startswith("image/"):
        image_error = "Invalid media asset supplied. Please upload a PNG, JPG, or WEBP image."
    else:
        contents = await file.read()
        try:
            image_result = predict_image(contents)
            image_result["verdict_class"] = _image_risk_class(image_result["risk"])
            image_result["heatmap_url"] = "/" + image_result["heatmap_path"].replace("\\", "/")
            image_result["confidence_pct"] = round(image_result["confidence"] * 100, 2)
        except ValueError as e:
            image_error = str(e)
        except Exception as e:  # pragma: no cover - last-ditch safety net
            image_error = f"Image analysis failed: {e}"

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "result": None,
            "news": "",
            "image_result": image_result,
            "image_error": image_error,
        },
    )
