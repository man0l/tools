from flask import Flask, jsonify, request
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
from backend.models.database import db
from backend.models.file_model import File
from backend.models.translation_model import TranslationRecord
from backend.models.prompt_model import Prompt
from backend.models.user_model import User
from backend.file_handler import FileHandler
from backend.translation_handler import TranslationHandler
from backend.edit_handler import EditHandler
from backend.text_editor import TextEditor
from backend.prompt_handler import PromptHandler
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from datetime import timedelta
from backend.auth_handler import auth_bp

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development purposes

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///storage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

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
prompt_handler = PromptHandler()

app.register_blueprint(auth_bp, url_prefix='/auth')

with app.app_context():
    db.create_all()

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = get_jwt_identity()
    return file_handler.upload_file(current_user_id)

@app.route('/files', methods=['GET'])
@jwt_required()
def get_files():
    current_user_id = get_jwt_identity()
    return file_handler.get_files(current_user_id)

@app.route('/files/<int:file_id>', methods=['PUT'])
@jwt_required()
def update_file_by_id(file_id):
    current_user_id = get_jwt_identity()
    return file_handler.update_file_by_id(file_id, current_user_id)

@app.route('/files/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_file_by_id(file_id):
    current_user_id = get_jwt_identity()
    return file_handler.delete_file_by_id(file_id, current_user_id)

@app.route('/init_translation/<int:file_id>', methods=['POST'])
@jwt_required()
def init_translation(file_id):
    current_user_id = get_jwt_identity()
    return translation_handler.init_translation(file_id, current_user_id)

@app.route('/translations/<int:file_id>', methods=['GET'])
@jwt_required()
def get_translations(file_id):
    current_user_id = get_jwt_identity()
    return translation_handler.get_translations(file_id, current_user_id)

@app.route('/perform_extraction/<int:translation_id>', methods=['POST'])
@jwt_required()
def perform_extraction(translation_id):
    current_user_id = get_jwt_identity()
    return translation_handler.perform_extraction(translation_id, current_user_id)

@app.route('/translate/<int:translation_id>', methods=['POST'])
@jwt_required()
def translate_text(translation_id):
    current_user_id = get_jwt_identity()
    return translation_handler.translate_text(translation_id, current_user_id)

@app.route('/edit/<int:translation_id>', methods=['POST'])
@jwt_required()
def edit_text(translation_id):    
    current_user_id = get_jwt_identity()
    return edit_handler.edit_text(translation_id, current_user_id)

@app.route('/update-translation/<int:translation_id>', methods=['POST'])
@jwt_required()
def update_translation(translation_id):
    current_user_id = get_jwt_identity()
    data = request.json
    return translation_handler.update_translation(translation_id, data, current_user_id)

@app.route('/test-translation', methods=['POST'])
@jwt_required()
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
@jwt_required()
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

@app.route('/prompts', methods=['GET'])
@jwt_required()
def handle_get_prompts():
    current_user_id = get_jwt_identity()
    return prompt_handler.get_prompts(current_user_id)

@app.route('/prompts', methods=['POST'])
@jwt_required()
def handle_create_prompt():
    current_user_id = get_jwt_identity()
    return prompt_handler.create_prompt(current_user_id)

@app.route('/prompts/<int:prompt_id>', methods=['PUT'])
@jwt_required()
def handle_update_prompt(prompt_id):
    current_user_id = get_jwt_identity()  # Retrieve the current user's ID
    return prompt_handler.update_prompt(prompt_id, current_user_id)  # Pass user_id here

@app.route('/prompts/<int:prompt_id>', methods=['DELETE'])
@jwt_required()
def handle_delete_prompt(prompt_id):
    current_user_id = get_jwt_identity()
    return prompt_handler.delete_prompt(prompt_id, current_user_id)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
