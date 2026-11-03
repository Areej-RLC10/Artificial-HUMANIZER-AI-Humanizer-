// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validators } from '../utils/validators';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!validators.isRequired(value)) return 'Name is required';
                if (!validators.minLength(value, 2)) return 'Name must be at least 2 characters';
                return null;
            case 'email':
                if (!validators.isRequired(value)) return 'Email is required';
                if (!validators.isEmail(value)) return 'Invalid email address';
                return null;
            case 'password':
                if (!validators.isRequired(value)) return 'Password is required';
                if (!validators.minLength(value, 8)) return 'Password must be at least 8 characters';
                if (!validators.isStrongPassword(value)) {
                    return 'Password must contain uppercase, lowercase, number, and special character';
                }
                return null;
            case 'password_confirmation':
                if (value !== formData.password) return 'Passwords do not match';
                return null;
            default:
                return null;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors');
            return;
        }

        setLoading(true);
        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.password_confirmation
        );
        setLoading(false);
        if (result.success) {
            navigate('/');
        } else if (result.errors) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                ...Object.fromEntries(
                    Object.entries(result.errors).map(([field, messages]) => [field, messages[0]])
                ),
            }));
        }
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
                    <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Create your account</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Get 100 free credits to start</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiUser className="mr-1 inline h-3.5 w-3.5" />
                            Full Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiMail className="mr-1 inline h-3.5 w-3.5" />
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiLock className="mr-1 inline h-3.5 w-3.5" />
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
                        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">Min 8 chars, include uppercase, lowercase, number, special character</p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <FiLock className="mr-1 inline h-3.5 w-3.5" />
                            Confirm Password
                        </label>
                        <input
                            name="password_confirmation"
                            type="password"
                            required
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className={`input-field ${errors.password_confirmation ? 'border-red-500' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.password_confirmation && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex w-full items-center justify-center gap-2"
                    >
                        <FiUserPlus className="h-4 w-4" />
                        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                    </button>

                    <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition">
                            Sign In
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;