from sentence_transformers import SentenceTransformer, util

# Load the model once
model = SentenceTransformer("all-MiniLM-L6-v2")


def calculate_similarity(user_news, articles):
    """
    Compare user input with all retrieved news articles.
    Returns:
        best_score (0-100)
        best_article (dict)
    """

    if not articles:
        return 0, None

    user_embedding = model.encode(user_news, convert_to_tensor=True)

    best_score = 0
    best_article = None

    for article in articles:

        article_text = article["title"]

        article_embedding = model.encode(
            article_text,
            convert_to_tensor=True
        )

        similarity = util.cos_sim(
            user_embedding,
            article_embedding
        ).item()

        similarity = round(similarity * 100, 2)

        if similarity > best_score:
            best_score = similarity
            best_article = article

    return best_score, best_article