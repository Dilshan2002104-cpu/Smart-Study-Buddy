import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentContent, extractPdfTextFromStoragePath, generateQuiz } from '../services/api';
import Navbar from './Navbar';

const Quiz = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [document, setDocument] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        loadDocumentAndQuiz();
    }, [documentId]);

    // Timer countdown
    useEffect(() => {
        if (timerActive && timeLeft > 0 && !showResults) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !showResults) {
            handleSubmit();
        }
    }, [timerActive, timeLeft, showResults]);

    const loadDocumentAndQuiz = async () => {
        try {
            // Load document
            const response = await getDocumentContent(documentId, user.userId);
            setDocument(response.data);

            // Extract text
            const storagePath = response.data.storagePath;
            if (!storagePath) {
                alert('This document cannot be used for quizzes. Please upload it again.');
                navigate('/dashboard');
                return;
            }

            const textResponse = await extractPdfTextFromStoragePath(storagePath);
            const text = textResponse.data.text;
            setDocumentText(text);

            // Generate quiz
            const quizResponse = await generateQuiz(text, documentId);
            setQuiz(quizResponse.data.quiz);
            setLoading(false);
            setTimerActive(true); // Start timer when quiz loads
        } catch (error) {
            console.error('Error loading quiz:', error);
            alert('Failed to generate quiz');
            navigate('/dashboard');
        }
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        if (showResults) return; // Can't change answers after submission
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: answerIndex
        });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        setShowResults(true);
        setTimerActive(false);
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating quiz questions...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        const score = calculateScore();
        const percentage = Math.round((score / quiz.length) * 100);

        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Quiz Complete!</h2>
                            <div className="text-6xl font-bold text-indigo-600 my-6">{percentage}%</div>
                            <p className="text-xl text-gray-700">
                                You got <span className="font-bold text-green-600">{score}</span> out of{' '}
                                <span className="font-bold">{quiz.length}</span> correct
                            </p>
                        </div>

                        {/* Review Answers */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Review Your Answers</h3>
                            {quiz.map((q, qIndex) => {
                                const userAnswer = selectedAnswers[qIndex];
                                const isCorrect = userAnswer === q.correctAnswer;

                                return (
                                    <div key={qIndex} className="border rounded-lg p-4">
                                        <div className="flex items-start gap-2 mb-3">
                                            <span className={`text-2xl ${isCorrect ? '✅' : '❌'}`}>
                                                {isCorrect ? '✅' : '❌'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">
                                                    Question {qIndex + 1}: {q.question}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ml-8 space-y-2">
                                            {q.options.map((option, oIndex) => {
                                                const isUserAnswer = userAnswer === oIndex;
                                                const isCorrectAnswer = q.correctAnswer === oIndex;

                                                return (
                                                    <div
                                                        key={oIndex}
                                                        className={`p-2 rounded ${isCorrectAnswer
                                                                ? 'bg-green-100 border border-green-300'
                                                                : isUserAnswer
                                                                    ? 'bg-red-100 border border-red-300'
                                                                    : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className="font-medium">
                                                            {String.fromCharCode(65 + oIndex)}.
                                                        </span>{' '}
                                                        {option}
                                                        {isCorrectAnswer && (
                                                            <span className="ml-2 text-green-700 font-semibold">
                                                                ✓ Correct
                                                            </span>
                                                        )}
                                                        {isUserAnswer && !isCorrectAnswer && (
                                                            <span className="ml-2 text-red-700 font-semibold">
                                                                ✗ Your answer
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-sm text-blue-900">
                                                    <span className="font-semibold">💡 Explanation:</span>{' '}
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                🔄 Retake Quiz
                            </button>
                            <button
                                onClick={() => navigate(`/document/${documentId}`)}
                                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                            >
                                ← Back to Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = quiz[currentQuestion];
    const selectedAnswer = selectedAnswers[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(`/document/${documentId}`)}
                    className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    ← Back to Document
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">📝 Quiz</h2>
                            <p className="text-sm text-gray-600">{document?.filename}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Time Remaining</div>
                            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                                ⏱️ {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Question {currentQuestion + 1} of {quiz.length}
                            </span>
                            <span className="text-sm text-gray-600">
                                {Object.keys(selectedAnswers).length} answered
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQ.question}</h3>

                        <div className="space-y-3">
                            {currentQ.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition ${selectedAnswer === index
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                                                    ? 'border-indigo-600 bg-indigo-600'
                                                    : 'border-gray-300'
                                                }`}
                                        >
                                            {selectedAnswer === index && (
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-700">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <span className="text-gray-800">{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                        >
                            ← Previous
                        </button>

                        {currentQuestion === quiz.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                                Submit Quiz ✓
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
