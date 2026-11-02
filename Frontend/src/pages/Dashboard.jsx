import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalysis } from '../hooks/useAnalysis';
import TextAnalyzer from '../components/TextAnalyzer';
import ResultDisplay from '../components/ResultDisplay';
import { SplineSceneBasic } from '../components/SplineSceneBasic';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiCpu, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();
    const { loading, results, analyzeText, clearResults } = useAnalysis();

    const handleHumanize = async (text, style) => {
        await analyzeText(text, 'humanize', style);
    };

    const stats = [
        { label: 'Credits', value: user?.credits || 0, icon: FiBarChart2 },
        { label: 'Analyses', value: user?.analyses_count || 0, icon: FiTrendingUp },
        { label: 'Avg AI Score', value: user?.avg_ai_score || 'N/A', icon: FiCpu },
        { label: 'Status', value: 'Active', icon: FiCheckCircle, valueClass: 'text-green-600 dark:text-green-400' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            AI Humanizer
                        </p>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
                            Rewrite AI text into natural writing
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            Welcome back
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {user?.name || 'User'}
                        </p>
                    </div>
                </div>

                {/* Spline 3D Scene */}
                <div className="mt-8 mb-8">
                    <SplineSceneBasic />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="card card-hover text-center">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="stat-label">{stat.label}</p>
                                        <p className={`stat-value ${stat.valueClass || ''}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Analyzer */}
                <div className="card card-hover">
                    <TextAnalyzer
                        onAnalyze={analyzeText}
                        onHumanize={handleHumanize}
                        loading={loading}
                        humanizedText={results?.humanized}
                    />

                    {results && (
                        <ResultDisplay
                            results={results}
                            onClear={clearResults}
                        />
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;