import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments, deleteDocument } from '../services/api';
import Navbar from './Navbar';
import FileUpload from './FileUpload';

const PDFDashboard = () => {
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
            // Filter only PDF documents
            const pdfDocs = response.data.filter(doc => doc.type !== 'youtube');
            setDocuments(pdfDocs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this PDF?')) {
            return;
        }

        try {
            await deleteDocument(docId, user.userId);
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-6 bg-white rounded-lg p-2 shadow-md w-fit">
                    <button
                        className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white"
                    >
                        📄 My PDFs
                    </button>
                    <button
                        onClick={() => navigate('/videos')}
                        className="px-6 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                        📹 My Videos
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">📄 My PDF Documents</h2>
                    <p className="text-gray-600 mt-2">Upload and manage your study PDFs</p>
                </div>
                <FileUpload onUploadComplete={loadDocuments} />

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">📚 Your PDF Library</h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 mt-2">Loading PDFs...</p>
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
                            <p className="mt-2 text-gray-500">No PDFs yet. Upload your first PDF to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 truncate">{doc.filename || 'Untitled Document'}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Uploaded: {
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

                                    <div className="mt-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/document/${doc.id}`)}
                                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                        >
                                            🤖 View & Study
                                        </button>
                                        <div className="flex gap-2">
                                            <a
                                                href={doc.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-medium text-center"
                                            >
                                                📥 Download
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
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

export default PDFDashboard;
