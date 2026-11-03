// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalysis } from '../hooks/useAnalysis';
import TextAnalyzer from '../components/TextAnalyzer';
import { SplineSceneBasic } from '../components/SplineSceneBasic';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const { loading, results, analyzeText, clearResults } = useAnalysis();

    const handleHumanize = async (text, style, settings) => {
        await analyzeText(text, 'humanize', style, settings);
    };

    const handleDetect = async (text) => {
        await analyzeText(text, 'detect'); 
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Clever AI Humanizer
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Estimate how likely a text was written by AI, and humanize it.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {user?.credits || 0} Credits Available
                        </p>
                    </div>
                </div>

                {/* Optional 3D Scene */}
                <div className="mb-8 hidden md:block">
                    <SplineSceneBasic />
                </div>

                {/* The Main UI Component */}
                <TextAnalyzer
                    onAnalyze={handleDetect}
                    onHumanize={handleHumanize}
                    loading={loading}
                    humanizedText={results?.humanized} 
                    detectionResult={results?.detection} 
                />
                
            </motion.div>
        </div>
    );
};

export default Dashboard;