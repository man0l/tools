import openai
import os

class Translator:
    def __init__(self, api_key):
        self.api_key = api_key
        openai.api_key = self.api_key
        self.max_tokens = 16384

    def translate(self, text, system, user):
        """Translate text to Bulgarian using OpenAI API."""
        user_prompt = f"{user} {text}" if user else f"Text for translation: {text}. Translate the text and dont be lazy, translate the whole given text."
        try:
            response = openai.chat.completions.create(
                model="gpt-4o", #https://platform.openai.com/docs/models/gpt-4o
                messages=[
                    {"role": "system", "content": system or "Translate the given text into Bulgarian language."},
                    {"role": "user", "content": user_prompt},
                ]
            )
            translation = response.choices[0].message.content
            return {"translation": translation, "usage": response.usage}
        except Exception as e:
            return str(e)
