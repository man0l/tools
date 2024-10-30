from backend.openai_base import OpenAIBase
from backend.models.prompt_model import Prompt
from backend.models.file_model import db

class TextEditor(OpenAIBase):
    def __init__(self, api_key):
        super().__init__(api_key)

    def edit_text(self, text, system_prompt=None, user_prompt=None, model="gpt-4o", openai_api_key=None):
        """Edit text using OpenAI API."""
        try:
            # Fetch the last editing prompt from the database
            last_prompt = db.session.query(Prompt).filter_by(prompt_type='editing').order_by(Prompt.id.desc()).first()
            system_prompt = system_prompt or (last_prompt.system_message if last_prompt else "Act as a proficient editor in Bulgarian language.")
            user_prompt = f"{text} {user_prompt}" if user_prompt else f"Text for editing: {text}. Please edit the text as needed and dont be lazy."

            if openai_api_key:
                self.set_api_key(openai_api_key)

            response = self.create_completion(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
            )
            edited_text = response.choices[0].message.content
            return {"edited_text": edited_text, "usage": response.usage}
        except Exception as e:
            return {"error": str(e), "edited_text": None}
