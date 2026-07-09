"""
Image forensic detector.

Loads the EfficientNet-B4 backbone from `image_detection/` once at import time
and exposes `predict_image(image_bytes)` returning a rich result dict that the
FastAPI layer can hand straight to the template.
"""

import importlib.util
import os
import sys
import time
import uuid
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
import yaml
import albumentations as A
from albumentations.pytorch import ToTensorV2

BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_DIR = BASE_DIR / "image_detection"
MODELS_DIR = IMAGE_DIR / "models"
GRADCAM_DIR = IMAGE_DIR / "gradcam"

# Load the forensic model and grad-cam visualizer directly from their files
# instead of relying on the `image_detection` package's path-based imports.
# Importing the package this way would otherwise let its `datasets/` subpackage
# shadow the real `datasets` (Hugging Face) install on sys.path.
def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
    sys.modules[name] = module
    assert spec.loader is not None
    spec.loader.exec_module(module)  # type: ignore[union-attr]
    return module


_forensic_module = _load_module("image_forensic_model", MODELS_DIR / "forensic_model.py")
ForensicModel = _forensic_module.ForensicModel

_visualizer_module = _load_module("image_gradcam_visualizer", GRADCAM_DIR / "visualizer.py")
ForensicGradCAM = _visualizer_module.ForensicGradCAM


CONFIG_PATH = IMAGE_DIR / "configs" / "config.yaml"
WEIGHTS_PATH = IMAGE_DIR / "checkpoints" / "best_model.pth"
HEATMAP_DIR = BASE_DIR / "static" / "heatmaps"
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)

with open(CONFIG_PATH, "r") as f:
    CONFIG = yaml.safe_load(f)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL = ForensicModel(
    backbone_name=CONFIG["model"]["backbone"],
    pretrained=False,
)
if WEIGHTS_PATH.exists():
    state_dict = torch.load(WEIGHTS_PATH, map_location=DEVICE)
    MODEL.load_state_dict(state_dict)
MODEL.to(DEVICE).eval()

GRADCAM = ForensicGradCAM(MODEL, MODEL.get_target_layer())

INFERENCE_TRANSFORM = A.Compose(
    [
        A.Resize(CONFIG["dataset"]["img_size"], CONFIG["dataset"]["img_size"]),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2(),
    ]
)

MODEL_VERSION = f"VERITASAI_ULTRA_FakeNews_{CONFIG['model']['backbone']}_v1.0"


def predict_image(image_bytes: bytes) -> dict:
    """
    Run forensic fake-news image detection on raw image bytes.

    Returns a dict with verdict, confidence, risk, model_version,
    inference_time_ms, explanation, heatmap_path (relative to /static/).
    """
    start = time.time()

    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Corrupted image matrix array structural integrity.")
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    augmented = INFERENCE_TRANSFORM(image=img_rgb)
    tensor = augmented["image"].unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = MODEL(tensor)
        probs = F.softmax(logits, dim=1)
        fake_probability = float(probs[0][1].item())

    # Grad-CAM needs gradients enabled, but we don't want autograd elsewhere.
    torch.set_grad_enabled(True)
    heatmap = GRADCAM.generate_heatmap(tensor, target_class=1)
    torch.set_grad_enabled(False)

    img_size = CONFIG["dataset"]["img_size"]
    resized = cv2.resize(img_rgb, (img_size, img_size))
    overlay = GRADCAM.overlay_heatmap(resized, heatmap)

    out_name = f"{uuid.uuid4().hex}.jpg"
    out_path = HEATMAP_DIR / out_name
    cv2.imwrite(str(out_path), cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))

    elapsed_ms = (time.time() - start) * 1000

    verdict = "FAKE NEWS" if fake_probability >= 0.5 else "REAL NEWS"
    confidence = fake_probability if verdict == "FAKE NEWS" else 1.0 - fake_probability

    if verdict == "FAKE NEWS" and confidence > 0.85:
        risk = "CRITICAL"
    elif verdict == "FAKE NEWS" and confidence > 0.5:
        risk = "HIGH"
    else:
        risk = "LOW"

    if verdict == "FAKE NEWS":
        explanation = (
            f"This news image shows strong indicators of being misleading or "
            f"fabricated. The forensic model detected suspicious visual patterns "
            f"with {confidence * 100:.1f}% confidence. Highlighted regions in the "
            f"Grad-CAM heatmap indicate the areas driving this prediction."
        )
    else:
        explanation = (
            f"This news image appears to be authentic with "
            f"{confidence * 100:.1f}% confidence. No significant indicators of "
            f"manipulation or misleading content were detected."
        )

    return {
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "risk": risk,
        "model_version": MODEL_VERSION,
        "inference_time_ms": round(elapsed_ms, 2),
        "explanation": explanation,
        "heatmap_path": f"static/heatmaps/{out_name}".replace("\\", "/"),
        # Compatibility aliases for the existing template
        "label": verdict,
        "confidence_pct": round(confidence * 100, 2),
    }
