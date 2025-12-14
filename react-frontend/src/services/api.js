import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const registerUser = (username, email, password) => {
    return axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
    });
};

export const loginUser = (email, password) => {
    return axios.post(`${API_URL}/auth/login`, {
        email,
        password
    });
};

export const uploadFile = (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    return axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const getUserDocuments = (userId) => {
    return axios.get(`${API_URL}/documents`, {
        params: { userId }
    });
};

// AI Features
export const extractPdfTextFromStoragePath = (storagePath) => {
    return axios.post(`${API_URL}/pdf/extract-from-storage-path`, { storagePath });
};

export const extractPdfText = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('http://localhost:8000/api/ai/extract-text', formData);
};

export const summarizeDocument = (text, documentId) => {
    return axios.post(`${API_URL}/ai/summarize`, {
        text,
        document_id: documentId
    });
};

export const askQuestion = (text, question, documentId) => {
    return axios.post(`${API_URL}/ai/ask`, {
        text,
        question,
        document_id: documentId
    });
};

export const generateFlashcards = (text, documentId) => {
    return axios.post(`${API_URL}/ai/flashcards`, {
        text,
        document_id: documentId
    });
};

export const getDocumentContent = (documentId, userId) => {
    return axios.get(`${API_URL}/documents/${documentId}/content`, {
        params: { userId }
    });
};

export const deleteDocument = (documentId, userId) => {
    return axios.delete(`${API_URL}/documents/${documentId}`, {
        params: { userId }
    });
};