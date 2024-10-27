from flask import jsonify, request
from backend.text_editor import TextEditor
from backend.models.translation_model import TranslationRecord
from backend.models.file_model import db

class EditHandler:
    def __init__(self, text_editor: TextEditor):
        self.text_editor = text_editor

    def edit_text(self, translation_id, user_id):
        print("Received request with headers:", request.headers)
        print("Received request with body:", request.get_data())

        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record or translation_record.user_id != user_id:
            return jsonify({'error': 'Translation record not found or unauthorized'}), 403

        # Use TextEditor to perform editing operations
        try:
            edit_result = self.text_editor.edit_text(
                text=translation_record.translated_text
            )
            
            if isinstance(edit_result, str):
                return jsonify({'error': edit_result}), 500

            translation_record.edited_text = edit_result['edited_text']
            db.session.commit()

            return jsonify({'message': 'Text edited successfully', 'edited_text': translation_record.edited_text}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
