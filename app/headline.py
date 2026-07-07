import re


def extract_headline(news):

    # Remove extra spaces
    news = " ".join(news.split())

    # Use first sentence
    sentence = news.split(".")[0]

    # Remove punctuation
    sentence = re.sub(r"[^\w\s]", "", sentence)

    # Keep first 10 words
    words = sentence.split()

    headline = " ".join(words[:10])

    return headline