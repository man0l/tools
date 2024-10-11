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
from backend.translator import Translator
from backend.file_uploader import FileUploader
from backend.text_extractor import TextExtractor
from backend.tokenizer import Tokenizer

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

openai.api_key = os.getenv('OPENAI_API_KEY')  # Load API key from environment


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
    system_prompt = request.form.get('systemPrompt', None)
    user_prompt = request.form.get('userPrompt', None)
    
    filepath = file_uploader.save_file(file)

    try:
        extracted_text = text_extractor.extract_text(filepath, start_page, end_page)
        if extracted_text:
            translation = translator.translate(extracted_text, system_prompt, user_prompt)
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
