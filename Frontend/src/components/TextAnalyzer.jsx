// src/components/TextAnalyzer.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateText } from '../utils/validators';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiSearch } from 'react-icons/fi';
import FileUpload from './FileUpload';
import { motion } from 'framer-motion';

const TextAnalyzer = ({ loading, onAnalyze, onHumanize, humanizedText }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please log in to analyze text.');
            return;
        }

        const validation = validateText(text);
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        await onAnalyze(text, 'both', 'casual');
    };

    const handleHumanize = async () => {
        const validation = validateText(text);
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        await onHumanize(text, 'casual');
    };

    const handleFileUpload = (content) => {
        setText(content);
    };

    const stats = {
        characters: text.length,
        words: text.trim() ? text.split(/\s+/).length : 0,
        sentences: text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0,
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        <FiEdit2 className="mr-1.5 inline h-3.5 w-3.5" />
                        Input
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        rows={11}
                        className={`input-field resize-y transition-all duration-200 ${
                            isFocused ? 'ring-2 ring-gray-900 dark:ring-white' : ''
                        }`}
                        placeholder="Paste your AI-written text here or upload a file..."
                        disabled={loading}
                    />
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span>{stats.characters} characters</span>
                        <span>{stats.words} words</span>
                        <span>{stats.sentences} sentences</span>
                        {stats.characters >= 10 && (
                            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <FiCheck className="w-3 h-3" /> Valid
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        <FiEdit2 className="mr-1.5 inline h-3.5 w-3.5" />
                        Output
                    </label>
                    <textarea
                        value={humanizedText || 'Your rewritten text will appear here...'}
                        readOnly
                        rows={11}
                        className="input-field resize-y bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder="Humanized text will appear here"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3">
                <FileUpload onFileUpload={handleFileUpload} loading={loading} text={text} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={handleHumanize}
                    disabled={loading || !text.trim()}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            <span>Processing...</span>
                        </span>
                    ) : (
                        <>
                            <FiEdit2 className="h-4 w-4" />
                            <span>Humanize Text</span>
                        </>
                    )}
                </button>

                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                    <FiSearch className="h-4 w-4" />
                    Detect AI
                </button>
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                You have <span className={`font-bold ${user?.credits < 10 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {user?.credits || 0}
                </span> credits remaining
            </div>
        </motion.form>
    );
};

export default TextAnalyzer;