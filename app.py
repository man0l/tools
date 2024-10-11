from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import openai
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from dotenv import load_dotenv
import tiktoken

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

openai.api_key = os.getenv('OPENAI_API_KEY')  # Load API key from environment

class Translator:
    def __init__(self, api_key):
        self.api_key = api_key
        openai.api_key = self.api_key
        self.max_tokens = 16384

    def translate(self, text):
        """Translate text to Bulgarian using OpenAI API."""
        try:
            response = openai.chat.completions.create(
                model="gpt-4o", #https://platform.openai.com/docs/models/gpt-4o
                messages=[
                    {"role": "system", "content": "Translate the given text into Bulgarian language."},
                    {"role": "user", "content": f"Text for translation: {text}. Translate the text and dont be lazy, translate the whole given text."},
                ]
            )
            translation = response.choices[0].message.content
            return {"translation": translation, "usage": response.usage}
        except Exception as e:
            return str(e)

class FileUploader:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def save_file(self, file):
        """Save uploaded file to the specified folder."""
        filepath = os.path.join(self.upload_folder, file.filename)
        file.save(filepath)
        return filepath

class TextExtractor:
    def extract_text(self, filepath, start_page, end_page):
        """Extract text from a PDF file using PyMuPDF and OCR if necessary."""
        try:
            doc = fitz.open(filepath)  # Open the PDF with PyMuPDF
            extracted_text = ""
            start_page = max(0, start_page)
            end_page = min(end_page, doc.page_count - 1)

            for page_num in range(start_page, end_page + 1):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")

                # If no text is found, apply OCR
                if not page_text.strip():
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    page_text = pytesseract.image_to_string(img)

                extracted_text += page_text
            
            doc.close()
            return extracted_text
        except Exception as e:
            raise RuntimeError(f'Failed to process the PDF: {str(e)}')

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

translator = Translator(api_key=os.getenv('OPENAI_API_KEY'))
file_uploader = FileUploader(upload_folder=app.config['UPLOAD_FOLDER'])
text_extractor = TextExtractor()
tokenizer = Tokenizer(model="gpt-4o")

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint to upload a PDF file."""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        filepath = file_uploader.save_file(file)
        return jsonify({'message': 'File uploaded successfully', 'filepath': filepath}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/test-translation', methods=['POST'])
def test_translation():
    """Endpoint to test translation of text extracted from a PDF file."""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    start_page = int(request.form.get('startPage', 1)) - 1  # Convert to 0-based index
    end_page = int(request.form.get('endPage', start_page + 1)) - 1  # Convert to 0-based index
    
    filepath = file_uploader.save_file(file)

    try:
        extracted_text = text_extractor.extract_text(filepath, start_page, end_page)
        if extracted_text:
            translation = translator.translate(extracted_text)
            return jsonify({'translation': translation['translation'], 'completionTokens': translation['usage'].completion_tokens, 'promptTokens': translation['usage'].prompt_tokens, 'extractedText': extracted_text}), 200
        else:
            return jsonify({'error': 'No text found in the PDF'}), 400
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/extract-text', methods=['POST'])
def extract_text():
    """Endpoint to extract text from a PDF file."""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    start_page = int(request.form.get('startPage', 1)) - 1
    end_page = int(request.form.get('endPage', start_page + 1)) - 1

    filepath = file_uploader.save_file(file)

    try:
        extracted_text = text_extractor.extract_text(filepath, start_page, end_page)
        tokenized_text = tokenizer.tokenize(extracted_text)
        if extracted_text:
            return jsonify({'extractedText': extracted_text, 'numTokens': len(tokenized_text), 'maxTokens': tokenizer.max_tokens }), 200
        else:
            return jsonify({'error': 'No text found in the PDF'}), 400
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
