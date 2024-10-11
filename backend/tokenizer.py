import tiktoken

class Tokenizer:
    def __init__(self, model="gpt-4o"):
        self.model = model
        self.encoding = tiktoken.encoding_for_model(model)
        self.max_tokens = 16384

    def tokenize(self, text):
        """Tokenize the input text using the specified model's encoding."""
        return self.encoding.encode(text)

    def detokenize(self, tokens):
        """Detokenize the input tokens back to text using the specified model's encoding."""
        return self.encoding.decode(tokens)

    def count_tokens(self, text):
        """Count the number of tokens in the input text."""
        return len(self.tokenize(text))
