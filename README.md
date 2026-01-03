# 🎓 Smart Study Buddy

> An AI-powered study assistant that transforms your PDFs and YouTube videos into interactive learning experiences using Google's Gemini AI.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg)](https://reactjs.org/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

## 🌟 Overview

**Smart Study Buddy** is a comprehensive full-stack application designed to revolutionize the way students learn. By leveraging cutting-edge AI technology (Google Gemini 2.0), it transforms static study materials into dynamic, interactive learning tools.

### What Makes It Special?

- 🤖 **AI-Powered**: Uses Google's Gemini 2.0 Flash for intelligent content analysis
- 📄 **PDF Support**: Upload and analyze PDF documents with separate dashboard
- 🎥 **YouTube Integration**: Extract and study from YouTube video transcripts with dedicated dashboard
- 💬 **Interactive Q&A**: Ask questions and get context-aware answers
- 🎴 **Smart Flashcards**: Auto-generated flashcards for efficient memorization
- 📝 **Adaptive Quizzes**: AI-generated quizzes to test your knowledge
- 🔒 **Secure**: Firebase authentication and user data protection
- 💾 **Cloud Storage**: All your materials safely stored in Firebase

## ✨ Features

### 📚 Separate Dashboards
- **PDF Dashboard** (`/pdfs`): Dedicated interface for managing PDF documents with grid layout
- **YouTube Dashboard** (`/videos`): Dedicated interface for YouTube videos with thumbnail cards
- **Easy Navigation**: Tab-based navigation between dashboards in the page content
- **Full-Screen Layout**: Optimized to use full screen width for better content visibility
- **Sticky Header**: Navigation bar stays fixed at top when scrolling

### 🧠 AI-Powered Learning Tools

#### 1. Smart Summarization
- Generates concise, student-friendly summaries
- Uses conversational tone for better understanding
- Highlights key concepts and takeaways

#### 2. Interactive Q&A
- Ask questions about your study materials
- Context-aware responses based on document content
- Maintains conversation history

#### 3. Flashcard Generator
- Automatically creates 10 flashcards per document
- Interactive flip animations
- Track your progress

#### 4. Quiz Generator
- Generates 10 multiple-choice questions
- Mixed difficulty levels
- Immediate feedback with explanations
- Score tracking

### 🔐 User Authentication
- Secure email/password registration
- Firebase-powered authentication
- Protected routes and user-specific data

## 🏗️ Architecture

Smart Study Buddy follows a modern **three-tier microservices architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│                  React + Vite + Tailwind                    │
│                    (Port 5173)                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                            │
│              Spring Boot + Firebase                         │
│                    (Port 8080)                              │
└────────────┬───────────────────────┬────────────────────────┘
             │ HTTP/REST             │ Firebase Admin SDK
             ▼                       ▼
┌────────────────────────┐  ┌──────────────────────────────┐
│   AI Service Layer     │  │   Firebase Services          │
│   Python + FastAPI     │  │   - Authentication           │
│   (Port 8000)          │  │   - Firestore Database       │
│   - Gemini AI          │  │   - Cloud Storage            │
│   - PDF Processing     │  └──────────────────────────────┘
│   - YouTube Transcripts│
└────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0**: Modern UI library
- **Vite 7.2.4**: Lightning-fast build tool
- **React Router 7.10.1**: Client-side routing
- **Tailwind CSS 3.4.19**: Utility-first CSS framework
- **Axios 1.13.2**: HTTP client
- **React-PDF 10.2.0**: PDF rendering

### Backend
- **Spring Boot 3.2.0**: Java framework
- **Java 21**: Programming language
- **Spring Security**: Authentication & authorization
- **Firebase Admin SDK 9.2.0**: Firebase integration
- **Apache PDFBox 3.0.0**: PDF processing
- **OkHttp 4.12.0**: HTTP client

### AI Service
- **FastAPI 0.115.6**: Modern Python web framework
- **Python 3.12+**: Programming language
- **Google Cloud AI Platform 1.38.0**: Vertex AI integration
- **Gemini 2.0 Flash Exp**: AI model
- **PyPDF2 3.0.1**: PDF text extraction
- **yt-dlp 2025.12.8**: YouTube transcript extraction

### Infrastructure
- **Firebase Authentication**: User management
- **Firebase Firestore**: NoSQL database
- **Firebase Storage**: File storage
- **Google Vertex AI**: AI/ML platform

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Python 3.12** or higher ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Cloud Services Required

1. **Google Cloud Platform Account**
   - Create a project
   - Enable Vertex AI API
   - Create a service account with Vertex AI permissions
   - Download the service account key JSON

2. **Firebase Project**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Firebase Storage
   - Download Firebase service account key JSON

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Smart-Study-Buddy.git
cd Smart-Study-Buddy
```

### 2. Install Dependencies

#### Python AI Service
```bash
cd python-ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

#### React Frontend
```bash
cd react-frontend
npm install
cd ..
```

#### Spring Backend
Maven dependencies will be downloaded automatically when you run the application.

## ⚙️ Configuration

### 1. Vertex AI Configuration

1. Place your Vertex AI service account key in the project root:
   ```
   Smart-Study-Buddy/vertex-ai-key.json
   ```

2. Update `python-ai-service/.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vertex-ai-key.json
   VERTEX_AI_PROJECT_ID=your-project-id
   VERTEX_AI_LOCATION=us-central1
   VERTEX_AI_MODEL=gemini-2.0-flash-exp
   ```

### 2. Firebase Configuration

1. Place your Firebase service account key in the project root:
   ```
   Smart-Study-Buddy/firebase-service-account-key.json
   ```

2. Copy the key to Spring resources:
   ```bash
   cp firebase-service-account-key.json Spring-backend/src/main/resources/serviceAccountKey.json
   ```

3. Update `Spring-backend/src/main/resources/application.properties`:
   ```properties
   firebase.service-account-key=classpath:serviceAccountKey.json
   firebase.storage-bucket=your-project-id.firebasestorage.app
   ```

4. Configure Firebase Storage Rules (in Firebase Console):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 🏃 Running the Application

You need to run all three services simultaneously in separate terminals:

### Terminal 1: Python AI Service
```bash
cd python-ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 2: Spring Backend
```bash
cd Spring-backend
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/firebase-service-account-key.json"
./mvnw spring-boot:run
```

### Terminal 3: React Frontend
```bash
cd react-frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📖 Usage

### Getting Started

1. **Register**: Create an account with email and password
2. **Login**: Sign in to access your dashboard

### Managing PDFs

1. Navigate to **"📄 My PDFs"** dashboard
2. Click **"Upload PDF Document"**
3. Select your PDF file (max 10MB)
4. Click **"🤖 View & Study"** to:
   - Generate AI summary
   - Ask questions
   - Create flashcards
   - Take quizzes

### Managing YouTube Videos

1. Navigate to **"📹 My Videos"** dashboard
2. Click **"Add YouTube Video"**
3. Paste the YouTube URL
4. Click **"🤖 View & Study"** to:
   - Read the transcript
   - Generate summary
   - Ask questions about the video
   - Create flashcards
   - Take quizzes

### AI Features

- **Summary**: Click "Generate Summary" for a concise overview
- **Q&A**: Type your question and get AI-powered answers
- **Flashcards**: Click "Generate Flashcards" for 10 study cards
- **Quiz**: Click "Generate Quiz" for 10 multiple-choice questions

## 📁 Project Structure

```
Smart-Study-Buddy/
├── react-frontend/              # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── PDFDashboard.jsx      # PDF documents dashboard
│   │   │   ├── YouTubeDashboard.jsx  # YouTube videos dashboard
│   │   │   ├── Navbar.jsx            # Sticky navigation bar
│   │   │   ├── DocumentViewer.jsx    # Document viewer with AI tools
│   │   │   ├── Flashcards.jsx        # Flashcard interface
│   │   │   └── Quiz.jsx              # Quiz interface
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   └── App.jsx                   # Main app component
│   └── package.json
│
├── Spring-backend/              # Spring Boot backend
│   ├── src/main/java/com/Smart_Study_Buddy/
│   │   ├── controller/
│   │   │   ├── AuthController.java   # Authentication endpoints
│   │   │   └── DocumentController.java # Document management
│   │   ├── service/
│   │   │   ├── FirestoreService.java # Firestore operations
│   │   │   └── StorageService.java   # Firebase Storage
│   │   └── security/
│   │       └── FirebaseAuthenticationFilter.java
│   └── pom.xml
│
├── python-ai-service/           # Python AI service
│   ├── main.py                  # FastAPI application
│   ├── services/
│   │   ├── gemini_service.py    # Gemini AI integration
│   │   ├── pdf_service.py       # PDF processing
│   │   └── youtube_service.py   # YouTube transcript extraction
│   ├── requirements.txt
│   └── .env
│
├── vertex-ai-key.json          # Vertex AI credentials (gitignored)
├── firebase-service-account-key.json  # Firebase credentials (gitignored)
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Vertex AI Model Not Found
**Error**: `404 Publisher Model not found`

**Solution**: Update the model name in `python-ai-service/.env`:
```env
VERTEX_AI_MODEL=gemini-2.0-flash-exp
```

#### 2. Firebase Storage Bucket Error
**Error**: `Bucket does not exist`

**Solution**: 
- Check `application.properties` has correct bucket name
- Verify Firebase Storage is enabled in Firebase Console
- Update storage rules to allow authenticated access

#### 3. Port Already in Use
**Error**: `Address already in use`

**Solution**:
```bash
# Find and kill process on port
sudo lsof -i :8000  # or :8080 or :5173
sudo kill -9 <PID>
```

#### 4. Python Dependencies Installation Error
**Error**: `externally-managed-environment`

**Solution**: Use virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Getting Help

If you encounter issues:
1. Check the logs in each service terminal
2. Verify all environment variables are set correctly
3. Ensure all three services are running
4. Check Firebase Console for authentication/storage issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ by Dilshan

---

**Happy Studying! 📚✨**
