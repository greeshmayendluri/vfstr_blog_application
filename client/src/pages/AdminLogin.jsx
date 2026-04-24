import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, KeyRound, Lock, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                universityEmail: email,
                password
            });

            // STRICT ADMIN CHECK ALGORITHM
            if (res.data.user.role !== 'admin') {
                setError('ACCESS DENIED: Credentials verified, but account lacks Administrator clearance.');
                setIsLoading(false);
                return;
            }

            // Set localStorage items
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: res.data.user.id,
                name: res.data.user.name,
                branch: res.data.user.branch,
                role: res.data.user.role
            }));

            // Redirect automatically to the feed (where Admin controls spawn)
            navigate('/');
            // Slight delay then force reload to ensure the UI catches the new user context securely
            setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication sequence failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-red-500/30 font-sans z-[100]">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[600px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors text-sm font-semibold tracking-wide"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    RETURN TO PUBLIC GRID
                </button>

                {/* Main Auth Module */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden relative">
                    
                    {/* Top Topographic Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-red-950 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <ShieldAlert size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">RESTRICTED AREA</h2>
                        <p className="text-gray-400 font-medium text-sm tracking-wide">Administrator Portal Authentication</p>
                    </div>

                    {error && (
                        <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 mb-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2">
                            <Lock size={20} className="text-red-500 mb-2" />
                            <p className="text-red-400 text-sm font-bold leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Admin Identifier</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-sm"
                                placeholder="sysadmin@uniblog.edu"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Security Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-sm tracking-widest"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm tracking-widest uppercase rounded-xl py-4 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.3)] mt-8"
                        >
                            {isLoading ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Decrypting...</span>
                                </span>
                            ) : (
                                <span className="flex items-center space-x-2">
                                    <KeyRound size={18} />
                                    <span>Initiate Override</span>
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 mt-8 text-xs font-medium tracking-widest uppercase">
                    Unauthorized access triggers immediate termination.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
