"""
Generate synthetic dummy images to validate the training pipeline
without needing the real datasets (FaceForensics, Celeb-DF, DFDC, etc.).

Creates:
  data/
    DummySet/
      real/  -- 60 random-noise images  (label 0)
      fake/  -- 60 gradient-noise images (label 1)

Run once, then run train.py:
  python scripts/generate_dummy_data.py
  python scripts/train.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import numpy as np

N_IMAGES  = 60   # per class — enough to produce train/val/test splits
IMG_SIZE  = 380
OUT_DIR   = "data/DummySet"


def make_real_image(idx: int) -> np.ndarray:
    rng = np.random.default_rng(idx)
    return (rng.random((IMG_SIZE, IMG_SIZE, 3)) * 255).astype(np.uint8)


def make_fake_image(idx: int) -> np.ndarray:
    rng = np.random.default_rng(idx + 10000)
    x = np.linspace(0, 1, IMG_SIZE)
    y = np.linspace(0, 1, IMG_SIZE)
    xv, yv = np.meshgrid(x, y)
    base = (np.stack([xv, yv, 1 - xv], axis=-1) * 200).astype(np.uint8)
    noise = (rng.random((IMG_SIZE, IMG_SIZE, 3)) * 55).astype(np.uint8)
    return np.clip(base.astype(int) + noise.astype(int), 0, 255).astype(np.uint8)


def generate(label: str, fn, n: int) -> None:
    dest = os.path.join(OUT_DIR, label)
    os.makedirs(dest, exist_ok=True)
    for i in range(n):
        img = fn(i)
        path = os.path.join(dest, f"{label}_{i:04d}.jpg")
        cv2.imwrite(path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
    print(f"  [{label:4s}] {n} images -> {dest}")


def main() -> None:
    print(f"Generating {N_IMAGES} real + {N_IMAGES} fake synthetic images...")
    generate("real", make_real_image, N_IMAGES)
    generate("fake", make_fake_image, N_IMAGES)
    print("\nDone. Now update configs/config.yaml if needed, then run:")
    print("  python scripts/train.py")


if __name__ == "__main__":
    main()
