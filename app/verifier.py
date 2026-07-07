import requests

from app.config import NEWS_API_KEY
from app.headline import extract_headline

URL = "https://newsapi.org/v2/everything"


def verify_news(news):

    headline = extract_headline(news)

    params = {
        "q": headline,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": 5,
        "apiKey": NEWS_API_KEY
    }

    response = requests.get(URL, params=params)

    data = response.json()

    articles = []

    if data.get("status") == "ok":

        for article in data.get("articles", []):

            articles.append({
                "title": article["title"],
                "source": article["source"]["name"],
                "url": article["url"]
            })

    return articles