import openai

class OpenAIBase:
    def __init__(self, api_key):
        self.api_key = api_key
        openai.api_key = self.api_key
        self.max_tokens = 16384

    def create_completion(self, model, messages):
        try:
            response = openai.chat.completions.create(
                model=model,
                messages=messages
            )
            return response
        except openai.AuthenticationError as e:
            return {"error": "Invalid OpenAI API key. Please check your API key in settings."}
        except Exception as e:
            return {"error": str(e)}
    def set_api_key(self, api_key):
        openai.api_key = api_key
        self.api_key = api_key
