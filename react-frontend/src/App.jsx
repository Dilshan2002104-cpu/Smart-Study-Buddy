import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DocumentViewer from './components/DocumentViewer';
import Flashcards from './components/Flashcards';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
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
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;