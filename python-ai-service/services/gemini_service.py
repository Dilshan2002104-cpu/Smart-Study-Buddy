import vertexai
from vertexai.preview.generative_models import GenerativeModel
import os
from typing import List, Dict
import json
import re

class GeminiService:
    
    def __init__(self):
        # Initialize Vertex AI
        project_id = os.getenv("VERTEX_AI_PROJECT_ID")
        location = os.getenv("VERTEX_AI_LOCATION")
        model_name = os.getenv("VERTEX_AI_MODEL")

        vertexai.init(project=project_id, location=location)
        self.model = GenerativeModel(model_name)

    def generate_summary(self, text: str) -> str:
        """Generate a friendly, student-oriented summary"""
        prompt = f"""You are a friendly study buddy helping a student understand this document. 
        Create a clear, conversational summary that:
        - Uses simple, everyday language (avoid overly formal/academic tone)
        - Highlights the main points and key takeaways
        - Explains concepts in a way that's easy to understand
        - Uses bullet points or short paragraphs for readability
        
        Document to summarize:
        {text[:10000]}
        
        Remember: Be helpful, friendly, and clear - like explaining to a friend!"""
        
        response = self.model.generate_content(prompt)
        return response.text

    def answer_question(self, text: str, question: str) -> str:
        """Answer questions in a friendly, helpful way"""
        prompt = f"""You are a friendly study buddy helping a student understand their study material.
        
        Question: {question}
        
        Based on this document:
        {text[:10000]}
        
        Provide a clear, conversational answer that:
        - Directly answers the question in simple terms
        - Uses examples or analogies when helpful
        - Breaks down complex ideas into easy-to-understand parts
        - Sounds like a helpful friend explaining, not a textbook
        - Keeps it concise but thorough
        
        If the answer isn't in the document, say so politely and offer what related info you can."""
        
        response = self.model.generate_content(prompt)
        return response.text
        
    def generate_flashcards(self, text: str) -> List[Dict[str, str]]:
        """Generate student-friendly flashcards"""
        prompt = f"""You are creating study flashcards for a student. Generate 10 flashcards from this document.
        
        Guidelines:
        - Questions should be clear and specific
        - Answers should be concise (1-3 sentences max)
        - Focus on key concepts, definitions, and important facts
        - Use simple, student-friendly language
        - Make questions that actually help with studying
        
        Document:
        {text[:10000]}
        
        Return ONLY a JSON array in this exact format (no other text):
        [
            {{"question": "What is...", "answer": "..."}},
            {{"question": "How does...", "answer": "..."}}
        ]"""
        
        response = self.model.generate_content(prompt)
        
        # Clean response and parse JSON
        text_response = response.text.strip()
        
        # Remove markdown code blocks if present
        text_response = re.sub(r'```json\s*', '', text_response)
        text_response = re.sub(r'```\s*', '', text_response)
        text_response = text_response.strip()
        
        try:
            flashcards = json.loads(text_response)
            return flashcards
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response text: {text_response}")
            # Return a default flashcard if parsing fails
            return [{"question": "Error generating flashcards", "answer": "Please try again"}]
