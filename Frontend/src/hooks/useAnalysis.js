// src/hooks/useAnalysis.js
import { useState } from 'react';
import { analysis } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useAnalysis = () => {
    const { updateCredits, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // Added settings parameter to accept strength and length from the frontend
    const analyzeText = async (text, action = 'both', style = 'casual', settings = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Send the new settings to the backend along with text, action, and style
            const response = await analysis.analyze({ 
                text, 
                action, 
                style,
                strength: settings.strength || 'Medium', // Fallback if undefined
                length: settings.length || 'Same'      // Fallback if undefined
            });

            // ✅ Backend returns { success, data, credits_remaining, ... }
            const payload = response.data?.data ?? response.data;
            setResults(payload);

            // ✅ Sync credits IMMEDIATELY (no page refresh needed)
            if (typeof response.data?.credits_remaining === 'number') {
                updateCredits(response.data.credits_remaining);
            }

            // ✅ Refresh full user in background (analyses_count, avg_ai_score)
            if (typeof refreshUser === 'function') {
                refreshUser().catch(() => {});
            }

            toast.success('Analysis complete!');
            return payload;
        } catch (error) {
            // Log detailed validation errors to the console for easy debugging
            if (error.response?.data?.errors) {
                console.error("Backend Validation Errors:", error.response.data.errors);
            }

            const backendMessage = error.response?.data?.message || error.response?.data?.error;
            const message = backendMessage || 'Analysis failed';
            
            setError(message);
            toast.error(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getHistory = async (page = 1) => {
        try {
            const response = await analysis.history(page);
            return response.data;
        } catch (error) {
            toast.error('Failed to load history');
            throw error;
        }
    };

    const getAnalysis = async (id) => {
        try {
            const response = await analysis.get(id);
            return response.data;
        } catch (error) {
            toast.error('Failed to load analysis');
            throw error;
        }
    };

    const clearResults = () => {
        setResults(null);
        setError(null);
    };

    return {
        loading,
        results,
        error,
        analyzeText,
        getHistory,
        getAnalysis,
        clearResults,
    };
};