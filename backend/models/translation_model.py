from datetime import datetime
from backend.models.database import db
from backend.models.file_model import File

class TranslationRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    translated_text = db.Column(db.Text, nullable=True)
    edited_text = db.Column(db.Text, nullable=True)
    page_range = db.Column(db.String, nullable=True)  # Renamed field for page range
    date_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    edited_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    file = db.relationship('File', backref=db.backref('translation_records', lazy=True, cascade="all, delete-orphan"))
    user = db.relationship('User', backref=db.backref('translation_records', lazy=True))
