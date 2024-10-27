from backend.models.database import db

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filehash = db.Column(db.String(64), unique=True, nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    page_count = db.Column(db.Integer, nullable=True)
    page_range = db.Column(db.String(50), nullable=True)
    system_prompt = db.Column(db.Text, nullable=True)
    user_prompt = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=db.func.now(), nullable=False)

    user = db.relationship('User', backref=db.backref('files', lazy=True))

    def __init__(self, filename, filehash, file_path, user_id, page_count=None, page_range=None, system_prompt=None, user_prompt=None, uploaded_at=None):
        self.filename = filename
        self.filehash = filehash
        self.file_path = file_path
        self.user_id = user_id
        self.page_count = page_count
        self.page_range = page_range
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        self.uploaded_at = uploaded_at

