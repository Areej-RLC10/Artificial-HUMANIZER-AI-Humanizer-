// src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatScore, getScoreColor } from '../utils/formatters';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight } from 'react-icons/fi';

const History = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setHistory([
                {
                    id: 1,
                    original_text: "This is an AI-generated sample text that was analyzed for detection.",
                    ai_score: 0.78,
                    created_at: new Date().toISOString(),
                    status: 'completed'
                },
                {
                    id: 2,
                    original_text: "Another example of AI content that needed humanization.",
                    ai_score: 0.65,
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    status: 'completed'
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                <h1 className="text-2xl font-black text-white">
                    <FiClock className="inline w-5 h-5 mr-2 text-blue-400" />
                    Analysis History
                </h1>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {history.length} entries
                </span>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-bold text-white">No History Yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Start analyzing text to build your history</p>
                    <Link to="/" className="inline-block mt-4 btn-primary">
                        Analyze Text
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="card card-hover"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="text-xs font-medium text-gray-500">
                                            {formatDate(item.created_at)}
                                        </span>
                                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium line-clamp-2">
                                        {item.original_text}
                                    </p>
                                    {item.ai_score && (
                                        <div className="flex items-center mt-2 space-x-3">
                                            <span className="text-xs font-bold text-gray-500">AI Score:</span>
                                            <span className={`text-xs font-bold ${getScoreColor(item.ai_score)}`}>
                                                {formatScore(item.ai_score)}
                                            </span>
                                            <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.ai_score > 0.7 ? 'bg-red-500' : item.ai_score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${item.ai_score * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to={`/analysis/${item.id}`}
                                    className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    <span>View</span>
                                    <FiChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;