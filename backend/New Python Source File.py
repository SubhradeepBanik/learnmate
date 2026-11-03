"""Prints the Gemini models available to your API key."""

from google import genai

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
for model in client.models.list():
    actions = model.supported_actions or []
    if "generateContent" in actions or "embedContent" in actions:
        print(model.name.replace("models/", ""), "->", ", ".join(actions))