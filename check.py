import sys

sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]

from app.predictor import predict_news
from app.verifier import verify_news
from app.similarity import calculate_similarity
from app.credibility import calculate_trust

news = """Resistance and revenge - Iran wanted to send a message with its farewell to Khamenei - BBC. Three days of public mourning in Tehran was a political spectacle Iran's leaders wanted the world to see, writes the BBC's international correspondent Lyse Doucet."""

label, confidence, real_confidence = predict_news(news)
print(f"Model prediction: {label} ({confidence}% confidence)")
print(f"Model's probability this is REAL: {real_confidence}%")

articles = verify_news(news)
print(f"\nArticles found: {len(articles)}")
for a in articles:
    print(f" - [{a['source']}] {a['title']}\n   {a['url']}")

similarity_score, best_article = calculate_similarity(news, articles)
print(f"\nBest similarity: {similarity_score}%")
if best_article:
    print(f"Best matching article: [{best_article['source']}] {best_article['title']}")
    print(f"  {best_article['url']}")

trust, verdict, matched_sources = calculate_trust(real_confidence, similarity_score, articles)

print(f"\nOverall verdict: {verdict} (trust score {trust}/100)")
if matched_sources:
    print("Matched trusted sources:")
    for m in matched_sources:
        print(f" - [{m['source']}] {m['title']}\n   {m['url']}")
else:
    print("Matched trusted sources: none")
