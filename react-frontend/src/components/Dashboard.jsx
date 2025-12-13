import { useState, useEffect } from 'react';
import { getUserDocuments } from '../services/api';
import FileUpload from './FileUpload';
import Navbar from './Navbar';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadDocuments = async () => {
    try {
      const response = await getUserDocuments(user.userId);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user.username}! 👋</h2>
          <p className="text-gray-600 mt-2">Manage your study documents and materials</p>
        </div>

        <FileUpload onUploadComplete={loadDocuments} />
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📚 Your Documents</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">No documents uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first PDF to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{doc.filename}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;