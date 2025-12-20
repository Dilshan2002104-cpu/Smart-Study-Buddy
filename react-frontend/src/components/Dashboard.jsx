import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments, deleteDocument } from '../services/api';
import Navbar from './Navbar';
import FileUpload from './FileUpload';
import YouTubeUpload from './YouTubeUpload';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await getUserDocuments(user.userId);
      console.log('Documents received:', response.data);
      if (response.data.length > 0) {
        console.log('First document uploadDate:', response.data[0].uploadDate);
      }
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(docId, user.userId);
      // Refresh documents list
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user.username}! 👋</h2>
          <p className="text-gray-600 mt-2">Manage your study documents and materials</p>
        </div>

        <FileUpload onUploadComplete={loadDocuments} />

        <YouTubeUpload userId={user.userId} onUploadSuccess={loadDocuments} />

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
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-gray-500">No documents yet. Upload your first PDF to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    {doc.type === 'youtube' ? (
                      // YouTube video thumbnail
                      <div className="relative">
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                          <span className="text-3xl">▶️</span>
                        </div>
                      </div>
                    ) : (
                      // PDF icon
                      <div className="bg-red-100 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {doc.type === 'youtube' && <span className="text-lg">📹</span>}
                        <h4 className="font-semibold text-gray-800">{doc.filename || doc.title || 'Untitled Document'}</h4>
                      </div>
                      {doc.type === 'youtube' && doc.channel && (
                        <p className="text-xs text-gray-500">Channel: {doc.channel}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {doc.type === 'youtube' ? 'Added' : 'Uploaded'}: {
                          doc.uploadDate?._seconds
                            ? new Date(doc.uploadDate._seconds * 1000).toLocaleDateString()
                            : doc.uploadDate?.seconds
                              ? new Date(doc.uploadDate.seconds * 1000).toLocaleDateString()
                              : doc.uploadDate
                                ? new Date(doc.uploadDate).toLocaleDateString()
                                : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      🤖 View & Study
                    </button>
                    {doc.type !== 'youtube' && (
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
                      >
                        📥 Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
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
