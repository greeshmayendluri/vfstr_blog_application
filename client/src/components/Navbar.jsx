import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LogIn, UserPlus, Edit3, ShieldCheck, LogOut } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { path: '/feed', label: 'Feed', icon: Home },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/login', label: 'Login', icon: LogIn },
        { path: '/register', label: 'Register', icon: UserPlus },
        { path: '/admin', label: 'Admin Portal', icon: ShieldCheck, isSpecial: true }
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Aligned Left */}
                    <div className="flex-shrink-0 flex items-center space-x-4">
                        <Link to="/" className="text-2xl font-black tracking-tight text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-lg">U</span>
                            UniBlog
                        </Link>
                        {user?.role === 'admin' && (
                            <div className="hidden sm:flex items-center px-2 py-1 bg-red-100 border border-red-200 text-red-700 rounded text-xs font-black tracking-wider uppercase">
                                Administrator
                            </div>
                        )}
                    </div>

                    {/* Navigation Links Aligned Right */}
                    <div className="flex items-center space-x-1 sm:space-x-3">
                        {navLinks.map(({ path, label, icon: Icon, isSpecial }) => {
                            const isActive = location.pathname === path;
                            
                            // Routing Logic
                            let showLink = true;
                            
                            // Hide login/register if already logged in
                            if ((path === '/login' || path === '/register') && user) showLink = false;
                            
                            // Hide profile if not logged in
                            if (path === '/profile' && !user) showLink = false;
                            
                            // Admin restrictions: Only show Admin Portal to logged-out users,
                            // since it leads to the AdminLogin page. If they are already logged in
                            // (as user or admin), no need to see the admin login page link.
                            if (path === '/admin' && user) showLink = false;

                            if (!showLink) return null;

                            // Distinct styling for Admin
                            if (isSpecial) {
                                return (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-300 ${isActive
                                                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
                                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50 hover:shadow-sm'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="hidden sm:inline-block">{label}</span>
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
                                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-105'
                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-sm'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:inline-block">{label}</span>
                                </Link>
                            );
                        })}

                        {/* Logout Button */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-300"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline-block">Logout</span>
                            </button>
                        )}

                        {/* New Post button integrated cleanly on the right side of Navbar if on Feed */}
                        {location.pathname === '/feed' && (
                            <button
                                onClick={() => document.dispatchEvent(new CustomEvent('openComposeModal'))}
                                className="hidden sm:flex items-center space-x-2 px-4 py-2 ml-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors duration-200"
                            >
                                <Edit3 size={16} />
                                <span>New Post</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

