from backend.openai_base import OpenAIBase

class TextEditor(OpenAIBase):
    def __init__(self, api_key):
        super().__init__(api_key)

    def edit_text(self, text, system_prompt=None, user_prompt=None):
        """Edit text using OpenAI API."""
        user_prompt = f"{user_prompt} {text}" if user_prompt else f"Text for editing: {text}. Please edit the text as needed and dont be lazy."
        try:
            response = self.create_completion(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt or "Act as a proficient editor in Bulgarian language."},
                    {"role": "user", "content": user_prompt},
                ]
            )
            edited_text = response.choices[0].message.content
            return {"edited_text": edited_text, "usage": response.usage}
        except Exception as e:
            return str(e)
