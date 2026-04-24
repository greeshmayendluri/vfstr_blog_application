import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen border-none outline-none bg-gray-50 text-gray-900 font-sans pt-[72px]">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8 md:py-10 transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
