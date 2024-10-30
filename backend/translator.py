from backend.openai_base import OpenAIBase
from backend.models.prompt_model import Prompt
from backend.models.database import db

class Translator(OpenAIBase):
    def __init__(self, api_key):
        super().__init__(api_key)

    def translate(self, text, system=None, user=None, model=None, openai_api_key=None):
        """Translate text to Bulgarian using OpenAI API."""
        try:
            # Fetch the last translation prompt from the database
            last_prompt = db.session.query(Prompt).filter_by(prompt_type='translation').order_by(Prompt.id.desc()).first()
            system_prompt = system or (last_prompt.system_message if last_prompt else "Translate the given text into Bulgarian language.")
            user_prompt = f"{user} {text}" if user else f"Text for translation: {text}. Translate the text and dont be lazy, translate the whole given text."

            if openai_api_key:
                self.set_api_key(openai_api_key)

            response = self.create_completion(
                model=model or "gpt-4o",  # Use provided model or default to gpt-4o
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
            )
            translation = response.choices[0].message.content
            return {"translation": translation, "usage": response.usage}
        except Exception as e:
            return str(e)
