from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filehash = db.Column(db.String(64), unique=True, nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    page_count = db.Column(db.Integer, nullable=True)
    page_range = db.Column(db.String(50), nullable=True)
    system_prompt = db.Column(db.Text, nullable=True)
    user_prompt = db.Column(db.Text, nullable=True)

    def __init__(self, filename, filehash, file_path, page_count=None, page_range=None, system_prompt=None, user_prompt=None):
        self.filename = filename
        self.filehash = filehash
        self.file_path = file_path
        self.page_count = page_count
        self.page_range = page_range
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
