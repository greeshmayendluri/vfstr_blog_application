import React, { useEffect, useState } from 'react';
import { Github, Linkedin, BookOpen, Mail, User as UserIcon, LogOut, Settings, Bell, Save, Shield } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import PostCard from '../components/PostCard';

function Profile() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'settings'
    const [isSaving, setIsSaving] = useState(false);

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Form state for settings
    const [editForm, setEditForm] = useState({
        name: '',
        skills: '',
        githubUrl: '',
        linkedinUrl: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwnProfile = !userId || (currentUser && currentUser.id === userId);

    useEffect(() => {
        const fetchProfileData = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (userId && (!user || user.id !== userId)) {
                try {
                    const profileRes = await api.get(`/users/${userId}`);
                    const postsRes = await api.get(`/posts/user/${userId}`);
                    
                    const remoteProfile = profileRes.data;
                    setProfile({
                        name: remoteProfile.name,
                        branch: remoteProfile.branch,
                        universityEmail: remoteProfile.universityEmail || 'Confidential',
                        skills: remoteProfile.skills || [],
                        githubUrl: remoteProfile.githubUrl || '',
                        linkedinUrl: remoteProfile.linkedinUrl || ''
                    });
                    setMyPosts(postsRes.data);
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            } else if (user) {
                const initialProfile = {
                    name: user.name,
                    branch: user.branch,
                    universityEmail: user.universityEmail,
                    skills: user.skills || ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
                    githubUrl: user.githubUrl || 'https://github.com',
                    linkedinUrl: user.linkedinUrl || 'https://linkedin.com'
                };
                setProfile(initialProfile);
                setEditForm({
                    name: initialProfile.name,
                    skills: initialProfile.skills.join(', '),
                    githubUrl: initialProfile.githubUrl,
                    linkedinUrl: initialProfile.linkedinUrl
                });

                try {
                    const res = await api.get('/posts/me');
                    setMyPosts(res.data);
                } catch (err) {
                    console.error('Error fetching my posts:', err);
                }
            }

            // Simulate slight loading delay for skeleton polish
            setTimeout(() => {
                setLoading(false);
            }, 600);
        };

        fetchProfileData();
    }, []);

    const handleUpdatePost = (postId, updatedPost) => {
        if (!updatedPost) {
            setMyPosts(myPosts.filter(p => p._id !== postId));
        } else {
            setMyPosts(myPosts.map(p => p._id === postId ? updatedPost : p));
        }
    };

    const handleSettingsSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // In a real app, this would be an API call to update the user profile
            // await api.put('/users/profile', editForm);

            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update local state and mock storage
            setProfile(prev => ({
                ...prev,
                name: editForm.name,
                skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
                githubUrl: editForm.githubUrl,
                linkedinUrl: editForm.linkedinUrl
            }));

            // Update local storage user name
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.name = editForm.name;
                // For skills and links, we'd update them here too if the backend supported it
                user.skills = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
                user.githubUrl = editForm.githubUrl;
                user.linkedinUrl = editForm.linkedinUrl;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Optionally, show a success toast here
            setActiveTab('posts'); // Return to posts feed after saving
        } catch (error) {
            console.error('Error saving profile settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
        }

        try {
            const res = await api.put('/auth/update-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setPasswordMessage({ type: 'success', text: res.data.message || 'Password updated successfully' });
            setTimeout(() => {
                setIsChangingPassword(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Skeleton Header Dashboard */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-pulse">
                <div className="h-32 w-32 bg-gray-200 rounded-full shrink-0"></div>
                <div className="space-y-4 w-full text-center sm:text-left">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto sm:mx-0"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto sm:mx-0"></div>
                    <div className="flex justify-center sm:justify-start gap-3 mt-4">
                        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
            {/* Skeleton Body Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white h-64 rounded-3xl shadow-sm border border-gray-100 animate-pulse"></div>
                <div className="md:col-span-1 bg-white h-64 rounded-3xl shadow-sm border border-gray-100 animate-pulse"></div>
            </div>
        </div>
    );

    if (!profile) {
        if (!userId) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md mx-auto bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <UserIcon size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Access Restricted</h2>
                        <p className="text-gray-500 font-medium">Please sign in to view your professional dashboard.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-gray-500 font-bold">
                    User profile not found.
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                {/* Dashboard Top Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

                    <div className="px-8 pb-8 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left -mt-16">
                            <motion.div 
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl shrink-0 z-10 relative"
                            >
                                <span className="text-5xl font-black text-indigo-600">{profile.name.charAt(0)}</span>
                            </motion.div>

                            <motion.div 
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
                                className="mb-2"
                            >
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.name}</h1>
                                <div className="mt-2 flex items-center justify-center sm:justify-start text-gray-500 font-medium">
                                    <Mail size={18} className="mr-2 text-gray-400" />
                                    {profile.universityEmail}
                                </div>
                            </motion.div>
                        </div>

                        {/* Primary action buttons */}
                        {isOwnProfile && (
                        <div className="flex gap-3 justify-center sm:justify-end shrink-0 mb-2">
                            <button
                                onClick={() => setActiveTab(activeTab === 'settings' ? 'posts' : 'settings')}
                                className={`flex items - center px - 4 py - 2 border shadow - sm rounded - xl font - bold transition - colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600'} `}>
                                <Settings size={18} className="mr-2" /> {activeTab === 'settings' ? 'View Profile' : 'Settings'}
                            </button>
                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                                className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 shadow-sm rounded-xl font-bold hover:bg-red-100 hover:text-red-700 transition-colors"
                            >
                                <LogOut size={18} className="mr-2" /> Logout
                            </button>
                        </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Content (Left) */}
                    <div className="md:col-span-2 space-y-6">
                        {activeTab === 'posts' ? (
                            <>
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><BookOpen size={20} /></span>
                                        Academic Profile
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-start">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Major Branch</p>
                                            <span className={`px - 3 py - 1.5 rounded - lg text - sm font - extrabold uppercase tracking - widest border shadow - sm
                               ${profile.branch === 'CSE' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    profile.branch === 'IT' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' :
                                                        profile.branch === 'AI & DS' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                            profile.branch === 'ECE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                profile.branch === 'EEE' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                                    profile.branch === 'MECH' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                        profile.branch === 'CIVIL' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                            'bg-gray-100 text-gray-800 border-gray-200'
                                                } `}
                                            >
                                                {profile.branch}
                                            </span>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                            <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active Student
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🚀</span>
                                        Technical Arsenal
                                    </h3>

                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.skills && profile.skills.map((skill, index) => (
                                            <span key={index}
                                                className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* User Authored Posts Section Inline */}
                                <div className="mt-8 pt-4">
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl"><BookOpen size={24} /></span>
                                        {isOwnProfile ? 'My Authored Posts' : 'Authored Posts'}
                                    </h3>

                                    {myPosts.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
                                            <p className="text-gray-500 font-medium">{isOwnProfile ? "You haven't published any posts yet." : "This user hasn't published any posts yet."}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {myPosts.map((post, index) => (
                                                <motion.div
                                                    key={post._id}
                                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    transition={{ type: "spring", stiffness: 50, damping: 20, delay: index * 0.1 }}
                                                >
                                                    <PostCard post={post} onUpdate={handleUpdatePost} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : isOwnProfile && (
                            /* Settings Edit View */
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl"><Settings size={24} /></span>
                                    Profile Settings
                                </h3>

                                <form onSubmit={handleSettingsSave} className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-bold text-gray-900 border-b pb-2">Personal Information</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                                            <input type="text"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div className="opacity-70 cursor-not-allowed">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">University Email <span className="text-indigo-500 normal-case font-normal">(Cannot be changed)</span></label>
                                            <input type="email"
                                                value={profile.universityEmail}
                                                disabled
                                                className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="opacity-70 cursor-not-allowed">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Branch / Major <span className="text-indigo-500 normal-case font-normal">(Contact Admin to change)</span></label>
                                            <input type="text"
                                                value={profile.branch}
                                                disabled
                                                className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Tech Arsenal */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-md font-bold text-gray-900 border-b pb-2">Technical Summary</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skills (Comma separated)</label>
                                            <input type="text"
                                                value={editForm.skills}
                                                onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                                                placeholder="e.g. React, Node.js, Python, AWS"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-md font-bold text-gray-900 border-b pb-2">Professional Links</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GitHub URL</label>
                                            <input type="url"
                                                value={editForm.githubUrl}
                                                onChange={e => setEditForm({ ...editForm, githubUrl: e.target.value })}
                                                placeholder="https://github.com/username"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                                            <input type="url"
                                                value={editForm.linkedinUrl}
                                                onChange={e => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                                                placeholder="https://linkedin.com/in/username"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Account Security Preview */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-md font-bold text-gray-900 border-b pb-2 flex items-center"><Shield size={18} className="mr-2 text-indigo-600" /> Security Preferences</h4>

                                        {!isChangingPassword ? (
                                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-indigo-900">Password</p>
                                                    <p className="text-sm text-indigo-700">Protect your account access</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangingPassword(true)}
                                                    className="px-4 py-2 bg-white text-indigo-600 font-bold border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-bold text-indigo-900">Change Password</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsChangingPassword(false);
                                                            setPasswordMessage({ type: '', text: '' });
                                                        }}
                                                        className="text-sm text-indigo-600 font-bold hover:text-indigo-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>

                                                {passwordMessage.text && (
                                                    <div className={`p-3 rounded-lg text-sm font-bold ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {passwordMessage.text}
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    <input
                                                        type="password"
                                                        placeholder="Current Password"
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-800"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-800"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm New Password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-800"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={handlePasswordUpdate}
                                                        className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md"
                                                    >
                                                        Update Password
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t font-medium">
                                        <button type="submit" disabled={isSaving}
                                            className={`w - full py - 4 px - 4 rounded - xl flex items - center justify - center shadow - lg hover: shadow - xl hover: -translate - y - 0.5 transition - all duration - 300 font - extrabold text - white text - [15px]
                                ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} `}>
                                            {isSaving ? (
                                                <span className="flex items-center space-x-2">
                                                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                    <span>Saving Changes...</span>
                                                </span>
                                            ) : (
                                                <>
                                                    <Save size={20} className="mr-2" /> Save Profile Settings
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Content (Right) */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-5">Professional Links</h3>

                            <div className="space-y-3">
                                {profile.githubUrl && (
                                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-900 hover:text-white group rounded-2xl border border-gray-200 transition-all shadow-sm">
                                        <div className="flex items-center font-bold text-gray-700 group-hover:text-white transition-colors">
                                            <Github size={20} className="mr-3" /> GitHub
                                        </div>
                                        <span className="text-gray-400 group-hover:text-white">→</span >
                                    </a>
                                )}
                                {profile.linkedinUrl && (
                                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-600 hover:text-white group rounded-2xl border border-blue-100 transition-all shadow-sm">
                                        <div className="flex items-center font-bold text-blue-700 group-hover:text-white transition-colors">
                                            <Linkedin size={20} className="mr-3" /> LinkedIn
                                        </div>
                                        <span className="text-blue-400 group-hover:text-white">→</span >
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Placeholder Notification Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-md text-white">
                            <Bell size={28} className="mb-4 opacity-80" />
                            <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                            <p className="text-sm font-medium text-indigo-100">Make sure to check your main Feed regularly to keep up with branch events.</p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Profile;
