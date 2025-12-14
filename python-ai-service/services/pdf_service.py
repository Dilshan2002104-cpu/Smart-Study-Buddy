from PyPDF2 import PdfReader
from io import BytesIO

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes"""
    pdf_file = BytesIO(pdf_bytes)
    reader = PdfReader(pdf_file)

    text = ""

    for page in reader.pages:
        text += page.extract_text()
        
    return text
