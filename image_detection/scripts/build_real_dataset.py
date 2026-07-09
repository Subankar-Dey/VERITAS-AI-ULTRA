"""
Build real training dataset from:
  1. Fakeddit  — download sample images from TSV image_url column
  2. FakeNewsNet — scrape og:image from politifact article URLs

Outputs:
  data/Fakeddit/real/   data/Fakeddit/fake/
  data/FakeNewsNet/real/ data/FakeNewsNet/fake/

Usage:
  python scripts/build_real_dataset.py --samples 150
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import hashlib
import time
import requests
import pandas as pd
import cv2
import numpy as np
from tqdm import tqdm
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
TIMEOUT = 8


# ── helpers ───────────────────────────────────────────────────────────────────

def sha16(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:16]


def is_valid_img(data: bytes) -> bool:
    if len(data) < 1024:
        return False
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return False
    h, w = img.shape[:2]
    return h >= 64 and w >= 64


def download_img(url: str, dest_dir: str, seen: set) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200 or "image" not in r.headers.get("Content-Type", ""):
            return False
        data = r.content
        if not is_valid_img(data):
            return False
        fhash = sha16(data)
        if fhash in seen:
            return False
        seen.add(fhash)
        path = os.path.join(dest_dir, f"{fhash}.jpg")
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(data)
        return True
    except Exception:
        return False


def scrape_og_image(url: str) -> str | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        tag = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
        if tag and tag.get("content"):
            return str(tag["content"])
        img = soup.find("article img") or soup.find("img")
        return str(img["src"]) if img and img.get("src") else None
    except Exception:
        return None


# ── Fakeddit ──────────────────────────────────────────────────────────────────

def build_fakeddit(samples: int) -> None:
    tsv = "data/Fakeddit/tsv_files/multimodal_only_samples/multimodal_train.tsv"
    if not os.path.exists(tsv):
        print("[SKIP] Fakeddit TSV not found — run download first.")
        return

    df = pd.read_csv(tsv, sep="\t", usecols=["id", "2_way_label", "image_url"])  # type: ignore[call-overload]
    df = df[df["image_url"].notna() & (df["image_url"] != "")]

    real_df = df[df["2_way_label"] == 0].sample(min(samples, len(df[df["2_way_label"]==0])), random_state=42)
    fake_df = df[df["2_way_label"] == 1].sample(min(samples, len(df[df["2_way_label"]==1])), random_state=42)

    real_out = "data/Fakeddit/real"
    fake_out = "data/Fakeddit/fake"
    os.makedirs(real_out, exist_ok=True)
    os.makedirs(fake_out, exist_ok=True)

    seen_r: set = set()
    seen_f: set = set()
    n_real = n_fake = 0

    print(f"\n[Fakeddit] Downloading {len(real_df)} REAL images...")
    for url in tqdm(real_df["image_url"], unit="img"):
        if download_img(url, real_out, seen_r):
            n_real += 1

    print(f"[Fakeddit] Downloading {len(fake_df)} FAKE images...")
    for url in tqdm(fake_df["image_url"], unit="img"):
        if download_img(url, fake_out, seen_f):
            n_fake += 1

    print(f"[Fakeddit] Done — real: {n_real}  fake: {n_fake}")


# ── FakeNewsNet ───────────────────────────────────────────────────────────────

def build_fakenewsnet(samples: int) -> None:
    dataset_dir = "data/FakeNewsNet/dataset"
    if not os.path.exists(dataset_dir):
        print("[SKIP] FakeNewsNet dataset folder not found.")
        return

    real_out = "data/FakeNewsNet/real"
    fake_out = "data/FakeNewsNet/fake"
    os.makedirs(real_out, exist_ok=True)
    os.makedirs(fake_out, exist_ok=True)

    seen_r: set = set()
    seen_f: set = set()
    n_real = n_fake = 0

    for csv_name, label, out_dir, seen in [
        ("politifact_fake.csv", "fake", fake_out, seen_f),
        ("politifact_real.csv", "real", real_out, seen_r),
        ("gossipcop_fake.csv",  "fake", fake_out, seen_f),
        ("gossipcop_real.csv",  "real", real_out, seen_r),
    ]:
        path = os.path.join(dataset_dir, csv_name)
        if not os.path.exists(path):
            continue

        df = pd.read_csv(path, usecols=["id", "news_url"])  # type: ignore[call-overload]
        df = df[df["news_url"].notna()].head(samples)

        print(f"\n[FakeNewsNet] Scraping {len(df)} {label.upper()} articles from {csv_name}...")
        for _, row in tqdm(df.iterrows(), total=len(df), unit="article"):
            url = row["news_url"]
            if not url.startswith("http"):
                url = "https://" + url
            img_url = scrape_og_image(url)
            if img_url:
                if not img_url.startswith("http"):
                    from urllib.parse import urljoin
                    img_url = urljoin(url, img_url)
                if download_img(img_url, out_dir, seen):
                    if label == "real":
                        n_real += 1
                    else:
                        n_fake += 1
            time.sleep(0.1)

    print(f"[FakeNewsNet] Done — real: {n_real}  fake: {n_fake}")


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", type=int, default=150,
                        help="Images to attempt per class per dataset (default: 150)")
    args = parser.parse_args()

    build_fakeddit(args.samples)
    build_fakenewsnet(args.samples)

    print("\n=== Dataset build complete ===")
    for d in ["data/Fakeddit/real", "data/Fakeddit/fake",
              "data/FakeNewsNet/real", "data/FakeNewsNet/fake"]:
        n = len(os.listdir(d)) if os.path.exists(d) else 0
        print(f"  {d}: {n} images")

    print("\nNow run:  python scripts/train.py")


if __name__ == "__main__":
    main()
