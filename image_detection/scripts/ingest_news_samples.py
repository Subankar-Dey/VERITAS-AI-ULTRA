"""
News media sample ingestion script.

Usage
-----
python scripts/ingest_news_samples.py \
    --src   "path/to/raw_screenshots"  \
    --label real \
    --split  news_2026_q3

Directory layout produced
-------------------------
data/
  NewsMedia/
    real/
      news_2026_q3/
        <sha256>.jpg   ...
    fake/
      <split>/
        <sha256>.jpg   ...

Labels
------
  real  -> authentic screenshots (label 0)
  fake  -> AI-generated / manipulated screenshots (label 1)

Run this script once per batch of images you want to add.
After ingestion, re-run:  python scripts/train.py
"""

import argparse
import hashlib
import os
import shutil
import sys
import cv2
import glob

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MIN_FILE_BYTES  = 1024        # same threshold as DatasetPipelineFactory
MIN_DIMENSION   = 64          # reject tiny/corrupt images


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def is_valid_image(path: str) -> bool:
    if os.path.getsize(path) < MIN_FILE_BYTES:
        return False
    img = cv2.imread(path)
    if img is None:
        return False
    h, w = img.shape[:2]
    return h >= MIN_DIMENSION and w >= MIN_DIMENSION


def ingest(src_dir: str, label: str, split_name: str, base_data_dir: str) -> None:
    if label not in ("real", "fake"):
        sys.exit(f"[ERROR] --label must be 'real' or 'fake', got '{label}'")

    dest_dir = os.path.join(base_data_dir, "NewsMedia", label, split_name)
    os.makedirs(dest_dir, exist_ok=True)

    src_pattern = os.path.join(src_dir, "**", "*")
    candidates = [
        p for p in glob.glob(src_pattern, recursive=True)
        if os.path.isfile(p) and os.path.splitext(p)[1].lower() in SUPPORTED_EXTS
    ]

    if not candidates:
        sys.exit(f"[ERROR] No supported image files found in: {src_dir}")

    added, skipped, dupes = 0, 0, 0
    seen_hashes: set = set()

    for src_path in candidates:
        if not is_valid_image(src_path):
            print(f"  [SKIP] Invalid / too small: {src_path}")
            skipped += 1
            continue

        file_hash = sha256_of(src_path)

        if file_hash in seen_hashes:
            print(f"  [DUPE] Duplicate in batch: {src_path}")
            dupes += 1
            continue
        seen_hashes.add(file_hash)

        ext = os.path.splitext(src_path)[1].lower()
        dest_name = f"{file_hash}{ext}"
        dest_path = os.path.join(dest_dir, dest_name)

        if os.path.exists(dest_path):
            print(f"  [DUPE] Already in dataset: {dest_name}")
            dupes += 1
            continue

        shutil.copy2(src_path, dest_path)
        print(f"  [OK]   {os.path.basename(src_path)} -> {dest_name}")
        added += 1

    print(f"\nIngestion complete.")
    print(f"  Added  : {added}")
    print(f"  Skipped: {skipped}  (corrupt / too small)")
    print(f"  Dupes  : {dupes}  (already in dataset)")
    print(f"  Output : {dest_dir}")

    if label == "real":
        fake_dir = os.path.join(base_data_dir, "NewsMedia", "fake", split_name)
        if not os.path.exists(fake_dir) or not any(
            os.scandir(fake_dir)
        ):
            print(
                f"\n[WARNING] You added {added} REAL samples but the corresponding FAKE "
                f"directory is empty:\n  {fake_dir}\n"
                "  The classifier needs manipulated/AI-generated counterparts in that "
                "folder before retraining, or the model will be biased toward REAL."
            )


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest news screenshots into the training dataset.")
    parser.add_argument("--src",   required=True, help="Folder containing raw screenshot images")
    parser.add_argument("--label", required=True, choices=["real", "fake"],
                        help="'real' for authentic screenshots, 'fake' for AI-generated / manipulated ones")
    parser.add_argument("--split", default="batch_01",
                        help="Sub-folder name for this batch (e.g. news_2026_q3). Default: batch_01")
    parser.add_argument("--data-root", default="data",
                        help="Root data directory. Default: data")
    args = parser.parse_args()

    ingest(
        src_dir=args.src,
        label=args.label,
        split_name=args.split,
        base_data_dir=args.data_root,
    )


if __name__ == "__main__":
    main()
