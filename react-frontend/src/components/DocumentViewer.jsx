import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentContent, extractPdfTextFromStoragePath, summarizeDocument, askQuestion, getChatHistory, saveChatHistory } from '../services/api';
import Navbar from './Navbar';

const DocumentViewer = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [document, setDocument] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [summary, setSummary] = useState('');
    const [question, setQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [asking, setAsking] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDocument();
        loadChatHistory();
    }, [documentId]);

    // Auto-save chat history whenever it changes
    useEffect(() => {
        if (qaHistory.length > 0) {
            saveChatHistoryToFirestore();
        }
    }, [qaHistory]);

    const loadChatHistory = async () => {
        try {
            const response = await getChatHistory(documentId, user.userId);
            if (response.data.chatHistory && response.data.chatHistory.length > 0) {
                setQaHistory(response.data.chatHistory);
                console.log('✅ Loaded chat history:', response.data.chatHistory.length, 'messages');
            }
        } catch (error) {
            console.log('No previous chat history found');
        }
    };

    const saveChatHistoryToFirestore = async () => {
        try {
            await saveChatHistory(documentId, user.userId, qaHistory);
            console.log('💾 Chat history saved');
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    };

    const loadDocument = async () => {
        setExtracting(true);
        setError('');
        try {
            const response = await getDocumentContent(documentId, user.userId);
            setDocument(response.data);

            // Check if text is already cached
            if (response.data.textCached && response.data.extractedText) {
                console.log('✅ Using cached text from Firestore (' + response.data.extractedText.length + ' characters)');
                setDocumentText(response.data.extractedText);
                setExtracting(false);
                return;
            }

            // Text not cached, extract from PDF
            const storagePath = response.data.storagePath;

            if (!storagePath) {
                setError('This document was uploaded before the AI feature was added. Please upload it again to use AI features.');
                return;
            }

            console.log('📄 Extracting PDF text from storage path:', storagePath);
            const textResponse = await extractPdfTextFromStoragePath(storagePath, documentId);

            if (textResponse.data && textResponse.data.text) {
                setDocumentText(textResponse.data.text);
                console.log('✅ Text extracted and cached successfully:', textResponse.data.text.length, 'characters');
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
        setLoading(true);
        try {
            const response = await summarizeDocument(documentText, documentId);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error generating summary:', error);
            alert('Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return;

        setAsking(true);
        try {
            // Pass the current chat history to maintain context
            const response = await askQuestion(documentText, question, documentId, qaHistory);
            setQaHistory([...qaHistory, { question, answer: response.data.answer }]);
            setQuestion('');
        } catch (error) {
            console.error('Error asking question:', error);
            alert('Failed to get answer');
        } finally {
            setAsking(false);
        }
    };

    // Helper function to render formatted text with markdown support
    const renderFormattedText = (text) => {
        // Helper to process inline markdown (bold, italic, code)
        const processInlineMarkdown = (line) => {
            const parts = [];
            let currentText = line;
            let key = 0;

            // Process bold text (***text*** or **text**)
            const boldRegex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*)/g;
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(currentText)) !== null) {
                // Add text before the match
                if (match.index > lastIndex) {
                    parts.push(currentText.substring(lastIndex, match.index));
                }
                // Add bold text
                const boldText = match[2] || match[3]; // Get content from either *** or **
                parts.push(
                    <strong key={`bold-${key++}`} className="font-bold text-indigo-900">
                        {boldText}
                    </strong>
                );
                lastIndex = match.index + match[0].length;
            }

            // Add remaining text
            if (lastIndex < currentText.length) {
                parts.push(currentText.substring(lastIndex));
            }

            return parts.length > 0 ? parts : currentText;
        };

        return text.split('\n').map((line, idx) => {
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                return <div key={idx} className="h-2" />;
            }

            // Headings (lines that are entirely bold)
            if (trimmed.match(/^\*\*\*(.+)\*\*\*$/) || trimmed.match(/^\*\*(.+)\*\*$/)) {
                const heading = trimmed.replace(/\*\*\*/g, '').replace(/\*\*/g, '');
                return (
                    <h4 key={idx} className="text-lg font-bold text-indigo-800 mt-4 mb-2">
                        {heading}
                    </h4>
                );
            }

            // Bullet points
            if (trimmed.startsWith('*') && !trimmed.startsWith('**')) {
                const bulletText = trimmed.replace(/^\*\s*/, '');
                return bulletText ? (
                    <div key={idx} className="flex gap-2 ml-4 mb-1">
                        <span className="text-indigo-600 font-bold mt-1">•</span>
                        <p className="flex-1 text-gray-700">
                            {processInlineMarkdown(bulletText)}
                        </p>
                    </div>
                ) : null;
            }

            if (trimmed.startsWith('-')) {
                const bulletText = trimmed.replace(/^-\s*/, '');
                return bulletText ? (
                    <div key={idx} className="flex gap-2 ml-4 mb-1">
                        <span className="text-indigo-600 font-bold mt-1">•</span>
                        <p className="flex-1 text-gray-700">
                            {processInlineMarkdown(bulletText)}
                        </p>
                    </div>
                ) : null;
            }

            // Regular paragraphs with inline markdown
            return (
                <p key={idx} className="text-gray-700 mb-2 leading-relaxed">
                    {processInlineMarkdown(line)}
                </p>
            );
        });
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

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {document?.type === 'youtube' ? '📹' : '📄'} {document?.filename || document?.title || 'Loading...'}
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

                    {documentText && (
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

                                <button
                                    onClick={() => navigate(`/quiz/${documentId}`)}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                    📝 Take Quiz
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('pdf')}
                                        className={`pb-2 px-4 font-medium ${activeTab === 'pdf'
                                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        {document?.type === 'youtube' ? '📹 View Video' : '📄 View PDF'}
                                    </button>
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

                            {/* PDF/Video Viewer Tab */}
                            {activeTab === 'pdf' && (
                                <div className="space-y-4">
                                    {document?.type === 'youtube' ? (
                                        // YouTube Video Player
                                        <>
                                            <div className="bg-gray-100 rounded-lg p-2">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${document.videoId}`}
                                                    className="w-full h-[600px] rounded-lg shadow-lg"
                                                    title="YouTube Video Player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div className="text-center text-sm text-gray-600">
                                                <p>📹 {document.title}</p>
                                                <p className="text-xs mt-1">Channel: {document.channel}</p>
                                            </div>
                                        </>
                                    ) : (
                                        // PDF Viewer
                                        <>
                                            <div className="bg-gray-100 rounded-lg p-2">
                                                <iframe
                                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(document?.downloadUrl)}&embedded=true`}
                                                    className="w-full h-[800px] rounded-lg shadow-lg"
                                                    title="PDF Viewer"
                                                />
                                            </div>
                                            <div className="text-center text-sm text-gray-600">
                                                <p>💡 Tip: Use the viewer controls to zoom and navigate pages</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <div className="space-y-4">
                                    {!summary ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 italic mb-4">
                                                Click "Summarize" to generate an AI-powered summary of this document
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-2xl">📝</span>
                                                <h3 className="text-xl font-bold text-indigo-900">AI Summary</h3>
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                {renderFormattedText(summary)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Q&A Tab */}
                            {activeTab === 'qa' && (
                                <div className="space-y-4">
                                    {/* Q&A History */}
                                    <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                                        {qaHistory.map((qa, index) => (
                                            <div key={index} className="space-y-3">
                                                {/* Question */}
                                                <div className="flex justify-end">
                                                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                                                        <p className="font-medium text-sm mb-1">You asked:</p>
                                                        <p>{qa.question}</p>
                                                    </div>
                                                </div>
                                                {/* Answer */}
                                                <div className="flex justify-start">
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-lg">🤖</span>
                                                            <p className="font-semibold text-sm text-green-800">Study Buddy</p>
                                                        </div>
                                                        <div className="text-gray-800 leading-relaxed">
                                                            {renderFormattedText(qa.answer)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Question Input */}
                                    <div className="sticky bottom-0 bg-white pt-4 border-t">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                                                placeholder="Ask a question about this document..."
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={handleAskQuestion}
                                                disabled={!question.trim() || asking}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                            >
                                                {asking ? 'Thinking...' : 'Ask'}
                                            </button>
                                        </div>
                                    </div>
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
