# AI VERIFY - News Verification Model

A fake news verification pipeline built on a fine-tuned DistilBERT classifier, semantic similarity search, and live news cross-referencing via NewsAPI.

## How it works

1. **`app/predictor.py`** — runs the input text through a fine-tuned `DistilBertForSequenceClassification` model (`saved_models/text_model_v4/`) to classify it as REAL or FAKE. Returns the confidence in whichever label it picked, *and* the probability specifically that the text is REAL (needed below).
2. **`app/headline.py`** — extracts a short headline (first sentence, first 10 words) from the input text to use as a search query.
3. **`app/verifier.py`** — queries the [NewsAPI](https://newsapi.org) `/v2/everything` endpoint with that headline to retrieve related articles from live news sources.
4. **`app/similarity.py`** — uses `sentence-transformers` (`all-MiniLM-L6-v2`) to compute the best semantic similarity score between the input text and the retrieved articles.
5. **`app/credibility.py`** — combines the model's REAL-probability, similarity score, and source trust (weighted lookup against a list of trusted outlets in `TRUSTED_SOURCES`) into a final trust score and verdict (Verified / Highly Credible / Needs More Evidence / Low Credibility). Also returns the matched trusted-source articles (title + link) as supporting evidence.

> **Note:** `calculate_trust` takes the probability that the text is REAL, not "confidence in whatever label was predicted." A model that's 95% confident something is FAKE has a REAL-probability of only 5% — using the raw confidence there would make a highly-confident fake prediction *increase* the trust score, which is backwards.

## Project structure

```
app/
├── __init__.py      # Disables the TensorFlow backend for transformers (see Troubleshooting)
├── main.py            # FastAPI app: GET / (form) and POST /verify (runs the pipeline)
├── config.py            # Loads NEWS_API_KEY from environment (.env)
├── credibility.py         # Trust score + verdict calculation
├── headline.py              # Headline extraction from raw text
├── predictor.py               # DistilBERT fake/real news classifier
├── similarity.py                # Sentence-transformer similarity scoring
└── verifier.py                    # NewsAPI article retrieval

templates/index.html      # Web form + result page (Jinja2)
static/style.css            # Page styling
run.py                         # Entry point: starts the FastAPI app with uvicorn
check.py                         # Standalone script to run the pipeline from the terminal

news_data/real.csv        # Modern real-news snippets (from NewsAPI top-headlines)
news_data/fake.csv          # Fake-news snippets (sampled from a public dataset, see Training)
scripts/fetch_real_news.py    # Builds news_data/real.csv
scripts/fetch_fake_news.py      # Builds news_data/fake.csv
train.py                          # Fine-tunes saved_models/text_model on news_data/*.csv

saved_models/text_model/     # Original base checkpoint (tracked via Git LFS)
saved_models/text_model_v4/  # Active checkpoint, fine-tuned on news_data/*.csv (see Training)
```

## Setup

### Clone

```bash
git lfs install
git clone https://github.com/Sydmoosa7/AI-VERIFY-News-Model.git
cd AI-VERIFY-News-Model
```

### Install dependencies

```bash
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

pip install -r REQUIREMENTS.TXT
```

### Configure your API key

Copy `.env.example` to `.env` and add your own [NewsAPI](https://newsapi.org) key:

```bash
cp .env.example .env
```

```
NEWS_API_KEY=your_newsapi_key_here
```

## How to run the model

### Web app (recommended)

With your virtual environment activated and `.env` configured (see Setup above):

```bash
python run.py
```

Then open **http://127.0.0.1:8000/** in a browser. Paste a news article or headline into the text box and click **Verify** — the page will show the model's REAL/FAKE prediction with confidence, the overall trust score and verdict, the best-matching article by similarity, and the list of related articles pulled from NewsAPI.

The first run will download the `all-MiniLM-L6-v2` sentence-transformer model (used for similarity scoring) if it isn't already cached locally, so the first request can take a while.

`run.py` starts `app/main.py` (a FastAPI app) via `uvicorn` on `127.0.0.1:8000`. To use a different port or host, edit the `uvicorn.run(...)` call in `run.py`.

### Terminal script

To run the pipeline from the terminal instead of the browser, use `check.py`:

```bash
python check.py
```

Edit the `news = "..."` line in `check.py` to change the input text. It calls the same pipeline functions used by the web app and prints the results.

### Classifier only (no NewsAPI call)

If you just want the DistilBERT REAL/FAKE prediction without live source verification (and don't need `NEWS_API_KEY` set), you can call `predict_news` on its own:

```python
from app.predictor import predict_news

label, confidence, real_confidence = predict_news("Your news article text here.")
print(label, confidence, real_confidence)
```

## Model

`app/predictor.py` loads `saved_models/text_model_v4/` by default — a version of the base DistilBERT checkpoint fine-tuned on modern real news + a public fake-news dataset (see Training below). The original, un-fine-tuned checkpoint is kept at `saved_models/text_model/` if you want to compare or revert (just change `MODEL_PATH` in `app/predictor.py`).

## Training

To fine-tune the classifier on fresh data:

```bash
python scripts/fetch_real_news.py   # pulls modern headlines from NewsAPI -> news_data/real.csv
python scripts/fetch_fake_news.py   # samples fake-labeled rows from a public dataset -> news_data/fake.csv
python train.py                     # fine-tunes saved_models/text_model -> saved_models/text_model_v4
```

`scripts/fetch_fake_news.py` samples from [`GonzaloA/fake_news`](https://huggingface.co/datasets/GonzaloA/fake_news) on Hugging Face (a WELFake-derived combination of several public fake-news corpora, mostly 2016-2018 US political news — a static classifier can't verify facts about *current* events; what it can do is learn writing-style patterns, which is what this fine-tune targets). `train.py` needs `datasets`, `scikit-learn`, and `accelerate` (all in `REQUIREMENTS.TXT`), and optionally an `HF_TOKEN` in `.env` if you hit Hugging Face rate limits.

**Why the two scripts matter, not just the model:** the real and fake examples must be in a comparable format, or the model will learn to distinguish them by superficial cues (text length, "- Source Name" suffixes NewsAPI adds to titles, etc.) instead of content. `scripts/fetch_real_news.py` strips NewsAPI's title suffix and `scripts/fetch_fake_news.py` trims fake articles to a short snippet, specifically so both classes have a matching length/format distribution. Skipping this produced a model that classified almost everything as REAL — confirm with the sanity check below before trusting a new fine-tune.

**Known limitation:** with ~300 training examples, the fine-tune reliably fixes modern real news being misclassified as fake, but is measurably weaker at catching flatly-worded (non-clickbait) fake claims than the original model was. This isn't a bug to "just fix" — it's what a fine-tune on a few hundred examples looks like. Meaningfully improving both directions at once would need a much larger and more diverse training set on both sides.

Before trusting any retrained checkpoint, sanity-check it against a handful of obvious real and obvious fake examples the model hasn't seen — don't rely on the validation accuracy Trainer reports, since with a small dataset it can look excellent (~95-98%) while the model has actually just learned a shortcut:

```python
import torch
from transformers import AutoTokenizer, DistilBertForSequenceClassification

tok = AutoTokenizer.from_pretrained("saved_models/text_model_v4")
model = DistilBertForSequenceClassification.from_pretrained("saved_models/text_model_v4")
model.eval()

def predict(text):
    inputs = tok(text, return_tensors="pt", truncation=True, padding=True, max_length=256)
    with torch.no_grad():
        out = model(**inputs)
    pred = torch.argmax(out.logits, dim=1).item()
    conf = torch.softmax(out.logits, dim=1)[0][pred].item() * 100
    return ("REAL" if pred == 1 else "FAKE"), round(conf, 2)

print(predict("A real, specific, plausible headline about something that actually happened."))
print(predict("An obviously fabricated claim, written in a normal (non-clickbait) tone."))
```

If a retrained model calls both of those REAL, it has collapsed to a "predict REAL" shortcut and shouldn't be used.

## Troubleshooting

- **`ValueError: ... Keras 3 ... not yet supported in Transformers`** — happens if TensorFlow is also installed in your environment; `transformers` tries to load a TF backend that this project doesn't use. `app/__init__.py` sets `USE_TF=0` to prevent this, but it must be the *first* thing imported from `app` (i.e. don't import `transformers` or `sentence_transformers` directly before importing anything from `app`).
- **`UnicodeEncodeError` when printing results in a terminal (Windows)** — the model's output strings include emoji (`✅`, `❌`, `🟡`, `🔴`). Windows terminals default to `cp1252`, which can't encode them. The web app is unaffected (browsers render UTF-8 fine); for `check.py` or your own scripts, add `sys.stdout.reconfigure(encoding="utf-8")` before printing, or run with `PYTHONUTF8=1`.
- **`RuntimeError: NEWS_API_KEY is not set`** — you're missing a `.env` file. See "Configure your API key" above.
- **Port 8000 already in use / permission errors on Windows** — edit `run.py` to use a different port, e.g. `uvicorn.run("app.main:app", host="127.0.0.1", port=8001)`.
