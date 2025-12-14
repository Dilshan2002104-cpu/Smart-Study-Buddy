from pydantic import BaseModel
from typing import Optional

class SummarizeRequest(BaseModel):
    text: str
    document_id: Optional[str] = None

class QuestionRequest(BaseModel):
    text: str
    question: str
    document_id: Optional[str] = None

