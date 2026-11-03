// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) navigate('/');
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-white dark:bg-black">
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl"
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-xl">
                        AI
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">AI HUMANIZER</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiMail className="mr-1 inline h-3.5 w-3.5" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiLock className="mr-1 inline h-3.5 w-3.5" />
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex w-full items-center justify-center gap-2"
                    >
                        <FiLogIn className="h-4 w-4" />
                        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </button>

                    <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                        Don’t have an account?{' '}
                        <Link to="/register" className="font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;