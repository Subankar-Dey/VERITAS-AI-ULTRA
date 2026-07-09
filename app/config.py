import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

if not NEWS_API_KEY:
    raise RuntimeError(
        "NEWS_API_KEY is not set. Create a .env file (see .env.example) "
        "with your NewsAPI key from https://newsapi.org."
    )