"""
Fetches recent real news headlines from NewsAPI's top-headlines endpoint
(trusted, curated news outlets) across several categories, and writes them
to news_data/real.csv as (text,label) rows with label=REAL.
"""

import csv
import re
import time
from pathlib import Path

import requests

from app.config import NEWS_API_KEY

URL = "https://newsapi.org/v2/top-headlines"
CATEGORIES = ["general", "business", "technology", "health", "science", "sports", "entertainment"]
OUT_PATH = Path(__file__).resolve().parent.parent / "news_data" / "real.csv"


def strip_source_suffix(title: str, source_name: str) -> str:
    """
    NewsAPI titles are formatted as "Headline - Source Name" (e.g. "... - AP
    News", "... - Bloomberg.com"). Left in, this is a dead giveaway the fake
    dataset never has, so the model learns to spot that pattern instead of
    reading the actual content. Strip it before training on the text.
    """
    suffix = f" - {source_name}"
    if title.endswith(suffix):
        return title[: -len(suffix)]
    # Fallback: strip any trailing " - <a few capitalized words>" pattern
    return re.sub(r"\s+-\s+[A-Z][\w.]*(?:\s+[A-Z][\w.]*){0,3}$", "", title)


def fetch_category(category):
    params = {
        "category": category,
        "language": "en",
        "pageSize": 30,
        "apiKey": NEWS_API_KEY,
    }
    response = requests.get(URL, params=params)
    data = response.json()

    if data.get("status") != "ok":
        print(f"  [{category}] error: {data.get('message')}")
        return []

    rows = []
    for article in data.get("articles", []):
        title = (article.get("title") or "").strip()
        description = (article.get("description") or "").strip()
        source_name = (article.get("source") or {}).get("name", "")

        if not title:
            continue

        title = strip_source_suffix(title, source_name)
        text = f"{title}. {description}".strip()
        rows.append(text)

    return rows


def main():
    seen = set()
    all_rows = []

    for category in CATEGORIES:
        print(f"Fetching category: {category}")
        rows = fetch_category(category)

        for text in rows:
            if text not in seen:
                seen.add(text)
                all_rows.append(text)

        time.sleep(1)

    print(f"Collected {len(all_rows)} unique real news items")

    OUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        for text in all_rows:
            writer.writerow([text, "REAL"])

    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
