# VERITASAI ULTRA — Fake News Image Detector

A production-grade deep learning service that classifies news images as **REAL** or **FAKE / FAKE-NEWS** using an EfficientNet-B4 backbone, with **Grad-CAM** visual explanations highlighting the regions driving each prediction.

The backend is a **FastAPI** application that exposes a single inference endpoint plus a built-in drag-and-drop web UI. It is designed to be the inference half of a larger multimodal fake-news detection system.

---

## Features

- **Binary classifier** — `REAL NEWS` vs `FAKE NEWS` (2 classes, sigmoid/softmax head).
- **Backbone** — EfficientNet-B4 (timm), input resolution **380×380**, dropout 0.4.
- **Grad-CAM explainability** — per-image heatmap overlay saved to `static/heatmaps/` and served over `/static/`.
- **Risk scoring** — `LOW` / `HIGH` / `CRITICAL` derived from class probability.
- **Single-page web UI** — drop an image, see verdict + heatmap inline, no frontend build step required.
- **MLflow + TensorBoard** logging for training experiments (see `mlruns/`, `logs/`).
- **Docker-ready** (`Dockerfile` based on `nvidia/cuda:11.8.0-runtime-ubuntu22.04`).

---

## Project layout

```
image_detection/
├── main.py                  # FastAPI app, /api/v1/analyze/image, embedded HTML UI
├── configs/config.yaml      # All training & inference hyperparameters
├── models/                  # ForensicModel, backbone factory
├── gradcam/                 # Grad-CAM engine + overlay
├── training/                # Training loop & losses
├── scripts/                 # Dataset prep, evaluation, conversion utilities
├── datasets/                # (Optional) local image folders used by training scripts
├── data/                    # Raw / processed data roots
├── checkpoints/best_model.pth  # Trained weights loaded at startup
├── static/                  # Served at /static/ (includes heatmaps/)
├── tests/                   # pytest suite
├── mlruns/                  # MLflow tracking data
├── logs/                    # TensorBoard logs
├── requirements.txt
└── Dockerfile
```

---

## Requirements

- Python 3.10+
- (Optional) CUDA 11.8 + a CUDA-capable GPU for faster training/inference
- ~2 GB disk for dependencies, plus space for datasets and model weights

> The pinned `torch==2.3.1+cu118` is for Linux. On Windows, install PyTorch first via the official selector (see Install below) — `torch`/`torchvision` lines in `requirements.txt` are Linux-only by design.

---

## Install

### Linux / WSL (CUDA 11.8)

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Windows (CPU or CUDA)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip

# Pick ONE of the two torch install commands below:
pip install torch==2.3.1 torchvision==0.18.1 --index-url https://download.pytorch.org/whl/cu118
# or, for CPU-only:
pip install torch==2.3.1 torchvision==0.18.1

pip install -r requirements.txt
```

### Docker

```bash
docker build -t veritasai-ultra .
docker run --gpus all -p 8000:8000 -v %cd%:/app veritasai-ultra
```

---

## Run the API

From the `image_detection/` directory:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

Then open:

- **Web UI** → http://localhost:8000/
- **Interactive API docs (Swagger)** → http://localhost:8000/docs
- **OpenAPI schema** → http://localhost:8000/openapi.json

The app expects a trained checkpoint at `checkpoints/best_model.pth` (relative to the working directory). If the file is missing, the model is initialized with random weights and predictions will be meaningless — train first or drop in a checkpoint before relying on results.

---

## API

### `POST /api/v1/analyze/image`

Multipart upload of a single image file.

**Request**

| Field | Type | Description |
| --- | --- | --- |
| `file` | `UploadFile` (image/*) | News image to classify |

**Response — `200 OK`**

```json
{
  "verdict": "FAKE NEWS",
  "confidence": 0.9123,
  "risk": "CRITICAL",
  "model_version": "VERITASAI_ULTRA_FakeNews_efficientnet_b4_v1.0",
  "inference_time_ms": 184.7,
  "explanation": "This news image shows strong indicators of being misleading or fabricated...",
  "heatmap_path": "static/heatmaps/8a1f...e3.jpg"
}
```

**Error responses**

- `400` — `Invalid media asset supplied.` (not an image MIME type)
- `400` — `Corrupted image matrix array structural integrity.` (OpenCV failed to decode)

The returned `heatmap_path` is served at `GET /static/heatmaps/<file>.jpg`.

### `GET /`

Returns the single-page HTML upload UI (no separate frontend build required).

---

## How risk is computed

```
fake_prob = softmax(model(image))[class=1]
verdict   = "FAKE NEWS" if fake_prob >= 0.5 else "REAL NEWS"
confidence= max(fake_prob, 1 - fake_prob)

risk      = "CRITICAL" if verdict == "FAKE" and confidence > 0.85
            "HIGH"     if verdict == "FAKE" and confidence > 0.5
            "LOW"      otherwise
```

---

## Configuration

All runtime/training settings live in `configs/config.yaml`. Key fields:

- `model.backbone` — `efficientnet_b3` | `efficientnet_b4` | `convnext_tiny`
- `model.pretrained` — load ImageNet-pretrained weights at init
- `dataset.img_size` — square input size (380 for EfficientNet-B4)
- `system.checkpoint_dir` — directory containing `best_model.pth`

Changing `backbone` requires a matching re-training; the inference path uses the same backbone to load weights.

---

## Training data sources

- **Fakeddit** — multimodal fake-news benchmark (Reddit, 1M+ posts). [fakeddit.netlify.app](https://fakeddit.netlify.app/) · [paper](https://arxiv.org/abs/1911.03854)
- **FakeNewsNet** — PolitiFact & GossipCop fact-checked news. [repo](https://github.com/KaiDMML/FakeNewsNet) · [paper](https://arxiv.org/abs/1809.01286)
- **EfficientNet-B4 backbone** — [timm / HuggingFace](https://huggingface.co/timm/efficientnet_b4.ra2_in1k)

---

## Development

Run the test suite:

```bash
pytest -q
```

The test client uses `httpx` and talks to the FastAPI app in-process — no live server required.

---

## License

Internal research project. Add a license before public distribution.
