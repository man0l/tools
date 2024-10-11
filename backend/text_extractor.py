import fitz  # PyMuPDF
import io
from PIL import Image
import pytesseract

class TextExtractor:
    def extract_text(self, filepath, start_page, end_page):
        """Extract text from a PDF file using PyMuPDF and OCR if necessary."""
        try:
            doc = fitz.open(filepath)  # Open the PDF with PyMuPDF
            extracted_text = ""
            start_page = max(0, start_page)
            end_page = min(end_page, doc.page_count - 1)

            for page_num in range(start_page, end_page + 1):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")

                # If no text is found, apply OCR
                if not page_text.strip():
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    page_text = pytesseract.image_to_string(img)

                extracted_text += page_text
            
            doc.close()
            return extracted_text
        except Exception as e:
            raise RuntimeError(f'Failed to process the PDF: {str(e)}')
