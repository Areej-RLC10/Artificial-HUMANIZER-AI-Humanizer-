// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { auth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            setLoading(false);
            return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        auth.user()
            .then((response) => {
                setUser(response.data);
            })
            .catch(() => {
                localStorage.removeItem('auth_token');
                delete api.defaults.headers.common['Authorization'];
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        try {
            const response = await auth.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('auth_token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password, passwordConfirmation) => {
        try {
            const response = await auth.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            const { token, user } = response.data;

            localStorage.setItem('auth_token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const validationErrors = error.response?.data?.errors || {};
            const message = Object.values(validationErrors).flat()[0]
                || error.response?.data?.message
                || 'Registration failed';
            toast.error(message);
            return { success: false, errors: validationErrors, message };
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            // Ignore errors on logout
        } finally {
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    const updateCredits = (newCredits) => {
        setUser(prev => prev ? { ...prev, credits: newCredits } : null);
    };

    // ✅ NEW: Refresh full user object (credits, analyses_count, avg_ai_score)
    const refreshUser = async () => {
        try {
            const response = await auth.user();
            setUser(response.data);
            return response.data;
        } catch (error) {
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateCredits,
            refreshUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};