"""
News Fake Detection Dataset Downloader & Organizer
====================================================
Downloads small, GitHub-available news image datasets and organizes
them into the real/ fake/ structure expected by the training pipeline.

Supported datasets
------------------
  1. NewsCLIPpings  -- Mismatched news image-text pairs  (~600 MB images)
                       github.com/g-luo/news_clippings
  2. Fakeddit       -- Reddit post images, labeled real/fake  (~2 GB sample)
                       github.com/entitize/Fakeddit
  3. FakeNewsNet    -- PolitiFact + GossipCop news images
                       github.com/KaiDMML/FakeNewsNet

Usage
-----
  python scripts/download_news_datasets.py --dataset newsclippings
  python scripts/download_news_datasets.py --dataset fakeddit
  python scripts/download_news_datasets.py --dataset fakenewsnet
  python scripts/download_news_datasets.py --dataset all
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import shutil
import json
import hashlib
import glob
import subprocess
import cv2

# ── output dirs ──────────────────────────────────────────────────────────────
OUT_NEWSCLIP  = "data/NewsCLIPpings"
OUT_FAKEDDIT  = "data/Fakeddit"
OUT_FAKENEWS  = "data/FakeNewsNet"
TMP_DIR       = "data/_tmp_download"


# ── helpers ───────────────────────────────────────────────────────────────────

def run(cmd: str) -> None:
    print(f"  $ {cmd}")
    ret = subprocess.run(cmd, shell=True)
    if ret.returncode != 0:
        sys.exit(f"[ERROR] Command failed: {cmd}")


def is_valid_image(path: str) -> bool:
    if not os.path.exists(path) or os.path.getsize(path) < 1024:
        return False
    img = cv2.imread(path)
    return img is not None


def sha16(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read(32768))
    return h.hexdigest()[:16]


def copy_image(src: str, dest_dir: str, seen: set) -> bool:
    if not is_valid_image(src):
        return False
    fhash = sha16(src)
    if fhash in seen:
        return False
    seen.add(fhash)
    ext = os.path.splitext(src)[1].lower() or ".jpg"
    dest = os.path.join(dest_dir, f"{fhash}{ext}")
    if not os.path.exists(dest):
        shutil.copy2(src, dest)
    return True


def makedirs(*paths: str) -> None:
    for p in paths:
        os.makedirs(p, exist_ok=True)


# ── Dataset 1: NewsCLIPpings ──────────────────────────────────────────────────

def download_newsclippings() -> None:
    """
    NewsCLIPpings uses VisualNews images with matched (real) and mismatched
    (fake) image-text pairs. We treat matched=real, mismatched=fake.

    Manual steps (images require VisualNews download separately):
      1. git clone https://github.com/g-luo/news_clippings
      2. Follow their README to download VisualNews image zip files
      3. Run this function pointing at the extracted folders
    """
    print("\n=== NewsCLIPpings Setup Instructions ===")
    print("""
STEP 1 — Clone the repo:
  git clone https://github.com/g-luo/news_clippings
  cd news_clippings

STEP 2 — Download VisualNews images (required by NewsCLIPpings):
  The dataset README links to a Google Drive with image zips (~600 MB).
  Download and extract to:  news_clippings/visual_news/origin/

STEP 3 — Run this script with --dataset newsclippings --src <path>:
  python scripts/download_news_datasets.py \\
      --dataset newsclippings \\
      --src "C:/path/to/news_clippings"
""")


def organize_newsclippings(src_root: str) -> None:
    """Organize already-downloaded NewsCLIPpings into real/ fake/."""
    ann_dir   = os.path.join(src_root, "news_clippings", "data")
    image_dir = os.path.join(src_root, "visual_news", "origin")

    if not os.path.exists(ann_dir):
        sys.exit(f"[ERROR] Annotations not found: {ann_dir}")
    if not os.path.exists(image_dir):
        sys.exit(f"[ERROR] VisualNews images not found: {image_dir}")

    real_out = os.path.join(OUT_NEWSCLIP, "real")
    fake_out = os.path.join(OUT_NEWSCLIP, "fake")
    makedirs(real_out, fake_out)

    seen_r: set = set()
    seen_f: set = set()
    n_real = n_fake = 0

    for json_file in glob.glob(os.path.join(ann_dir, "**", "*.json"), recursive=True):
        with open(json_file, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                continue

        pairs = data if isinstance(data, list) else data.get("data", [])
        is_fake = "mismatched" in json_file.lower() or "fake" in json_file.lower()

        for item in pairs:
            img_path = item.get("image_path") or item.get("image") or ""
            full_path = os.path.join(image_dir, img_path.lstrip("/"))
            if is_fake:
                if copy_image(full_path, fake_out, seen_f):
                    n_fake += 1
            else:
                if copy_image(full_path, real_out, seen_r):
                    n_real += 1

    print(f"  NewsCLIPpings → real: {n_real}  fake: {n_fake}")
    print(f"  Output: {OUT_NEWSCLIP}")


# ── Dataset 2: Fakeddit ───────────────────────────────────────────────────────

def download_fakeddit() -> None:
    """
    Fakeddit: Reddit posts with image + label (real/fake).
    Images are in a separate zip (~2 GB for sample).

    Manual steps:
      1. git clone https://github.com/entitize/Fakeddit
      2. Download public_image_set.tar.bz2 from the link in the README
      3. Run this script with --dataset fakeddit --src <path>
    """
    print("\n=== Fakeddit Setup Instructions ===")
    print("""
STEP 1 — Clone the repo:
  git clone https://github.com/entitize/Fakeddit
  cd Fakeddit

STEP 2 — Download images:
  The README links to a Google Drive with  public_image_set.tar.bz2  (~2 GB).
  Extract it inside the Fakeddit folder.

STEP 3 — Run this script with --dataset fakeddit --src <path>:
  python scripts/download_news_datasets.py \\
      --dataset fakeddit \\
      --src "C:/path/to/Fakeddit"
""")


def organize_fakeddit(src_root: str) -> None:
    """Organize already-downloaded Fakeddit into real/ fake/."""
    import csv

    image_dir = os.path.join(src_root, "public_image_set")
    if not os.path.exists(image_dir):
        sys.exit(f"[ERROR] Images not found at: {image_dir}")

    tsv_files = glob.glob(os.path.join(src_root, "*.tsv"))
    if not tsv_files:
        sys.exit(f"[ERROR] No .tsv label files found in: {src_root}")

    real_out = os.path.join(OUT_FAKEDDIT, "real")
    fake_out = os.path.join(OUT_FAKEDDIT, "fake")
    makedirs(real_out, fake_out)

    seen_r: set = set()
    seen_f: set = set()
    n_real = n_fake = 0

    for tsv in tsv_files:
        with open(tsv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                post_id = row.get("id", "")
                label   = row.get("2_way_label", row.get("label", ""))
                img_path = os.path.join(image_dir, post_id + ".jpg")
                if not os.path.exists(img_path):
                    img_path = os.path.join(image_dir, post_id + ".png")

                if label in ("1", "true", "real"):
                    if copy_image(img_path, real_out, seen_r):
                        n_real += 1
                elif label in ("0", "false", "fake"):
                    if copy_image(img_path, fake_out, seen_f):
                        n_fake += 1

    print(f"  Fakeddit → real: {n_real}  fake: {n_fake}")
    print(f"  Output: {OUT_FAKEDDIT}")


# ── Dataset 3: FakeNewsNet ────────────────────────────────────────────────────

def download_fakenewsnet() -> None:
    """
    FakeNewsNet: PolitiFact + GossipCop articles with images.
    Small (~few hundred MB), scraped on demand via their tool.
    """
    print("\n=== FakeNewsNet Setup Instructions ===")
    print("""
STEP 1 — Clone the repo and install:
  git clone https://github.com/KaiDMML/FakeNewsNet
  cd FakeNewsNet
  pip install -r requirements.txt

STEP 2 — Download the dataset (images + labels):
  python download_manager.py --site politifact --type fake  --feature news_article,image
  python download_manager.py --site politifact --type real  --feature news_article,image
  python download_manager.py --site gossipcop  --type fake  --feature news_article,image
  python download_manager.py --site gossipcop  --type real  --feature news_article,image

STEP 3 — Run this script with --dataset fakenewsnet --src <path>:
  python scripts/download_news_datasets.py \\
      --dataset fakenewsnet \\
      --src "C:/path/to/FakeNewsNet"
""")


def organize_fakenewsnet(src_root: str) -> None:
    """Organize already-downloaded FakeNewsNet into real/ fake/."""
    real_out = os.path.join(OUT_FAKENEWS, "real")
    fake_out = os.path.join(OUT_FAKENEWS, "fake")
    makedirs(real_out, fake_out)

    seen_r: set = set()
    seen_f: set = set()
    n_real = n_fake = 0

    data_root = os.path.join(src_root, "dataset")
    for site in ("politifact", "gossipcop"):
        for label in ("real", "fake"):
            label_dir = os.path.join(data_root, site, label)
            if not os.path.exists(label_dir):
                continue
            for img_path in glob.glob(os.path.join(label_dir, "**", "*.jpg"), recursive=True):
                out_dir = real_out if label == "real" else fake_out
                seen    = seen_r   if label == "real" else seen_f
                if copy_image(img_path, out_dir, seen):
                    if label == "real":
                        n_real += 1
                    else:
                        n_fake += 1
            for img_path in glob.glob(os.path.join(label_dir, "**", "*.png"), recursive=True):
                out_dir = real_out if label == "real" else fake_out
                seen    = seen_r   if label == "real" else seen_f
                if copy_image(img_path, out_dir, seen):
                    if label == "real":
                        n_real += 1
                    else:
                        n_fake += 1

    print(f"  FakeNewsNet → real: {n_real}  fake: {n_fake}")
    print(f"  Output: {OUT_FAKENEWS}")


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Download & organize news fake-detection datasets.")
    parser.add_argument("--dataset", required=True,
                        choices=["newsclippings", "fakeddit", "fakenewsnet", "all"],
                        help="Which dataset to set up")
    parser.add_argument("--src", default=None,
                        help="Path to already-downloaded dataset root (skip to see download instructions)")
    args = parser.parse_args()

    targets = (
        ["newsclippings", "fakeddit", "fakenewsnet"]
        if args.dataset == "all"
        else [args.dataset]
    )

    for ds in targets:
        if ds == "newsclippings":
            if args.src:
                organize_newsclippings(args.src)
            else:
                download_newsclippings()

        elif ds == "fakeddit":
            if args.src:
                organize_fakeddit(args.src)
            else:
                download_fakeddit()

        elif ds == "fakenewsnet":
            if args.src:
                organize_fakenewsnet(args.src)
            else:
                download_fakenewsnet()

    if not args.src:
        print("\nOnce downloaded, re-run with --src pointing to the dataset folder.")
        print("Then add the output dir to configs/config.yaml under dataset.train_dirs")
        print("and run:  python scripts/train.py")


if __name__ == "__main__":
    main()
