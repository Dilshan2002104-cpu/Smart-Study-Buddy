import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PDFDashboard from './components/PDFDashboard';
import YouTubeDashboard from './components/YouTubeDashboard';
import DocumentViewer from './components/DocumentViewer';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* New separate dashboards */}
        <Route
          path="/pdfs"
          element={
            <ProtectedRoute>
              <PDFDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <YouTubeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Old dashboard route - redirect to PDFs */}
        <Route
          path="/dashboard"
          element={<Navigate to="/pdfs" replace />}
        />

        <Route
          path="/document/:documentId"
          element={
            <ProtectedRoute>
              <DocumentViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards/:documentId"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:documentId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;