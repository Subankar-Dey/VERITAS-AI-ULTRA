TRUSTED_SOURCES = {
    "Reuters":100,
    "Associated Press":100,
    "AP News":100,
    "BBC News":95,
    "The New York Times":95,
    "The Washington Post":95,
    "Bloomberg":95,
    "CNN":85,
    "CNBC":85,
    "ABC News":80,
    "NPR":85,
    "The Guardian":85,
    "Al Jazeera English":85
}


def calculate_trust(real_confidence, similarity, articles):
    """
    real_confidence: model's probability (0-100) that the input is REAL news,
    regardless of which label it predicted. Using the raw "confidence in
    whatever was predicted" here would push FAKE predictions toward a
    higher trust score the more confidently fake they are, which is wrong.
    """

    if len(articles) == 0:
        return 15, "❌ No Supporting Evidence", []

    matched = []

    scores = []

    for article in articles:

        source = article["source"]

        if source in TRUSTED_SOURCES:
            matched.append({
                "source": source,
                "title": article["title"],
                "url": article["url"],
            })
            scores.append(TRUSTED_SOURCES[source])

    if scores:
        source_score = sum(scores) / len(scores)
    else:
        source_score = 40

    trust = (
        real_confidence * 0.25 +
        similarity * 0.45 +
        source_score * 0.30
    )

    trust = min(100, round(trust,2))

    if trust >= 90:
        verdict = "✅ Verified"

    elif trust >= 75:
        verdict = "🟢 Highly Credible"

    elif trust >= 55:
        verdict = "🟡 Needs More Evidence"

    else:
        verdict = "🔴 Low Credibility"

    return trust, verdict, matched