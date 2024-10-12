from flask import request, jsonify
from backend.models.file_model import db, File

class FileHandler:
    def __init__(self, file_uploader):
        self.file_uploader = file_uploader

    def upload_file(self):
        if 'pdf' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['pdf']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and file.filename.endswith('.pdf'):
            filehash = hash(file.read())
            file.seek(0)

            existing_file = File.query.filter_by(filehash=filehash).first()
            if existing_file:
                return jsonify({'error': 'Duplicate file detected'}), 400

            filepath = self.file_uploader.save_file(file)
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

    def get_files(self):
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

    def update_file_by_id(self, file_id):
        file_record = db.session.get(File, file_id)
        if not file_record:
            return jsonify({'error': 'File not found'}), 404

        data = request.json
        file_record.page_count = data.get('page_count', file_record.page_count)
        file_record.page_range = data.get('page_range', file_record.page_range)
        file_record.system_prompt = data.get('system_prompt', file_record.system_prompt)
        file_record.user_prompt = data.get('user_prompt', file_record.user_prompt)

        db.session.commit()
        return jsonify({'message': 'File updated successfully'}), 200

    def delete_file_by_id(self, file_id):
        file_record = db.session.get(File, file_id)
        if not file_record:
            return jsonify({'error': 'File not found'}), 404

        db.session.delete(file_record)
        db.session.commit()
        return jsonify({'message': 'File deleted successfully'}), 200
