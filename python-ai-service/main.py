import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="google.cloud.aiplatform.initializer")

from fastapi import FastAPI, UploadFile,File,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.pdf_service import extract_text_from_pdf
from services.gemini_service import GeminiService
from models.schemas import SummarizeRequest,QuestionRequest
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart Study Buddy AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_service = GeminiService()

@app.get("/health")
async def health_check():
    return {"status" : "healthy"}

@app.post("/api/ai/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded PDF"""
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        return {"text": text, "length": len(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/summarize")
async def summarize_document(request: SummarizeRequest):
    """Generate summary from document text"""
    try:
        summary = gemini_service.generate_summary(request.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/ask")
async def ask_question(request: QuestionRequest):
        """Answer question about document"""

        try:
            answer = gemini_service.answer_question(
                request.text,
                request.question,
                request.chat_history
            )
            return {"answer": answer, "question": request.question}
        except Exception as e:
            raise HTTPException(status_code=500,detail=str(e))

@app.post("/api/ai/flashcards")
async def generate_flashcards(request: SummarizeRequest):
    """Generate flashcards from document"""

    try:
        flashcards = gemini_service.generate_flashcards(request.text)
        return {"flashcards": flashcards, "count": len(flashcards)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-quiz")
async def generate_quiz(request: SummarizeRequest):
    """Generate quiz questions from document"""
    try:
        quiz = gemini_service.generate_quiz(request.text)
        return {"quiz": quiz, "count": len(quiz)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))