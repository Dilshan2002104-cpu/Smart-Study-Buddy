import { useState } from 'react';
import { uploadFile } from '../services/api';

const FileUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please select a PDF file');
            setFile(null);
            return;
        }

        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setError('');
        setSuccess('');
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await uploadFile(file, user.userId);
            setSuccess('File uploaded successfully!');
            setFile(null);

            // Reset file input
            document.getElementById('file-input').value = '';

            // Notify parent component
            if (onUploadComplete) onUploadComplete();
        } catch (err) {
            setError('Upload failed: ' + (err.response?.data || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Upload PDF Document</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    {success}
                </div>
            )}

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                    <label
                        htmlFor="file-input"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <svg
                            className="w-12 h-12 text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <span className="text-gray-600 font-medium">
                            {file ? file.name : 'Click to select PDF file'}
                        </span>
                        <span className="text-gray-400 text-sm mt-1">
                            Maximum file size: 10MB
                        </span>
                    </label>
                </div>

                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FileUpload;