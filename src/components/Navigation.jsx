// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CreditDisplay from './CreditDisplay';
import { FiHome, FiClock, FiLogOut, FiChevronDown } from 'react-icons/fi';

const Navigation = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: FiHome },
        { name: 'History', path: '/history', icon: FiClock },
    ];

    return (
        <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-sm">
                            AI
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                                AI HUMANIZER
                            </span>
                            <span className="hidden md:inline text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                                v1.0
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <CreditDisplay credits={user?.credits || 0} />

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2 py-1.5 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;