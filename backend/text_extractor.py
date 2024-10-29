import fitz  # PyMuPDF
import io
from PIL import Image
import pytesseract
import os

class TextExtractor:
    def extract_text(self, filepath, start_page, end_page):
        """Extract text from a PDF file using PyMuPDF and OCR if necessary."""
        try:
            doc = fitz.open(filepath)  # Open the PDF with PyMuPDF
            extracted_text = ""
            start_page = max(0, start_page)
            end_page = min(end_page, doc.page_count - 1)
            
            # Check if OCR is forced via environment variable
            force_ocr = os.getenv('FORCE_OCR', '').lower() == 'true'

            for page_num in range(start_page, end_page + 1):
                page = doc.load_page(page_num)
                page_text = ""
                
                # If OCR is not forced, try to get text normally first
                if not force_ocr:
                    page_text = page.get_text("text")

                # Apply OCR if forced or if no text was found
                if force_ocr or not page_text.strip():
                    pix = page.get_pixmap()
                    img = Image.open(io.BytesIO(pix.tobytes()))
                    page_text = pytesseract.image_to_string(img)

                extracted_text += page_text
            
            doc.close()
            return extracted_text
        except Exception as e:
            raise RuntimeError(f'Failed to process the PDF: {str(e)}')
