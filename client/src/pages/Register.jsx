import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus } from 'lucide-react';

const branches = ['CSE', 'IT', 'AI & DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        universityEmail: '',
        password: '',
        branch: 'CSE',
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
        try {
            await api.post('/auth/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setError('');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            console.error('Registration Error Details:', err.response?.data);
            setError(err.response?.data?.message || 'An error occurred');
            setSuccess('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full">
            <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 transition-all duration-300 hover:shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="text-sm font-medium text-gray-500 mt-2">Join the exclusive university network.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm text-center font-bold tracking-wide">{error}</div>}
                    {success && <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-sm text-center font-bold tracking-wide">{success}</div>}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                            <input id="name" name="name" type="text" required
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                placeholder="John Doe"
                                value={formData.name} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">University Email</label>
                            <input id="universityEmail" name="universityEmail" type="email" required
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                placeholder="student@university.edu"
                                value={formData.universityEmail} onChange={handleChange} />
                        </div>

                        <div className="flex gap-4 flex-col sm:flex-row">
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                                <input id="password" name="password" type="password" required
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={handleChange} />
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Branch</label>
                                <select id="branch" name="branch"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 text-gray-900 transition-all font-semibold shadow-sm appearance-none cursor-pointer"
                                    value={formData.branch} onChange={handleChange}>
                                    {branches.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-extrabold text-white text-[15px]
                ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {isLoading ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                    <span>Processing...</span>
                                </span>
                            ) : 'Sign Up Securely'}
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-600 pt-6 border-t border-gray-100 mt-6 font-medium">
                        Already a member? <Link to="/login" className="font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors">Sign in here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
