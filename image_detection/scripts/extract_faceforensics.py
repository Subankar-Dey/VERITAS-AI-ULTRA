"""
FaceForensics++ Frame Extractor
================================
Extracts training frames from FaceForensics++ videos and places them
in the directory structure expected by the training pipeline.

Expected FaceForensics++ folder layout after download
------------------------------------------------------
<ff_root>/
  original_sequences/
    youtube/
      raw/         (or c23/ or c40/)
        videos/
          000.mp4, 001.mp4, ...
  manipulated_sequences/
    Deepfakes/
      raw/
        videos/
          000_001.mp4, ...
    Face2Face/
      raw/ ...
    FaceSwap/
      raw/ ...
    NeuralTextures/
      raw/ ...
    FaceShifter/
      raw/ ...   (if downloaded)

Output
------
data/FaceForensics/
  real/    <- frames from original_sequences
  fake/    <- frames from all manipulated_sequences

Usage
-----
# Step 1 — download dataset (need access key from authors):
#   python download-FaceForensics.py <ff_root> -d all -c c23 -t videos

# Step 2 — extract frames:
python scripts/extract_faceforensics.py --ff-root "D:/datasets/FaceForensics" --compression c23

Options
-------
  --ff-root       Path to downloaded FaceForensics++ root folder
  --compression   raw | c23 | c40  (default: c23, good balance of size/quality)
  --fps           Frames to extract per second of video (default: 1)
  --max-frames    Max frames per video (default: 30)
  --out-dir       Output base dir (default: data/FaceForensics)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import hashlib
import cv2
import glob
from tqdm import tqdm

FAKE_METHODS = [
    "Deepfakes",
    "Face2Face",
    "FaceSwap",
    "NeuralTextures",
    "FaceShifter",
]


def sha256_short(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read(65536))
    return h.hexdigest()[:12]


def extract_frames(
    video_path: str,
    out_dir: str,
    fps: int,
    max_frames: int,
    seen_hashes: set,
) -> int:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0

    video_fps = cap.get(cv2.CAP_PROP_FPS) or 25
    interval = max(1, int(video_fps / fps))

    saved = 0
    frame_idx = 0

    while saved < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % interval == 0:
            tmp_path = os.path.join(out_dir, f"_tmp_{frame_idx}.jpg")
            cv2.imwrite(tmp_path, frame)
            fhash = sha256_short(tmp_path)
            dest = os.path.join(out_dir, f"{fhash}.jpg")
            if fhash in seen_hashes or os.path.exists(dest):
                os.remove(tmp_path)
            else:
                os.rename(tmp_path, dest)
                seen_hashes.add(fhash)
                saved += 1
        frame_idx += 1

    cap.release()
    return saved


def process_split(
    video_dir: str,
    out_dir: str,
    label: str,
    fps: int,
    max_frames: int,
    seen_hashes: set,
) -> int:
    os.makedirs(out_dir, exist_ok=True)
    videos = glob.glob(os.path.join(video_dir, "**", "*.mp4"), recursive=True)
    videos += glob.glob(os.path.join(video_dir, "**", "*.avi"), recursive=True)

    if not videos:
        print(f"  [WARN] No videos found in: {video_dir}")
        return 0

    total = 0
    for vp in tqdm(videos, desc=f"  {label}", unit="vid"):
        total += extract_frames(vp, out_dir, fps, max_frames, seen_hashes)
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract frames from FaceForensics++ into training layout.")
    parser.add_argument("--ff-root",     required=True, help="Root folder of downloaded FaceForensics++")
    parser.add_argument("--compression", default="c23", choices=["raw", "c23", "c40"],
                        help="Compression level used during download (default: c23)")
    parser.add_argument("--fps",         type=int, default=1,
                        help="Frames to extract per second of video (default: 1)")
    parser.add_argument("--max-frames",  type=int, default=30,
                        help="Max frames to extract per video (default: 30)")
    parser.add_argument("--out-dir",     default="data/FaceForensics",
                        help="Output directory (default: data/FaceForensics)")
    args = parser.parse_args()

    real_video_dir = os.path.join(
        args.ff_root, "original_sequences", "youtube", args.compression, "videos"
    )
    real_out = os.path.join(args.out_dir, "real")
    fake_out = os.path.join(args.out_dir, "fake")

    if not os.path.exists(real_video_dir):
        sys.exit(
            f"[ERROR] Could not find original videos at:\n  {real_video_dir}\n"
            f"Check --ff-root and --compression match your downloaded folder."
        )

    seen_real: set = set()
    seen_fake: set = set()

    print(f"\n=== FaceForensics++ Frame Extractor ===")
    print(f"Source : {args.ff_root}")
    print(f"Compression: {args.compression}  |  FPS: {args.fps}  |  Max frames/video: {args.max_frames}\n")

    print("[1/2] Extracting REAL frames (original_sequences)...")
    n_real = process_split(real_video_dir, real_out, "real", args.fps, args.max_frames, seen_real)

    print("\n[2/2] Extracting FAKE frames (manipulated_sequences)...")
    n_fake = 0
    for method in FAKE_METHODS:
        fake_video_dir = os.path.join(
            args.ff_root, "manipulated_sequences", method, args.compression, "videos"
        )
        if not os.path.exists(fake_video_dir):
            print(f"  [SKIP] {method} not found — skipping")
            continue
        n_fake += process_split(fake_video_dir, fake_out, method, args.fps, args.max_frames, seen_fake)

    print(f"\n=== Done ===")
    print(f"  Real frames : {n_real:,}  →  {real_out}")
    print(f"  Fake frames : {n_fake:,}  →  {fake_out}")
    print(f"\nNow run:  python scripts/train.py")


if __name__ == "__main__":
    main()
