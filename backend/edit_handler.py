from flask import jsonify
from backend.text_editor import TextEditor
from backend.models.translation_model import TranslationRecord
from backend.models.file_model import db

class EditHandler:
    def __init__(self, text_editor: TextEditor):
        self.text_editor = text_editor

    def edit_text(self, translation_id):
        translation_record = db.session.get(TranslationRecord, translation_id)
        if not translation_record:
            return jsonify({'error': 'Translation record not found'}), 404

        # Use TextEditor to perform editing operations
        edit_result = self.text_editor.edit_text(
            text=translation_record.translated_text
        )
        
        if isinstance(edit_result, str):
            return jsonify({'error': edit_result}), 500

        translation_record.edited_text = edit_result['edited_text']
        db.session.commit()

        return jsonify({'message': 'Text edited successfully', 'edited_text': translation_record.edited_text}), 200
