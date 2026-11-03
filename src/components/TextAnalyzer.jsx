// src/components/TextAnalyzer.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateText } from '../utils/validators';
import toast from 'react-hot-toast';
import { FiTrash2, FiCopy, FiSearch, FiEdit2 } from 'react-icons/fi';
import FileUpload from './FileUpload';
import HighlightedText from './HighlightedText';
import { motion, AnimatePresence } from 'framer-motion';

const TextAnalyzer = ({ loading, onAnalyze, onHumanize, humanizedText, detectionResult }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState('humanizer'); 
    
    // Paraphraser settings
    const [style, setStyle] = useState('Standard');

    const handleDetect = async () => {
        if (!validateText(text).valid) return toast.error(validateText(text).message);
        await onAnalyze(text); 
    };

    const handleHumanize = async (isParaphrase = false) => {
        if (!validateText(text).valid) return toast.error(validateText(text).message);
        // If it's paraphrasing, use the selected style. Otherwise use default for humanizer.
        const selectedStyle = isParaphrase ? style.toLowerCase() : 'standard';
        await onHumanize(text, selectedStyle, { strength: 'Medium', length: 'Same' }); 
    };

    const stats = { words: text.trim() ? text.split(/\s+/).length : 0 };
    const aiScore = detectionResult ? (detectionResult.ai_score * 100).toFixed(1) : 0;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden min-h-[600px]">
            
            {/* Top Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 px-4 pt-4 gap-2 overflow-x-auto">
                <button onClick={() => setActiveTab('humanizer')} className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'humanizer' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}>AI Humanizer</button>
                <button onClick={() => setActiveTab('detector')} className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'detector' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}>AI Detector <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded ml-1">NEW</span></button>
                <button onClick={() => setActiveTab('paraphraser')} className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors whitespace-nowrap ${activeTab === 'paraphraser' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}>AI Paraphraser</button>
            </div>

            {/* Settings Bar (Only for Paraphraser) */}
            {activeTab === 'paraphraser' && (
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Style</span>
                    <select value={style} onChange={(e) => setStyle(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium outline-none">
                        <option>Standard</option>
                        <option>Fluency</option>
                        <option>Formal</option>
                        <option>Simple</option>
                        <option>Academic</option>
                        <option>Creative</option>
                    </select>
                </div>
            )}

            {/* Main Content Area with Slide Animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === 'detector' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === 'detector' ? -20 : 20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800"
                >
                    
                    {/* ---------------- LEFT COLUMN (Input) ---------------- */}
                    <div className="p-6 flex flex-col min-h-[450px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                {activeTab === 'detector' ? 'Your text' : 'Original text'}
                            </h3>
                            {text && (
                                <button onClick={() => setText('')} className="text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-100">
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
                            <span className="text-xs text-gray-400">Words: {stats.words} / 5,000</span>
                            
                            {activeTab === 'detector' && (
                                <button onClick={handleDetect} disabled={loading || !text.trim()} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition disabled:opacity-50">
                                    {loading ? 'Checking...' : 'Check for AI'}
                                </button>
                            )}
                            {activeTab === 'humanizer' && (
                                <button onClick={() => handleHumanize(false)} disabled={loading || !text.trim()} className="px-6 py-2.5 bg-black text-white font-bold rounded-lg transition disabled:opacity-50">
                                    {loading ? 'Humanizing...' : 'Humanize AI'}
                                </button>
                            )}
                            {activeTab === 'paraphraser' && (
                                <button onClick={() => handleHumanize(true)} disabled={loading || !text.trim()} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition disabled:opacity-50">
                                    {loading ? 'Paraphrasing...' : 'Paraphrase'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ---------------- RIGHT COLUMN (Output/Detection) ---------------- */}
                    <div className="p-6 flex flex-col min-h-[450px] bg-gray-50/30 dark:bg-gray-900/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                {activeTab === 'detector' ? 'Detection result' : 'Result text'}
                            </h3>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            
                            {/* --- DETECTOR VIEW --- */}
                            {activeTab === 'detector' && (
                                detectionResult ? (
                                    <div className="flex-1 flex flex-col space-y-6">
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-dashed border-gray-300">
                                                <div className="text-center">
                                                    <span className={`text-2xl font-black ${aiScore > 70 ? 'text-red-500' : aiScore > 40 ? 'text-yellow-500' : 'text-sky-500'}`}>{aiScore}%</span>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">AI Score</p>
                                                </div>
                                            </div>
                                        </div>
                                        <HighlightedText sentences={detectionResult.sentences} />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 font-bold">AI</div>
                                        Your AI score will appear here.
                                    </div>
                                )
                            )}

                            {/* --- HUMANIZER VIEW --- */}
                            {activeTab === 'humanizer' && (
                                humanizedText ? (
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                            {humanizedText}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button onClick={() => { navigator.clipboard.writeText(humanizedText); toast.success('Copied'); }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 flex items-center gap-2">
                                                <FiCopy /> Copy Text
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">New text will appear here</div>
                                )
                            )}

                            {/* --- PARAPHRASER VIEW --- */}
                            {activeTab === 'paraphraser' && (
                                humanizedText ? (
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                            {humanizedText}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button onClick={() => { navigator.clipboard.writeText(humanizedText); toast.success('Copied'); }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 flex items-center gap-2">
                                                <FiCopy /> Copy Text
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Paraphrased text will appear here</div>
                                )
                            )}

                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Bottom Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 py-3 text-center">
                <p className="text-xs text-gray-500 italic">Clever AI Humanizer shows probability, not proof — no AI checker is 100% accurate.</p>
            </div>
        </div>
    );
};

export default TextAnalyzer;