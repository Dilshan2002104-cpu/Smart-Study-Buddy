import { useState } from 'react';
import { uploadYouTubeVideo } from '../services/api';

const YouTubeUpload = ({ userId, onUploadSuccess }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        // Check if it's already just the video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }

        return null;
    };

    const isValidYouTubeUrl = (url) => {
        return extractVideoId(url) !== null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
            return;
        }

        setLoading(true);

        try {
            const response = await uploadYouTubeVideo(url, userId);
            console.log('✅ YouTube video uploaded:', response.data);

            setUrl('');
            setError('');

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (error) {
            console.error('Error uploading YouTube video:', error);
            const errorMessage = error.response?.data?.error || 'Failed to add YouTube video. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getVideoThumbnail = () => {
        const videoId = extractVideoId(url);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📹</span>
                <h3 className="text-xl font-bold text-gray-800">Add YouTube Video</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Video URL
                    </label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Paste any YouTube video URL (works with lectures, tutorials, educational content)
                    </p>
                </div>

                {url && isValidYouTubeUrl(url) && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img
                            src={getVideoThumbnail()}
                            alt="Video thumbnail"
                            className="w-full max-w-xs rounded-lg shadow-sm"
                        />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Extracting transcript...</span>
                        </>
                    ) : (
                        <>
                            <span>📹</span>
                            <span>Add Video</span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 How it works:</strong> Paste a YouTube URL and we'll extract the video transcript.
                    Then you can generate summaries, flashcards, quizzes, and ask questions about the video!
                </p>
            </div>
        </div>
    );
};

export default YouTubeUpload;
