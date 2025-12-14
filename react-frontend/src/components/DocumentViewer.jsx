import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentContent, extractPdfTextFromStoragePath, summarizeDocument, askQuestion } from '../services/api';
import Navbar from './Navbar';

const DocumentViewer = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [document, setDocument] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [summary, setSummary] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');
    const [error, setError] = useState('');

    useEffect(() => {
        loadDocument();
    }, [documentId]);

    const loadDocument = async () => {
        setExtracting(true);
        setError('');
        try {
            // Get document metadata
            const response = await getDocumentContent(documentId, user.userId);
            setDocument(response.data);

            // Extract text using storagePath (works with Firebase Admin SDK)
            const storagePath = response.data.storagePath;

            if (!storagePath) {
                setError('This document was uploaded before the AI feature was added. Please upload it again to use AI features.');
                return;
            }

            console.log('Extracting PDF text from storage path:', storagePath);
            const textResponse = await extractPdfTextFromStoragePath(storagePath);

            if (textResponse.data && textResponse.data.text) {
                setDocumentText(textResponse.data.text);
                console.log('Text extracted successfully:', textResponse.data.length, 'characters');
            } else {
                throw new Error('No text returned from extraction');
            }
        } catch (error) {
            console.error('Error loading document:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to load document';
            setError(`Failed to extract PDF text: ${errorMsg}`);
        } finally {
            setExtracting(false);
        }
    };

    const handleSummarize = async () => {
        if (!documentText) {
            setError('No document text available');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await summarizeDocument(documentText, documentId);
            setSummary(response.data.summary);
            setActiveTab('summary');
        } catch (error) {
            console.error('Error generating summary:', error);
            setError('Failed to generate summary: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        if (!documentText) {
            setError('No document text available');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await askQuestion(documentText, question, documentId);
            setAnswer(response.data.answer);
            setActiveTab('qa');
        } catch (error) {
            console.error('Error asking question:', error);
            setError('Failed to get answer: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    ← Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        📄 {document?.filename || 'Loading...'}
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-semibold">❌ Error</p>
                            <p className="text-sm mt-1">{error}</p>
                            <button
                                onClick={loadDocument}
                                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {extracting && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                                <p>Extracting text from PDF...</p>
                            </div>
                        </div>
                    )}

                    {documentText && !extracting && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            ✅ Document text loaded ({documentText.length} characters)
                        </div>
                    )}

                    {documentText && (
                        <>
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={handleSummarize}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Generating...' : '📝 Summarize'}
                                </button>

                                <button
                                    onClick={() => navigate(`/flashcards/${documentId}`)}
                                    disabled={loading}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                                >
                                    🎴 Generate Flashcards
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('summary')}
                                        className={`pb-2 px-4 font-medium ${activeTab === 'summary'
                                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        Summary
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('qa')}
                                        className={`pb-2 px-4 font-medium ${activeTab === 'qa'
                                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        Q&A
                                    </button>
                                </div>
                            </div>

                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                                    {summary ? (
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-12">
                                            Click "Summarize" to generate an AI-powered summary of this document
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Q&A Tab */}
                            {activeTab === 'qa' && (
                                <div>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="Ask a question about this document..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                                            disabled={loading}
                                        />
                                        <button
                                            onClick={handleAskQuestion}
                                            disabled={loading || !question.trim()}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                                        >
                                            {loading ? 'Asking...' : 'Ask'}
                                        </button>
                                    </div>

                                    {answer && (
                                        <div className="bg-gray-50 rounded-lg p-6">
                                            <p className="font-semibold text-gray-800 mb-3">Q: {question}</p>
                                            <p className="text-gray-700 leading-relaxed">A: {answer}</p>
                                        </div>
                                    )}

                                    {!answer && (
                                        <p className="text-gray-500 italic text-center py-12">
                                            Ask any question about the document content
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
