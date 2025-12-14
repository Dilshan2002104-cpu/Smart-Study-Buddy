from pydantic import BaseModel
from typing import Optional, List, Dict

class SummarizeRequest(BaseModel):
    text: str
    document_id: Optional[str] = None

class QuestionRequest(BaseModel):
    text: str
    question: str
    document_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = []

