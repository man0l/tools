from flask import jsonify, request
from backend.models.translation_model import TranslationRecord
from backend.models.file_model import db, File
from backend.models.prompt_model import Prompt
from backend.models.user_model import User

class TranslationHandler:
    def __init__(self, translator, text_extractor):
        self.translator = translator
        self.text_extractor = text_extractor

    def init_translation(self, file_id, user_id):
        file_record = db.session.get(File, file_id)
        if not file_record or file_record.user_id != user_id:
            return jsonify({'error': 'File not found or unauthorized'}), 403

        existing_records = TranslationRecord.query.filter_by(file_id=file_id).first()
        if existing_records:
            return jsonify({'message': 'There are already translation records for this file'}), 400

        page_range = file_record.page_range
        start, end = map(int, page_range.split('-'))
        delta = end - start
        loops = file_record.page_count // delta

        for i in range(loops):
            start_page = i * delta
            end_page = start_page + delta
            page_range_str = f"{start_page}-{end_page}"
            new_translation = TranslationRecord(file_id=file_id, page_range=page_range_str, user_id=user_id)
            db.session.add(new_translation)

        db.session.commit()

        return jsonify({'message': f'Translation initiated successfully with {loops} records'}), 200

    def get_translations(self, file_id, user_id):
        file_record = db.session.get(File, file_id)
        if not file_record or file_record.user_id != user_id:
            return jsonify({'error': 'File not found or unauthorized'}), 403

        download_all = request.args.get('download_all', False, type=bool)
        
        if download_all:
            translations = TranslationRecord.query.filter_by(
                file_id=file_id, 
                user_id=user_id
            ).order_by(TranslationRecord.id).all()
        else:
            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 10, type=int)
            offset = (page - 1) * limit
    
            translations = TranslationRecord.query.filter_by(
                file_id=file_id, 
                user_id=user_id
            ).order_by(TranslationRecord.id).offset(offset).limit(limit).all()

        # Get total count for pagination
        total_translations = TranslationRecord.query.filter_by(
            file_id=file_id, 
            user_id=user_id
        ).count()

        translation_list = [{
            'id': t.id,
            'page_range': t.page_range,
            'extracted_text': t.extracted_text,
            'translated_text': t.translated_text,
            'edited_text': t.edited_text
        } for t in translations]

        return jsonify({
            'translations': translation_list,
            'total': total_translations
        }), 200

    def perform_extraction(self, translation_id, user_id):
        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record or translation_record.user_id != user_id:
            return jsonify({'error': 'Translation record not found or unauthorized'}), 403

        file_record = db.session.get(File, translation_record.file_id)
        user = db.session.get(User, user_id)
        start_page, end_page = map(int, translation_record.page_range.split('-'))
        extracted_text = self.text_extractor.extract_text(file_record.file_path, start_page, end_page, user)
        translation_record.extracted_text = extracted_text
        db.session.commit()

        return jsonify({'message': 'Text extracted successfully', 'extracted_text': extracted_text}), 200

    def translate_text(self, translation_id, user_id):
        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record or translation_record.user_id != user_id:
            return jsonify({'error': 'Translation record not found or unauthorized'}), 403

        # Get user's preferred model
        user = db.session.get(User, user_id)
        model = user.preferred_model if user else 'gpt-4o'

        # Get the last translation prompt from the database
        last_prompt = db.session.query(Prompt).filter_by(
            prompt_type='translation'
        ).order_by(Prompt.id.desc()).first()

        if not last_prompt:
            return jsonify({'error': 'No translation prompt found'}), 400

        translation_result = self.translator.translate(
            translation_record.extracted_text,
            last_prompt.system_message,
            last_prompt.user_message,
            model=model,
            openai_api_key=user.openai_api_key if user.openai_api_key else None
        )

        if 'translation' in translation_result:
            translated_text = translation_result['translation']
            translation_record.translated_text = translated_text
            db.session.commit()

            return jsonify({'message': 'Text translated successfully', 'translated_text': translated_text}), 200
        else:
            return jsonify({'error': translation_result }), 500

    def edit_text(self, translation_id, edited_text, user_id):
        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record or translation_record.user_id != user_id:
            return jsonify({'error': 'Translation record not found or unauthorized'}), 404

        translation_record.edited_text = edited_text
        db.session.commit()

        return jsonify({'message': 'Text edited successfully', 'edited_text': translation_record.edited_text}), 200

    def update_translation(self, translation_id, data, user_id):
        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record or translation_record.user_id != user_id:
            return jsonify({'error': 'Translation record not found or unauthorized'}), 403

        field = None
        value = None

        # Check which field is present in the payload
        for key in ['extracted_text', 'translated_text', 'edited_text']:
            if key in data:
                field = key
                value = data[key]
                break

        if not field:
            return {'error': 'No valid field provided'}, 400

        setattr(translation_record, field, value)
        db.session.commit()

        return {'message': 'Translation updated successfully', field: value}, 200
