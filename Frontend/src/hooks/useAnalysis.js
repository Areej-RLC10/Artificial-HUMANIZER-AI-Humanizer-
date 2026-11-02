// src/hooks/useAnalysis.js
import { useState } from 'react';
import { analysis } from '../services/api';
import toast from 'react-hot-toast';

export const useAnalysis = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const analyzeText = async (text, action = 'both', style = 'casual') => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await analysis.analyze({ text, action, style });
            const payload = response.data?.data ?? response.data;
            setResults(payload);
            toast.success('Analysis complete!');
            return payload;
        } catch (error) {
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