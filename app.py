from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import openai
from dotenv import load_dotenv
import tiktoken
from backend.translator import Translator
from backend.file_uploader import FileUploader
from backend.text_extractor import TextExtractor
from backend.tokenizer import Tokenizer
from backend.models.file_model import db, File

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///storage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

openai.api_key = os.getenv('OPENAI_API_KEY')  # Load API key from environment

translator = Translator(api_key=os.getenv('OPENAI_API_KEY'))
file_uploader = FileUploader(upload_folder=app.config['UPLOAD_FOLDER'])
text_extractor = TextExtractor()
tokenizer = Tokenizer(model="gpt-4o")

# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint to upload a PDF file."""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        # Calculate the hash of the file
        filehash = hash(file.read())
        file.seek(0)  # Reset file pointer after reading

        # Check for duplicate files
        existing_file = File.query.filter_by(filehash=filehash).first()
        if existing_file:
            return jsonify({'error': 'Duplicate file detected'}), 400

        # Save the file and add to the database
        filepath = file_uploader.save_file(file)
        new_file = File(
            filename=file.filename,
            filehash=filehash,
            file_path=filepath,
            page_count=request.form.get('page_count', type=int),
            page_range=request.form.get('page_range'),
            system_prompt=request.form.get('system_prompt'),
            user_prompt=request.form.get('user_prompt')
        )
        db.session.add(new_file)
        db.session.commit()

        return jsonify({'message': 'File uploaded successfully', 'filepath': filepath}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/files', methods=['GET'])
def get_files():
    """Endpoint to get all file records from the database."""
    files = File.query.all()
    file_list = [{
        'id': f.id,
        'filename': f.filename,
        'file_path': f.file_path,
        'page_count': f.page_count,
        'page_range': f.page_range,
        'system_prompt': f.system_prompt,
        'user_prompt': f.user_prompt
    } for f in files]
    return jsonify(file_list), 200

@app.route('/files/<int:file_id>', methods=['PUT'])
def update_file_by_id(file_id):
    """Endpoint to update an existing file by ID."""
    file_record = File.query.get(file_id)
    if not file_record:
        return jsonify({'error': 'File not found'}), 404

    if 'pdf' in request.files:
        file = request.files['pdf']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and file.filename.endswith('.pdf'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file_record.filename)
            file.save(filepath)
            file_record.file_path = filepath

    # Update other fields
    file_record.page_count = request.form.get('page_count', type=int, default=file_record.page_count)
    file_record.page_range = request.form.get('page_range', file_record.page_range)
    file_record.system_prompt = request.form.get('system_prompt', file_record.system_prompt)
    file_record.user_prompt = request.form.get('user_prompt', file_record.user_prompt)

    db.session.commit()
    return jsonify({'message': 'File updated successfully'}), 200

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
