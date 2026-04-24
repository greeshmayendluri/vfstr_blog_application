import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { KeyRound, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
    const [formData, setFormData] = useState({
        universityEmail: '',
        newPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/auth/reset-password', formData);
            setSuccess(res.data.message);
            // Optionally redirect after a few seconds
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 transition-all duration-300 hover:shadow-2xl relative">
                
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/login')} 
                    className="absolute top-6 left-6 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recovery</h2>
                    <p className="text-sm font-medium text-gray-500 mt-2">Set a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm text-center font-bold tracking-wide">{error}</div>}
                    {success && <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm text-center font-bold tracking-wide">{success}</div>}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">University Email</label>
                            <input id="universityEmail" name="universityEmail" type="email" required
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                placeholder="student@university.edu"
                                value={formData.universityEmail} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                            <input id="newPassword" name="newPassword" type="password" required minLength="6"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm tracking-widest"
                                placeholder="••••••••"
                                value={formData.newPassword} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-extrabold text-white text-[15px]
                 ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {isLoading ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                    <span>Resetting...</span>
                                </span>
                            ) : 'Reset Password'}
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-600 pt-6 border-t border-gray-100 mt-6 font-medium">
                        Remember your password <Link to="/login" className="font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors">Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
