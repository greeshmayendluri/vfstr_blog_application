import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Shield, Share2, Printer } from 'lucide-react';
import api from '../api/axios';

const AdminPublication = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // We might need a specific get post by id endpoint, 
                // but let's assume we can fetch it via /posts or similar if we had one.
                // For now, let's fetch all and filter or assume /api/posts/:id exists.
                const res = await api.get(`/posts`); // fallback if single fetch not available
                const found = res.data.find(p => p._id === id);
                setPost(found);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching publication', err);
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Publication not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline"
                >
                    <ArrowLeft size={20} />
                    <span>Go Back</span>
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <Printer size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Admin Badge & Title */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:shadow-2xl duration-500">
                    <div className="h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>

                    <div className="p-8 sm:p-12">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <Shield size={24} />
                            </div>
                            <span className="text-indigo-600 font-extrabold tracking-widest text-sm uppercase">
                                Official {post.adminType || 'Publication'}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-8">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-500 border-y border-slate-100 py-6 mb-10">
                            <div className="flex items-center space-x-2">
                                <User size={18} className="text-slate-400" />
                                <span className="font-bold text-slate-700">{post.authorId?.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar size={18} className="text-slate-400" />
                                <span className="font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate prose-lg max-w-none">
                            <p className="whitespace-pre-line text-slate-700 leading-relaxed text-xl">
                                {post.content}
                            </p>
                        </div>

                        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {post.authorId?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 leading-none">{post.authorId?.name}</p>
                                    <p className="text-sm text-slate-500 mt-1">{post.authorId?.branch} Administration</p>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium">
                                    Document ID: {post._id?.substring(0, 8).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footnote */}
                <div className="mt-8 text-center px-8 text-slate-400 text-sm font-medium">
                    This is an official communication from the university {post.adminType || 'Department'}.
                    All information provided is subject to institutional guidelines.
                </div>
            </div>
        </div>
    );
};

export default AdminPublication;
