// src/components/TextAnalyzer.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateText } from '../utils/validators';
import toast from 'react-hot-toast';
import { FiTrash2, FiCopy, FiSearch, FiEdit2 } from 'react-icons/fi';
import FileUpload from './FileUpload';
import HighlightedText from './HighlightedText';
import { motion } from 'framer-motion';

const TextAnalyzer = ({ loading, onAnalyze, onHumanize, humanizedText, detectionResult }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState('detector'); // Default to Detector

    const handleDetect = async () => {
        if (!validateText(text).valid) return toast.error(validateText(text).message);
        await onAnalyze(text); 
    };

    const handleHumanize = async () => {
        if (!validateText(text).valid) return toast.error(validateText(text).message);
        await onHumanize(text, 'Standard', { strength: 'Medium', length: 'Same' }); 
    };

    const handleRemoveText = () => {
        setText('');
    };

    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
    };

    const stats = {
        words: text.trim() ? text.split(/\s+/).length : 0,
        characters: text.length,
    };

    const aiScore = detectionResult ? (detectionResult.ai_score * 100).toFixed(1) : 0;

    return (
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 px-6 pt-4 gap-2">
                <button 
                    onClick={() => setActiveTab('humanizer')}
                    className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-colors ${activeTab === 'humanizer' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    AI Humanizer
                </button>
                <button 
                    onClick={() => setActiveTab('detector')}
                    className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-colors ${activeTab === 'detector' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    AI Detector <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded ml-1">NEW</span>
                </button>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                
                {/* Left Column: Original Text */}
                <div className="p-6 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your text</h3>
                        {text && (
                            <button onClick={handleRemoveText} className="text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Remove text
                            </button>
                        )}
                    </div>
                    
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full flex-1 bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed"
                        placeholder="Paste your text here..."
                        disabled={loading}
                    />
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Words: {stats.words} / 10,000</span>
                        
                        {/* Action Buttons (Only show the relevant one based on tab) */}
                        {activeTab === 'detector' ? (
                            <button onClick={handleDetect} disabled={loading || !text.trim()} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                                <FiSearch /> {loading ? 'Checking...' : 'Check for AI'}
                            </button>
                        ) : (
                            <button onClick={handleHumanize} disabled={loading || !text.trim()} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                                <FiEdit2 /> {loading ? 'Humanizing...' : 'Humanize AI'}
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">By checking, you agree to our Terms.</p>
                </div>

                {/* Right Column: Result / Detection */}
                <div className="p-6 flex flex-col min-h-[500px] bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {activeTab === 'detector' ? 'Detection result' : 'Result text'}
                        </h3>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                        {activeTab === 'humanizer' ? (
                            // HUMANIZER RESULT
                            humanizedText ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200">{humanizedText}</div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                        <button onClick={() => copyToClipboard(humanizedText)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <FiCopy /> Copy Text
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                    New text will appear here
                                </div>
                            )
                        ) : (
                            // DETECTOR RESULT
                            detectionResult ? (
                                <div className="flex-1 flex flex-col space-y-6">
                                    
                                    {/* Big AI Score Circle */}
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-[6px] border-dashed border-gray-300 dark:border-gray-600">
                                            <div className="text-center">
                                                <span className={`text-3xl font-black ${aiScore > 70 ? 'text-red-500' : aiScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>{aiScore}%</span>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">AI Score</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Highlighted Text */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sentence-level signals</p>
                                        <HighlightedText sentences={detectionResult.sentences} />
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                                        <span>Sentences analyzed: {detectionResult.sentences?.length || 0}</span>
                                        <button onClick={() => copyToClipboard(JSON.stringify(detectionResult, null, 2))} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            Copy Report
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4">
                                        <span className="font-bold text-gray-400">AI</span>
                                    </div>
                                    Your AI score will appear here.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
            
            {/* Bottom Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 py-3 text-center">
                <p className="text-xs text-gray-500 italic">Clever AI Detector shows probability, not proof — no AI checker is 100% accurate.</p>
            </div>
        </div>
    );
};

export default TextAnalyzer;