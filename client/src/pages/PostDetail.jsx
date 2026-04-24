import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { ArrowLeft } from 'lucide-react';

function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setPost(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching post detail:', err);
                setError('Failed to load post. It may have been deleted.');
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleUpdatePost = (postId, updatedPost) => {
        if (!updatedPost) {
            // Post was deleted
            navigate('/feed');
        } else {
            setPost(updatedPost);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-6">
                    <h2 className="text-xl font-bold mb-2">Oops!</h2>
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate('/feed')}
                    className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Feed</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 relative">
            <button
                onClick={() => navigate('/feed')}
                className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-semibold"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <PostCard post={post} onUpdate={handleUpdatePost} isFeedView={false} />
        </div>
    );
}

export default PostDetail;
