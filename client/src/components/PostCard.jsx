import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, ShieldCheck, UserPlus, UserMinus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const PostCard = ({ post, onUpdate, isFeedView = false, isHero = false, isWipingState = false, activeTab = 'feed' }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostTitle, setEditPostTitle] = useState(post.title);
    const [editPostContent, setEditPostContent] = useState(post.content);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [isFloating, setIsFloating] = useState(false);
    const [randomX, setRandomX] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [particles, setParticles] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && post.isAdminPost) {
            checkFollowingStatus();
        }
    }, [post.authorId]);

    const checkFollowingStatus = async () => {
        try {
            if (!post.authorId?._id) return;
            const res = await api.get('/users/following');
            setIsFollowing(res.data.includes(post.authorId._id));
        } catch (err) {
            console.error('Error checking follow status', err);
        }
    };

    const handleLike = async () => {
        try {
            const res = await api.put(`/posts/like/${post._id}`);
            onUpdate(post._id, { ...post, likes: res.data });
        } catch (err) {
            console.error('Error liking post', err);
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation(); // Prevent card click redirect
        try {
            if (!post.authorId?._id) return;
            const res = await api.put(`/users/follow/${post.authorId._id}`);
            setIsFollowing(res.data.isFollowing);
        } catch (err) {
            console.error('Error toggling follow', err);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/posts/comment/${post._id}`, { text: commentText });
            onUpdate(post._id, { ...post, comments: res.data });
            setCommentText('');
        } catch (err) {
            console.error('Error commenting', err);
        }
    };

    const handleDeletePost = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${post._id}`);
            onUpdate(post._id, null);
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleUpdatePost = async (e) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/posts/${post._id}`, { title: editPostTitle, content: editPostContent });
            onUpdate(post._id, res.data);
            setIsEditingPost(false);
        } catch (err) {
            console.error('Error updating post:', err);
        }
    };

    const handleDeleteComment = async (e, commentId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await api.delete(`/posts/comment/${post._id}/${commentId}`);
            onUpdate(post._id, { ...post, comments: res.data });
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleUpdateComment = async (e, commentId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await api.put(`/posts/comment/${post._id}/${commentId}`, { text: editCommentText });
            onUpdate(post._id, { ...post, comments: res.data });
            setEditingCommentId(null);
        } catch (err) {
            console.error('Error updating comment:', err);
        }
    };

    const startAntiGravityTransition = (navCallback) => {
        if (isFloating) return;
        setIsFloating(true);
        setTimeout(() => {
            navCallback();
        }, 500);
    };

    const handleCardClick = () => {
        // If they click anywhere on the card to navigate
        if (!isFeedView) return;
        if (post.isAdminPost) {
            startAntiGravityTransition(() => navigate(`/admin/publication/${post._id}`));
        }
    };

    const handleReadMoreToggle = (e) => {
        e.stopPropagation();
        
        // Unleash particles on click
        const newParticles = [1, 2, 3].map(i => ({
            id: Date.now() + i,
            x: Math.random() * 40 - 20, // Spread left/right
            rotation: Math.random() * 360
        }));
        
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000); // Cleanup

        setIsExpanded(!isExpanded);
    };

    const handleProfileClick = (e, userId) => {
        e.stopPropagation();
        e.preventDefault();
        startAntiGravityTransition(() => navigate(`/profile/${userId}`));
    };

    const isLiked = user && post.likes?.includes(user.id);

    // Helper function to map branch to a specific badge color
    const getBranchBadgeColor = (branch) => {
        const map = {
            'CSE': 'bg-blue-100 text-blue-800 border-blue-200',
            'IT': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'AI & DS': 'bg-purple-100 text-purple-800 border-purple-200',
            'ECE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'EEE': 'bg-amber-100 text-amber-800 border-amber-200',
            'MECH': 'bg-red-100 text-red-800 border-red-200',
            'CIVIL': 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return map[branch] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Check if post is created today for wipeout targeting
    const isPostedToday = new Date(post.createdAt).toDateString() === new Date().toDateString();
    
    // Dynamic exit logic based off if the wipeout was triggered globally and this post belongs to today
    const dynamicExit = isWipingState && isPostedToday 
        ? { opacity: 0, y: -1000, scale: 1.1, rotate: Math.random() * 20 - 10, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
        : { opacity: 0, y: -200, scale: 0.5, rotate: 15, transition: { duration: 0.5 } };

    return (
        <motion.div
            onClick={handleCardClick}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={isFloating ? { y: -20, opacity: 0, scale: 1.05 } : { y: 0, opacity: 1, scale: 1 }}
            whileHover={{ y: -8, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
            exit={dynamicExit}
            transition={{ type: "spring", stiffness: 120, mass: 0.5, damping: 15 }}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 group ${post.isAdminPost ? 'cursor-pointer border-indigo-200 ring-1 ring-indigo-50 shadow-indigo-100/20' : 'border-gray-100'} ${isHero ? 'mb-10 ring-2 ring-indigo-100 shadow-md' : 'mb-6'}`}
        >
            {post.isAdminPost && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 w-full"></div>
            )}
            <div className={isFeedView ? "p-5 sm:p-6" : "p-6 sm:p-8"}>
                <div className="flex justify-between items-start mb-6">
                    <a 
                        href={!post.isAdminPost && (post.authorId?._id || post.authorId) ? `/profile/${post.authorId._id || post.authorId}` : '#'}
                        onClick={(e) => {
                            const targetId = post.authorId?._id || post.authorId;
                            if (!post.isAdminPost && targetId) {
                                handleProfileClick(e, targetId);
                            } else {
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        }}
                        className="flex items-center space-x-4 hover:opacity-90 transition-opacity text-left cursor-pointer"
                    >
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transform group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 ${post.isAdminPost ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                            {post.isAdminPost ? <ShieldCheck size={28} /> : (post.authorId?.name?.charAt(0) || 'U')}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <p className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors hover:underline">
                                    {post.isAdminPost ? `${post.adminType || 'Admin'} Publication` : post.authorId?.name}
                                </p>
                                {post.isAdminPost && (
                                    <span className="flex items-center px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${getBranchBadgeColor(post.branchTag === 'ALL' ? 'General' : post.branchTag)}`}>
                                    {post.branchTag === 'ALL' ? 'Global' : post.branchTag}
                                </span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </a>

                    <div className="flex items-center space-x-2">
                        {post.isAdminPost && user && user.id !== post.authorId?._id && (
                            <button
                                onClick={handleFollow}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'}`}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus size={14} />
                                        <span>Following</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={14} />
                                        <span>Follow Admin</span>
                                    </>
                                )}
                            </button>
                        )}
                        {(user && (user.id === post.authorId?._id || user.role === 'admin')) ? (
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditingPost(!isEditingPost); }}
                                    className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                                    title="Edit Post"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={handleDeletePost}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    title="Delete Post"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full"
                            >
                                <MoreHorizontal size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                    {post.category && !isFeedView && (
                        <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600">
                            {post.category}
                        </span>
                    )}
                    {isEditingPost ? (
                        <div className="space-y-3 mt-2">
                            <input
                                type="text"
                                value={editPostTitle}
                                onChange={(e) => setEditPostTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <textarea
                                rows={4}
                                value={editPostContent}
                                onChange={(e) => setEditPostContent(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setIsEditingPost(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-semibold">Cancel</button>
                                <button onClick={handleUpdatePost} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm">Save Changes</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isFeedView ? (
                                <div>
                                    <motion.h3 
                                        onClick={() => navigate(`/post/${post._id}`)}
                                        className={`${isHero ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-extrabold text-gray-900 mb-2 leading-tight cursor-pointer inline-block`}
                                        whileHover={{ y: -5, textShadow: "0px 0px 8px rgba(139, 92, 246, 0.5)", color: "#7c3aed" }}
                                        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 0.1 }}
                                    >
                                        {post.title}
                                    </motion.h3>
                                    <AnimatePresence mode="wait">
                                        {!isExpanded ? (
                                            <motion.div
                                                key="collapsed"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0, scale: 0.98, transition: { duration: 0.2 } }}
                                                className={`text-gray-600 mt-2 text-base leading-relaxed ${isHero ? '' : 'line-clamp-2'}`}
                                            >
                                                {post.content}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="expanded"
                                                initial={{ opacity: 0, height: 0, y: -20 }}
                                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: -10 }}
                                                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                                                className="text-gray-600 mt-2 text-base leading-relaxed whitespace-pre-wrap"
                                            >
                                                {post.content}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!isHero && (activeTab === 'branch' || activeTab === 'global') && post.content?.length > 100 && (
                                        <div className="relative inline-block mt-4">
                                            {/* Particles Container */}
                                            <AnimatePresence>
                                                {particles.map(p => (
                                                    <motion.div
                                                        key={p.id}
                                                        initial={{ opacity: 1, y: 0, x: 0, scale: 0 }}
                                                        animate={{ opacity: 0, y: -40, x: p.x, scale: 1.5, rotate: p.rotation }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none text-indigo-400 z-10"
                                                    >
                                                        <Sparkles size={14} />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            
                                            <motion.button 
                                                onClick={handleReadMoreToggle}
                                                whileHover={{ y: -3, boxShadow: '0px 10px 20px rgba(139, 92, 246, 0.15)' }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative bg-white/30 backdrop-blur-md border border-indigo-100 shadow-sm text-indigo-600 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors hover:bg-indigo-50/50 overflow-hidden"
                                            >
                                                {isExpanded ? 'Show Less' : 'Read More'}
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">{post.title}</h3>
                                    <p className="text-gray-700 whitespace-pre-line text-base sm:text-lg leading-relaxed line-clamp-3">
                                        {post.content}
                                    </p>
                                </>
                            )}
                        </>
                    )}
                    {post.isAdminPost && (
                        <p className="mt-4 text-indigo-600 font-bold text-sm flex items-center transition-all group-hover:translate-x-1">
                            Read full publication
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </p>
                    )}
                </div>

                {post.branchTag !== 'ALL' && !isFeedView && (
                    <div className="mb-5 inline-block">
                        <span className="flex items-center bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-indigo-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            Exclusive to {post.branchTag}
                        </span>
                    </div>
                )}

                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-4 border-t border-gray-100 pt-5 mt-4"
                >
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-all duration-300 px-4 py-2 rounded-xl border
              ${isLiked
                                ? 'text-red-600 bg-red-50 border-red-100 shadow-sm'
                                : 'text-gray-600 border-gray-200 hover:text-red-500 hover:bg-red-50 hover:border-red-100'}`}
                    >
                        <Heart size={20} className={`transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'active:scale-95'}`} />
                        <span className="font-bold">{post.likes?.length || 0}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center space-x-2 transition-all duration-300 px-4 py-2 rounded-xl border
               ${showComments ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm' : 'text-gray-600 border-gray-200 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100'}`}
                    >
                        <MessageCircle size={20} className={showComments ? 'fill-current opacity-20 relative top-0 scale-110' : ''} />
                        <span className="font-bold">{post.comments?.length || 0}</span>
                    </button>
                </div>
            </div>

            {/* Embedded Comments Section */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`transition-all duration-500 ease-in-out ${showComments ? 'max-h-[800px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="bg-gray-50 p-6 sm:p-8">
                    <div className="space-y-5 mb-6">
                        {post.comments?.map((comment, idx) => (
                            <div key={idx} className="flex space-x-4 group/comment">
                                <div className="h-10 w-10 rounded-xl bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 shadow-sm">
                                    {comment.userId?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 flex-grow shadow-sm relative group">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <p className="font-bold text-gray-900 text-sm">{comment.userId?.name || 'User'}</p>
                                        <div className="flex items-center space-x-3">
                                            {/* Action icons appear on hover */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 mr-2">
                                                {user && user.id === comment.userId?._id && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingCommentId(comment._id); setEditCommentText(comment.text); }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Edit Comment"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                                {user && (user.id === comment.userId?._id || user.id === post.authorId?._id || user.role === 'admin') && (
                                                    <button
                                                        onClick={(e) => handleDeleteComment(e, comment._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Comment"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {editingCommentId === comment._id ? (
                                        <form onSubmit={(e) => handleUpdateComment(e, comment._id)} className="mt-2">
                                            <input
                                                type="text"
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                                                autoFocus
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button type="button" onClick={() => setEditingCommentId(null)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                                                <button type="submit" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Save</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed text-sm">{comment.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!post.comments || post.comments.length === 0) && (
                            <div className="text-center py-8 px-4 bg-white border border-gray-200 border-dashed rounded-2xl">
                                <p className="text-gray-500 font-semibold">No comments yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={submitComment} className="flex items-end space-x-3 mt-4 relative">
                        <div className="flex-grow">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full bg-white border border-gray-300 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm transition-all font-medium text-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`p-3.5 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center shrink-0 border
                ${commentText.trim()
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                            disabled={!commentText.trim()}
                        >
                            <Send size={20} className={commentText.trim() ? '-ml-1 mt-0.5' : ''} />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default PostCard;
