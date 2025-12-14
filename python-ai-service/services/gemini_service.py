import vertexai
from vertexai.preview.generative_models import GenerativeModel
import os
from typing import List, Dict
import json

class GeminiService:

    def __init__(self):
        #initialize Vertext AI
        project_id = os.getenv("VERTEX_AI_PROJECT_ID")
        location = os.getenv("VERTEX_AI_LOCATION")
        model_name = os.getenv("VERTEX_AI_MODEL")

        vertexai.init(project=project_id,location=location)
        self.model = GenerativeModel(model_name)

    def generate_summary(self,text: str) -> str:
        """Generate summery of document"""

        prompt = f"""Summarize the following document in a clear and concise way. 
        Focus on the main points and key takeaways:
        
        {text[:10000]}"""

        response = self.model.generate_content(prompt)
        return response.text

    def answer_question(self, text: str, question: str) -> str:
        """Answer question based on document"""
        prompt = f"""Based on the following document, answer this question: {question}
        
        Document:
        {text[:10000]}
        
        Answer:"""
        
        response = self.model.generate_content(prompt)
        return response.text
        
    def generate_flashcards(self,text: str) -> List[Dict[str,str]]:
        """Generate flashcard from documet"""
        prompt = f"""Generate 10 flashcards from this document. 
        Format as JSON array with 'question' and 'answer' fields.
        Focus on key concepts and important facts.
            
        Document:
        {text[:10000]}
            
        Return ONLY the JSON array, no markdown formatting or extra text."""
        
        response = self.model.generate_content(prompt)
        
        # Clean response and parse JSON
        text_response = response.text.strip()
        
        # Remove markdown code blocks if present
        if text_response.startswith("```"):
                text_response = text_response.split("```")[1]
                if text_response.startswith("json"):
                    text_response = text_response[4:]
            
        flashcards = json.loads(text_response.strip())
        return flashcards
        

    
    

