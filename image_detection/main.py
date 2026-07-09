import time
import os
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
import torch.nn.functional as F
import cv2
import numpy as np
import yaml
import albumentations as A
from albumentations.pytorch import ToTensorV2
from models.forensic_model import ForensicModel
from gradcam.visualizer import ForensicGradCAM

app = FastAPI(title="VERITASAI ULTRA - Fake News Image Detector", version="1.0.0")
os.makedirs("static/heatmaps", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

with open("configs/config.yaml", "r") as f:
    config = yaml.safe_load(f)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")  # type: ignore[attr-defined]
model = ForensicModel(backbone_name=config['model']['backbone'], pretrained=False)

weights_path = f"{config['system']['checkpoint_dir']}/best_model.pth"
if os.path.exists(weights_path):
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE))
model.to(DEVICE).eval()

gradcam_engine = ForensicGradCAM(model, model.get_target_layer())

inference_transform = A.Compose(  # type: ignore[arg-type]
    [
        A.Resize(config['dataset']['img_size'], config['dataset']['img_size']),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2(),
    ]
)

_UPLOAD_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>VERITASAI ULTRA — Fake News Image Detector</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:2rem}
  .card{background:#13131f;border:1px solid #1e2035;border-radius:16px;padding:2.5rem;width:100%;max-width:620px;box-shadow:0 0 40px rgba(99,102,241,.1);margin:auto}
  h1{font-size:1.4rem;font-weight:700;letter-spacing:.05em;color:#a5b4fc;margin-bottom:.25rem}
  .sub{font-size:.8rem;color:#6b7280;margin-bottom:2rem}
  .drop-zone{border:2px dashed #2d2f52;border-radius:12px;padding:3rem 1rem;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;position:relative}
  .drop-zone:hover,.drop-zone.over{border-color:#6366f1;background:rgba(99,102,241,.05)}
  .drop-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
  .drop-icon{font-size:2.5rem;margin-bottom:.75rem}
  .drop-label{color:#94a3b8;font-size:.9rem}
  .drop-label span{color:#818cf8;font-weight:600}
  #file-name{margin-top:.6rem;font-size:.8rem;color:#6366f1;min-height:1.2em}
  #preview{margin-top:1rem;max-width:100%;max-height:200px;border-radius:8px;display:none;object-fit:contain}
  .btn{display:block;width:100%;margin-top:1.5rem;padding:.85rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;border-radius:10px;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;letter-spacing:.03em;transition:opacity .2s}
  .btn:hover{opacity:.88}
  .btn:disabled{opacity:.4;cursor:not-allowed}
  #result{margin-top:1.5rem;display:none}
  .result-row{display:flex;justify-content:space-between;padding:.55rem 0;border-bottom:1px solid #1e2035;font-size:.88rem}
  .result-row:last-child{border:none}
  .label{color:#6b7280;flex-shrink:0;margin-right:1rem}
  .value{font-weight:600;color:#e2e8f0;text-align:right}
  .badge{display:inline-block;padding:.2rem .65rem;border-radius:20px;font-size:.78rem;font-weight:700;letter-spacing:.04em}
  .badge.REAL{background:#064e3b;color:#6ee7b7}
  .badge.FAKE,.badge.FAKE-NEWS{background:#450a0a;color:#fca5a5}
  .badge.CRITICAL{background:#450a0a;color:#f87171}
  .badge.HIGH{background:#431407;color:#fdba74}
  .badge.LOW{background:#052e16;color:#86efac}
  .heatmap-section{margin-top:1.25rem}
  .heatmap-title{font-size:.78rem;color:#6b7280;margin-bottom:.5rem;letter-spacing:.04em;text-transform:uppercase}
  .heatmap-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
  .heatmap-grid img{width:100%;border-radius:8px;border:1px solid #1e2035;object-fit:cover}
  .heatmap-grid .img-label{font-size:.7rem;color:#6b7280;text-align:center;margin-top:.25rem}
  .heatmap-link{display:block;text-align:center;margin-top:.5rem;font-size:.78rem;color:#818cf8;text-decoration:none}
  .heatmap-link:hover{text-decoration:underline}
  .spinner{width:22px;height:22px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:.5rem}
  @keyframes spin{to{transform:rotate(360deg)}}
  .error-msg{background:#450a0a;border:1px solid #7f1d1d;border-radius:8px;padding:.75rem 1rem;color:#fca5a5;font-size:.85rem;margin-top:1rem;display:none}
  .sources{margin-top:2rem;border-top:1px solid #1e2035;padding-top:1.25rem}
  .sources h2{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#4b5563;margin-bottom:.75rem}
  .source-list{display:flex;flex-direction:column;gap:.4rem}
  .source-list a{font-size:.78rem;color:#6366f1;text-decoration:none;display:flex;align-items:center;gap:.4rem}
  .source-list a:hover{color:#a5b4fc;text-decoration:underline}
  .src-badge{font-size:.65rem;padding:.1rem .4rem;border-radius:4px;font-weight:700;flex-shrink:0}
  .src-badge.dataset{background:#1e1b4b;color:#a5b4fc}
  .src-badge.paper{background:#1a2e1a;color:#86efac}
  .src-badge.tool{background:#1c1917;color:#d6d3d1}
</style>
</head>
<body>
<div class="card">
  <h1>VERITASAI ULTRA</h1>
  <p class="sub">Fake News Image Detector &mdash; v1.0 &mdash; EfficientNet-B4 + Grad-CAM</p>
  <div class="drop-zone" id="drop-zone">
    <input type="file" id="file-input" accept="image/*"/>
    <div class="drop-icon">🗞️</div>
    <p class="drop-label">Drop a news image here or <span>browse</span></p>
    <p id="file-name"></p>
    <img id="preview"/>
  </div>
  <button class="btn" id="analyze-btn" disabled>Analyze Image</button>
  <div class="error-msg" id="error-msg"></div>

  <div id="result">
    <div class="result-row"><span class="label">Verdict</span><span class="value" id="r-verdict"></span></div>
    <div class="result-row"><span class="label">Confidence</span><span class="value" id="r-conf"></span></div>
    <div class="result-row"><span class="label">Risk Level</span><span class="value" id="r-risk"></span></div>
    <div class="result-row"><span class="label">Model</span><span class="value" id="r-model"></span></div>
    <div class="result-row"><span class="label">Inference Time</span><span class="value" id="r-time"></span></div>
    <div class="result-row"><span class="label">Explanation</span><span class="value" id="r-exp"></span></div>

    <div class="heatmap-section">
      <p class="heatmap-title">Grad-CAM Suspicious Region Analysis</p>
      <div class="heatmap-grid">
        <div>
          <img id="r-original" alt="Original"/>
          <p class="img-label">Original News Image</p>
        </div>
        <div>
          <img id="r-heatmap" alt="Grad-CAM Overlay"/>
          <p class="img-label">Suspicious Regions</p>
        </div>
      </div>
      <a id="r-heatmap-link" class="heatmap-link" href="#" target="_blank" download>
        ↓ Download full-resolution heatmap
      </a>
    </div>
  </div>

  <div class="sources">
    <h2>Training Data Sources</h2>
    <div class="source-list">
      <a href="https://fakeddit.netlify.app/" target="_blank">
        <span class="src-badge dataset">DATASET</span>Fakeddit — Multimodal fake news benchmark (Reddit, 1M+ posts)
      </a>
      <a href="https://github.com/KaiDMML/FakeNewsNet" target="_blank">
        <span class="src-badge dataset">DATASET</span>FakeNewsNet — PolitiFact &amp; GossipCop fact-checked news
      </a>
      <a href="https://arxiv.org/abs/1911.03854" target="_blank">
        <span class="src-badge paper">PAPER</span>Fakeddit paper — Nakamura et al., LREC 2020
      </a>
      <a href="https://arxiv.org/abs/1809.01286" target="_blank">
        <span class="src-badge paper">PAPER</span>FakeNewsNet paper — Shu et al., 2018
      </a>
      <a href="https://huggingface.co/timm/efficientnet_b4.ra2_in1k" target="_blank">
        <span class="src-badge tool">MODEL</span>EfficientNet-B4 backbone — timm / HuggingFace
      </a>
    </div>
  </div>
</div>
<script>
const input = document.getElementById('file-input');
const btn = document.getElementById('analyze-btn');
const fileName = document.getElementById('file-name');
const preview = document.getElementById('preview');
const result = document.getElementById('result');
const errMsg = document.getElementById('error-msg');
let originalObjectUrl = null;

input.addEventListener('change', () => {
  const f = input.files[0];
  if (!f) return;
  fileName.textContent = f.name;
  btn.disabled = false;
  if (originalObjectUrl) URL.revokeObjectURL(originalObjectUrl);
  originalObjectUrl = URL.createObjectURL(f);
  preview.src = originalObjectUrl;
  preview.style.display = 'block';
  result.style.display = 'none';
  errMsg.style.display = 'none';
});

const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(f);
    input.files = dt.files;
    input.dispatchEvent(new Event('change'));
  }
});

btn.addEventListener('click', async () => {
  const f = input.files[0];
  if (!f) return;
  btn.innerHTML = '<span class="spinner"></span>Analyzing…';
  btn.disabled = true;
  errMsg.style.display = 'none';
  result.style.display = 'none';

  const form = new FormData();
  form.append('file', f);

  try {
    const res = await fetch('/api/v1/analyze/image', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Server error');
    }
    const data = await res.json();
    const verdictKey = data.verdict.includes('FAKE') ? 'FAKE' : 'REAL';

    document.getElementById('r-verdict').innerHTML = `<span class="badge ${verdictKey}">${data.verdict}</span>`;
    document.getElementById('r-conf').textContent = (data.confidence * 100).toFixed(2) + '%';
    document.getElementById('r-risk').innerHTML = `<span class="badge ${data.risk}">${data.risk}</span>`;
    document.getElementById('r-model').textContent = data.model_version;
    document.getElementById('r-time').textContent = data.inference_time_ms.toFixed(1) + ' ms';
    document.getElementById('r-exp').textContent = data.explanation;

    // Show original image in result panel
    document.getElementById('r-original').src = originalObjectUrl;

    // Show heatmap served from /static/
    const heatmapUrl = '/' + data.heatmap_path.replace(/\\\\/g, '/');
    document.getElementById('r-heatmap').src = heatmapUrl;
    const dlLink = document.getElementById('r-heatmap-link');
    dlLink.href = heatmapUrl;
    dlLink.download = heatmapUrl.split('/').pop();

    result.style.display = 'block';
  } catch (e) {
    errMsg.textContent = e.message;
    errMsg.style.display = 'block';
  } finally {
    btn.innerHTML = 'Analyze Image';
    btn.disabled = false;
  }
});
</script>
</body>
</html>"""


class AnalysisResponse(BaseModel):
    verdict: str
    confidence: float
    risk: str
    model_version: str
    inference_time_ms: float
    explanation: str
    heatmap_path: str


@app.get("/", response_class=HTMLResponse)
async def root():
    return _UPLOAD_PAGE


@app.post("/api/v1/analyze/image", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid media asset supplied.")

    start_time = time.time()
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Corrupted image matrix array structural integrity.")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    augmented = inference_transform(image=img_rgb)
    tensor_img = augmented['image'].unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(tensor_img)
        probabilities = F.softmax(outputs, dim=1)
        fake_probability = probabilities[0][1].item()

    torch.set_grad_enabled(True)
    heatmap = gradcam_engine.generate_heatmap(tensor_img, target_class=1)
    torch.set_grad_enabled(False)

    resized_orig = cv2.resize(img_rgb, (config['dataset']['img_size'], config['dataset']['img_size']))
    overlay_out = gradcam_engine.overlay_heatmap(resized_orig, heatmap)

    output_filename = f"static/heatmaps/{uuid.uuid4()}.jpg"
    os.makedirs(os.path.dirname(output_filename), exist_ok=True)
    cv2.imwrite(output_filename, cv2.cvtColor(overlay_out, cv2.COLOR_RGB2BGR))

    inference_time = (time.time() - start_time) * 1000

    verdict = "FAKE NEWS" if fake_probability >= 0.5 else "REAL NEWS"
    confidence = fake_probability if verdict == "FAKE NEWS" else (1.0 - fake_probability)

    if confidence > 0.85 and verdict == "FAKE NEWS":
        risk = "CRITICAL"
    elif confidence > 0.5 and verdict == "FAKE NEWS":
        risk = "HIGH"
    else:
        risk = "LOW"

    if verdict == "FAKE NEWS":
        explanation = (
            f"This news image shows strong indicators of being misleading or fabricated. "
            f"The model detected suspicious visual patterns with {confidence*100:.1f}% confidence. "
            f"Highlighted regions in the heatmap indicate areas driving this prediction."
        )
    else:
        explanation = (
            f"This news image appears to be authentic with {confidence*100:.1f}% confidence. "
            f"No significant indicators of manipulation or misleading content were detected."
        )

    return AnalysisResponse(
        verdict=verdict,
        confidence=round(confidence, 4),
        risk=risk,
        model_version=f"VERITASAI_ULTRA_FakeNews_{config['model']['backbone']}_v1.0",
        inference_time_ms=round(inference_time, 2),
        explanation=explanation,
        heatmap_path=output_filename,
    )
