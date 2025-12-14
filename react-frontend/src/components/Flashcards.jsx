import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentContent, extractPdfTextFromStoragePath, generateFlashcards } from '../services/api';
import Navbar from './Navbar';
import './Flashcards.css';

const Flashcards = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [document, setDocument] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDocumentAndGenerateFlashcards();
    }, [documentId]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === ' ') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, isFlipped]);

    const loadDocumentAndGenerateFlashcards = async () => {
        setLoading(true);
        setError('');
        try {
            // Get document metadata
            const response = await getDocumentContent(documentId, user.userId);
            setDocument(response.data);

            // Extract text
            const storagePath = response.data.storagePath;
            if (!storagePath) {
                setError('This document was uploaded before the AI feature was added. Please upload it again.');
                return;
            }

            const textResponse = await extractPdfTextFromStoragePath(storagePath);
            const documentText = textResponse.data.text;

            // Generate flashcards
            console.log('Generating flashcards...');
            const flashcardsResponse = await generateFlashcards(documentText, documentId);

            if (flashcardsResponse.data && flashcardsResponse.data.flashcards) {
                setFlashcards(flashcardsResponse.data.flashcards);
                console.log('Flashcards generated:', flashcardsResponse.data.flashcards.length);
            } else {
                throw new Error('No flashcards returned');
            }
        } catch (error) {
            console.error('Error generating flashcards:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to generate flashcards';
            setError(`Failed to generate flashcards: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(`/document/${documentId}`)}
                    className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    ← Back to Document
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🎴 Flashcards
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {document?.filename || 'Loading...'}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-semibold">❌ Error</p>
                            <p className="text-sm mt-1">{error}</p>
                            <button
                                onClick={loadDocumentAndGenerateFlashcards}
                                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                                <p>Generating flashcards with AI... This may take a moment.</p>
                            </div>
                        </div>
                    )}

                    {!loading && flashcards.length > 0 && (
                        <>
                            {/* Flashcard */}
                            <div className="flashcard-container mb-6" onClick={handleFlip}>
                                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                                    <div className="flashcard-front">
                                        <div className="flashcard-content">
                                            <div className="text-sm text-gray-500 mb-4">Question</div>
                                            <p className="text-xl text-gray-800 leading-relaxed">
                                                {flashcards[currentIndex].question}
                                            </p>
                                            <div className="mt-6 text-sm text-indigo-600">
                                                Click to reveal answer →
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flashcard-back">
                                        <div className="flashcard-content">
                                            <div className="text-sm text-gray-500 mb-4">Answer</div>
                                            <p className="text-xl text-gray-800 leading-relaxed">
                                                {flashcards[currentIndex].answer}
                                            </p>
                                            <div className="mt-6 text-sm text-indigo-600">
                                                Click to see question →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="text-center mb-6">
                                <p className="text-gray-600 font-medium">
                                    Card {currentIndex + 1} of {flashcards.length}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    ← Previous
                                </button>

                                <button
                                    onClick={handleFlip}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {isFlipped ? 'Show Question' : 'Show Answer'}
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === flashcards.length - 1}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next →
                                </button>
                            </div>

                            {/* Keyboard hints */}
                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>💡 Tip: Use arrow keys to navigate, spacebar to flip</p>
                            </div>
                        </>
                    )}

                    {!loading && flashcards.length === 0 && !error && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 italic">No flashcards available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
