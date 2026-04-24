import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { RefreshCw, Edit3, X, Zap, Globe, Users, Rocket } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const categories = ['Academic', 'Projects', 'Placements', 'Events', 'Research', 'General'];

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'branch', 'global'
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isWiping, setIsWiping] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // New Post Modal State
    const [isComposing, setIsComposing] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General', branchTag: '', isAdminPost: false });
    const [composeError, setComposeError] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    // Listen for the custom event fired by the Navbar
    useEffect(() => {
        const handleOpenModal = () => setIsComposing(true);
        document.addEventListener('openComposeModal', handleOpenModal);
        return () => document.removeEventListener('openComposeModal', handleOpenModal);
    }, []);

    const fetchPosts = async (manualRefresh = false) => {
        if (manualRefresh) {
            setIsRefreshing(true);
            // Delay slightly to let the exit animation play
            await new Promise(resolve => setTimeout(resolve, 400));
        } else {
            setLoading(true);
        }
        
        try {
            const res = await api.get(`/posts?tab=${activeTab}`);
            console.log("Fetched posts:", res.data); // Debug statement
            setTimeout(() => {
                setPosts(res.data);
                if (manualRefresh) {
                    setRefreshKey(prev => prev + 1);
                    setIsRefreshing(false);
                } else {
                    setLoading(false);
                }
            }, 500); // Artificial delay for smooth UI transition
        } catch (err) {
            console.error('Error fetching posts:', err);
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setIsRefreshing(false); // Reset on tab switch, rely on normal loading
        fetchPosts(false);
    }, [activeTab]);

    const handleClearToday = async () => {
        if (!window.confirm("Are you sure you want to clear all posts created today?")) return;
        setIsWiping(true);
        try {
            // Trigger animation, wait
            await new Promise(resolve => setTimeout(resolve, 800));
            await api.delete('/posts/admin/today');
            await fetchPosts(true); // Soft refresh to slide everything down
        } catch (err) {
            console.error('Error clearing posts:', err);
        } finally {
            setIsWiping(false);
        }
    };

    const handleUpdatePost = (postId, updatedPost) => {
        if (!updatedPost) {
            setPosts(posts.filter(p => p._id !== postId));
        } else {
            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) {
            setComposeError('Title and content are required.');
            return;
        }
        try {
            setComposeError('');
            // Optional: If user is not admin, forcefully remove the flag just in case
            const payload = { ...newPost };
            if (user?.role !== 'admin') {
                delete payload.isAdminPost;
            }

            const res = await api.post('/posts', payload);
            setPosts([res.data, ...posts]);
            setNewPost({ title: '', content: '', category: 'General', branchTag: '', isAdminPost: false });
            setIsComposing(false);
        } catch (err) {
            setComposeError(err.response?.data?.message || 'Failed to create post');
        }
    };

    return (
        <div className="relative pb-24 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 px-2 sm:px-0">
                <div className="mb-4 sm:mb-0">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Zap size={32} className="text-indigo-600" />
                        University Feed
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Discover real-time updates across all branches.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleClearToday}
                        disabled={isWiping}
                        title="Clear Today's Posts"
                        className="flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:text-white transition-all bg-red-50 hover:bg-red-600 rounded-xl shadow-sm border border-red-200 hover:shadow-md font-semibold text-sm disabled:opacity-50"
                    >
                        <span>Clear Today</span>
                    </button>
                    <button
                        onClick={() => fetchPosts(true)}
                        title="Refresh Feed"
                        className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-indigo-600 transition-all bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-100 font-semibold text-sm"
                    >
                        <RefreshCw size={18} className={loading || isRefreshing ? 'animate-spin text-indigo-500' : ''} />
                        <span>Sync</span>
                    </button>
                </div>
            </div>

            {/* Feed Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-8 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'feed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                >
                    <Zap size={18} className="mr-2.5" />
                    Feed
                </button>
                <button
                    onClick={() => setActiveTab('branch')}
                    className={`flex items-center px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'branch' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                >
                    <Users size={18} className="mr-2.5" />
                    For Your Branch
                </button>
                <button
                    onClick={() => setActiveTab('global')}
                    className={`flex items-center px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'global' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                >
                    <Globe size={18} className="mr-2.5" />
                    Global Updates
                </button>
            </div>

            {/* The Feed */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="loading-skeletons"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100, transition: { duration: 0.4 } }}
                        className="space-y-6"
                    >
                        {[1, 2, 3].map((n) => (
                            <motion.div 
                                key={n} 
                                animate={{ y: [-5, 5, -5], opacity: [0.3, 0.7, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: n * 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100/50 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                <div className="flex space-x-4 mb-4">
                                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl border border-indigo-100/50"></div>
                                    <div className="space-y-3 flex-1 py-1">
                                        <div className="h-5 bg-indigo-50 rounded-md w-1/3"></div>
                                        <div className="h-3 bg-gray-50 rounded-md w-1/5"></div>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-6 mt-6">
                                    <div className="h-8 bg-indigo-50 rounded-md w-3/4"></div>
                                    <div className="h-4 bg-gray-50 rounded-md w-full"></div>
                                    <div className="h-4 bg-gray-50 rounded-md w-5/6"></div>
                                    <div className="h-4 bg-gray-50 rounded-md w-4/6"></div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : posts.length === 0 ? (
                    <motion.div 
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -100, transition: { duration: 0.4 } }}
                        className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30 pointer-events-none"></div>
                        <motion.div 
                            animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100 relative z-10"
                        >
                            <Rocket className="text-indigo-500 fill-indigo-100 translate-x-1 -translate-y-1" size={56} />
                        </motion.div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 relative z-10 tracking-tight">Houston, we have a problem...</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg relative z-10">No posts found in this galaxy. Be the first explorer to leave a mark!</p>
                        
                        <motion.button
                            onClick={() => setIsComposing(true)}
                            whileHover={{ scale: 1.05, y: -10 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="relative z-10 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200/50 font-extrabold transition-colors flex items-center mx-auto space-x-2"
                        >
                            <span>Create First Post</span>
                            <Zap size={20} className="fill-current opacity-80" />
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="space-y-6 overflow-hidden" key="feed-list">
                        {!isRefreshing && (
                            <motion.div
                                key={`${activeTab}-${refreshKey}`}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.15 }
                                    },
                                    exit: (custom) => {
                                        if (custom?.wiping) {
                                            return {
                                                opacity: 0,
                                                y: -1000,
                                                scale: 1.1,
                                                rotate: Math.random() * 20 - 10,
                                                transition: { duration: 0.6, type: "spring", stiffness: 50, damping: 20 }
                                            };
                                        }
                                        return {
                                            opacity: 0,
                                            y: -100,
                                            transition: { duration: 0.4, staggerChildren: 0.05, staggerDirection: -1 }
                                        };
                                    }
                                }}
                            >
                                {posts.length > 0 && (
                                    <PostCard 
                                        key={posts[0]._id} 
                                        post={posts[0]} 
                                        onUpdate={handleUpdatePost} 
                                        isFeedView={true} 
                                        isHero={true} 
                                        refreshKey={refreshKey} 
                                        activeTab={activeTab}
                                    />
                                )}
                                {posts.slice(1).map(post => (
                                    <PostCard 
                                        key={post._id} 
                                        post={post} 
                                        onUpdate={handleUpdatePost} 
                                        isFeedView={true} 
                                        isHero={false}
                                        refreshKey={refreshKey} 
                                        activeTab={activeTab}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>

            {/* Compose Post Modal Overlay */}
            {isComposing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
                        onClick={() => setIsComposing(false)}
                    ></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 transform transition-all overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
                            <button
                                onClick={() => setIsComposing(false)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {composeError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 font-medium text-center">
                                {composeError}
                            </div>
                        )}

                        <form onSubmit={handleCreatePost} className="space-y-6">
                            <div>
                                <input
                                    type="text" placeholder="Title your post..."
                                    value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white text-gray-900 font-bold text-xl transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <textarea
                                    rows="5" placeholder="Share your thoughts, questions, or opportunities..."
                                    value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white text-gray-900 resize-none transition-all text-base shadow-sm"
                                ></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Category</label>
                                    <select
                                        value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white focus:ring-indigo-500 text-gray-900 font-semibold transition-all cursor-pointer"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Visibility</label>
                                    <select
                                        value={newPost.branchTag} onChange={e => setNewPost({ ...newPost, branchTag: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:bg-white focus:ring-indigo-500 text-gray-900 font-semibold transition-all cursor-pointer"
                                    >
                                        <option value="ALL">Public (All Branches)</option>
                                        <option value="">Private (My Branch Only)</option>
                                    </select>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <input 
                                        type="checkbox" 
                                        id="isAdminPost" 
                                        checked={newPost.isAdminPost}
                                        onChange={e => setNewPost({ ...newPost, isAdminPost: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <label htmlFor="isAdminPost" className="text-sm font-bold text-indigo-900 cursor-pointer select-none">
                                        Post as Admin Publication <span className="text-indigo-600 font-normal ml-1">(Bypasses Branch Filters)</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex justify-end pt-6 mt-4 border-t border-gray-100 gap-3">
                                <button type="button" onClick={() => setIsComposing(false)} className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 font-bold transition-all duration-200 flex items-center">
                                    <span>Publish</span>
                                    <Edit3 size={18} className="ml-2" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Feed;
