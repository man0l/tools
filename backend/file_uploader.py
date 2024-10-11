import os

class FileUploader:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def save_file(self, file):
        """Save uploaded file to the specified folder."""
        filepath = os.path.join(self.upload_folder, file.filename)
        file.save(filepath)
        return filepath
