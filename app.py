from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import openai
from dotenv import load_dotenv
from backend.translator import Translator
from backend.file_uploader import FileUploader
from backend.text_extractor import TextExtractor
from backend.tokenizer import Tokenizer
from backend.models.file_model import db, File
from backend.models.translation_model import TranslationRecord
from backend.file_handler import FileHandler
from backend.translation_handler import TranslationHandler
from backend.edit_handler import EditHandler
from backend.text_editor import TextEditor

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development purposes

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///storage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

openai.api_key = os.getenv('OPENAI_API_KEY')

translator = Translator(api_key=os.getenv('OPENAI_API_KEY'))
text_extractor = TextExtractor()
file_uploader = FileUploader(upload_folder=app.config['UPLOAD_FOLDER'])
tokenizer = Tokenizer(model="gpt-4o")
text_editor = TextEditor(api_key=os.getenv('OPENAI_API_KEY'))

file_handler = FileHandler(file_uploader)
translation_handler = TranslationHandler(translator, text_extractor)
edit_handler = EditHandler(text_editor)

with app.app_context():
    db.create_all()

@app.route('/upload', methods=['POST'])
def upload_file():
    return file_handler.upload_file()

@app.route('/files', methods=['GET'])
def get_files():
    return file_handler.get_files()

@app.route('/files/<int:file_id>', methods=['PUT'])
def update_file_by_id(file_id):
    return file_handler.update_file_by_id(file_id)

@app.route('/files/<int:file_id>', methods=['DELETE'])
def delete_file_by_id(file_id):
    return file_handler.delete_file_by_id(file_id)

@app.route('/init_translation/<int:file_id>', methods=['POST'])
def init_translation(file_id):
    return translation_handler.init_translation(file_id)

@app.route('/translations/<int:file_id>', methods=['GET'])
def get_translations(file_id):
    return translation_handler.get_translations(file_id)

@app.route('/perform_extraction/<int:translation_id>', methods=['POST'])
def perform_extraction(translation_id):
    return translation_handler.perform_extraction(translation_id)

@app.route('/translate/<int:translation_id>', methods=['POST'])
def translate_text(translation_id):
    return translation_handler.translate_text(translation_id)

@app.route('/edit/<int:translation_id>', methods=['POST'])
def edit_text(translation_id):    
    return edit_handler.edit_text(translation_id)

@app.route('/update-translation/<int:translation_id>', methods=['POST'])
def update_translation(translation_id):
    data = request.json
    return translation_handler.update_translation(translation_id, data)

@app.route('/test-translation', methods=['POST'])
def test_translation():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    start_page = int(request.form.get('startPage', 1)) - 1
    end_page = int(request.form.get('endPage', start_page + 1)) - 1
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
