// Frontend/src/pages/AnalysisDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysis } from '../services/api';
import { formatDate, formatScore, getScoreColor } from '../utils/formatters';
import { FiArrowLeft, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AnalysisDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await analysis.get(id);
                setData(response.data);
            } catch (error) {
                toast.error('Failed to load analysis');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold">Analysis not found</h2>
                <Link to="/history" className="text-emerald-600 hover:underline mt-4 inline-block">Go back to history</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Link to="/history" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                <FiArrowLeft /> Back to History
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Header Info */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analysis ID: #{data.id}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(data.created_at)}</p>
                    </div>
                    <div className="flex gap-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">AI Score</p>
                            <p className={`text-xl font-black ${getScoreColor(data.ai_score)}`}>{formatScore(data.ai_score)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                            <p className="text-sm font-bold text-emerald-600 capitalize">{data.status}</p>
                        </div>
                    </div>
                </div>

                {/* Side by Side Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Original Text</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {data.original_text}
                        </div>
                    </div>

                    {/* Humanized */}
                    <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Humanized Text</h3>
                            {data.processed_text && (
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(data.processed_text); toast.success('Copied!'); }}
                                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                    <FiCopy /> Copy
                                </button>
                            )}
                        </div>
                        <div className="p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {data.processed_text || <span className="text-gray-400 italic">No humanized text available for this analysis.</span>}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AnalysisDetail;