"""
Samples fake-labeled rows from the GonzaloA/fake_news dataset on Hugging Face
(a WELFake-derived combination of several public fake-news corpora) and
writes them to news_data/fake.csv as (text,label) rows with label=FAKE.

Text is trimmed to a short "title + first sentence" snippet so its length
distribution matches news_data/real.csv (which only has NewsAPI title +
description snippets, ~150-300 chars). Without this, the fake examples
(full multi-paragraph articles) are trivially distinguishable from the real
examples by length/format alone, and the model learns that shortcut instead
of anything about truthfulness.
"""

import csv
import random
import re
from pathlib import Path

from datasets import load_dataset

SAMPLE_SIZE = 150
MAX_SNIPPET_CHARS = 300
OUT_PATH = Path(__file__).resolve().parent.parent / "news_data" / "fake.csv"


def first_sentence(body: str) -> str:
    match = re.search(r"[.!?]", body)
    if match:
        return body[: match.end()]
    return body


def main():
    ds = load_dataset("GonzaloA/fake_news")["train"]

    fake_rows = [row for row in ds if row["label"] == 0]
    print(f"Found {len(fake_rows)} fake-labeled rows in source dataset")

    random.seed(42)
    sample = random.sample(fake_rows, min(SAMPLE_SIZE, len(fake_rows)))

    OUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])

        written = 0
        for row in sample:
            title = (row["title"] or "").strip()
            snippet = first_sentence((row["text"] or "").strip())
            text = f"{title}. {snippet}".strip()[:MAX_SNIPPET_CHARS]

            if text:
                writer.writerow([text, "FAKE"])
                written += 1

    print(f"Wrote {written} rows to {OUT_PATH}")


if __name__ == "__main__":
    main()
