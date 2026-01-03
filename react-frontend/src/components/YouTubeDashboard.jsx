import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments, deleteDocument } from '../services/api';
import Navbar from './Navbar';
import YouTubeUpload from './YouTubeUpload';

const YouTubeDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const response = await getUserDocuments(user.userId);
            // Filter only YouTube videos
            const youtubeVideos = response.data.filter(doc => doc.type === 'youtube');
            setVideos(youtubeVideos);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            await deleteDocument(videoId, user.userId);
            loadVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-6 bg-white rounded-lg p-2 shadow-md w-fit">
                    <button
                        onClick={() => navigate('/pdfs')}
                        className="px-6 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                        📄 My PDFs
                    </button>
                    <button
                        className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white"
                    >
                        📹 My Videos
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">📹 My YouTube Videos</h2>
                    <p className="text-gray-600 mt-2">Add and study from YouTube video transcripts</p>
                </div>
                <YouTubeUpload userId={user.userId} onUploadSuccess={loadVideos} />

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">🎬 Your Video Library</h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 mt-2">Loading videos...</p>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-2 text-gray-500">No videos yet. Add your first YouTube video to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video) => (
                                <div key={video.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                                    {/* Video Thumbnail */}
                                    <div className="relative">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition">
                                            <span className="text-6xl">▶️</span>
                                        </div>
                                    </div>

                                    {/* Video Info */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-2xl flex-shrink-0">📹</span>
                                            <h4 className="font-semibold text-gray-800 line-clamp-2">{video.title || 'Untitled Video'}</h4>
                                        </div>

                                        {video.channel && (
                                            <p className="text-sm text-gray-600 mb-2">📺 {video.channel}</p>
                                        )}

                                        <p className="text-xs text-gray-500">
                                            Added: {
                                                video.uploadDate?._seconds
                                                    ? new Date(video.uploadDate._seconds * 1000).toLocaleDateString()
                                                    : video.uploadDate?.seconds
                                                        ? new Date(video.uploadDate.seconds * 1000).toLocaleDateString()
                                                        : video.uploadDate
                                                            ? new Date(video.uploadDate).toLocaleDateString()
                                                            : 'Unknown'
                                            }
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => navigate(`/document/${video.id}`)}
                                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                            >
                                                🤖 View & Study
                                            </button>
                                            <button
                                                onClick={() => handleDelete(video.id)}
                                                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
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

export default YouTubeDashboard;
