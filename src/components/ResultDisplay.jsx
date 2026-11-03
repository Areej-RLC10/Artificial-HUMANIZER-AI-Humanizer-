// src/components/ResultDisplay.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { formatScore, getScoreColor, getScoreBg } from '../utils/formatters';
import { calculatePlagiarismScore } from '../utils/fileParsers';
import toast from 'react-hot-toast';
import { FiCopy, FiDownload, FiCheck } from 'react-icons/fi';

const ResultDisplay = ({ results, onClear }) => {
    const [copied, setCopied] = useState(false);

    if (!results) return null;

    const handleCopy = () => {
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `humanized_text_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded successfully!');
    };

    const detection = results.detection || null;
    const humanizedText = results.humanized || '';
    const originalText = results.original_text || '';
    const aiScore = detection?.ai_score ?? 0;
    const humanScore = detection ? 1 - detection.ai_score : 0;
    const confidence = detection?.confidence ?? 0;
    const plagiarismScore = calculatePlagiarismScore(originalText || humanizedText || detectionSummary);

    const normalizeIndicator = (indicator) => {
        if (typeof indicator === 'string') return indicator;
        if (!indicator) return '';
        if (typeof indicator === 'object') {
            return indicator.description || indicator.reason || indicator.text || JSON.stringify(indicator);
        }
        return String(indicator);
    };

    const indicatorList = (detection?.indicators || []).map(normalizeIndicator).filter(Boolean);

    const detectionSummary = detection
        ? [
            `AI Score: ${formatScore(aiScore)}`,
            `Human Score: ${formatScore(humanScore)}`,
            `Confidence: ${formatScore(confidence)}`,
            'Indicators:',
            ...indicatorList.map((item) => `• ${item}`),
        ].join('\n')
        : 'AI detection results will appear here.';

    const finalSummary = detection
        ? `This text is ${aiScore > 0.7 ? 'likely AI-generated' : aiScore > 0.4 ? 'possibly AI-generated' : 'likely human-written'} with ${formatScore(confidence)} confidence.`
        : 'Your analysis summary will appear here.';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analysis Results</h3>
                {onClear && (
                    <button
                        onClick={onClear}
                        className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`rounded-xl p-4 border ${getScoreBg(aiScore)}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">AI Score</p>
                    <p className={`text-2xl font-black ${getScoreColor(aiScore)}`}>{formatScore(aiScore)}</p>
                </div>
                <div className={`rounded-xl p-4 border ${getScoreBg(humanScore)}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Human Score</p>
                    <p className={`text-2xl font-black ${getScoreColor(humanScore)}`}>{formatScore(humanScore)}</p>
                </div>
                <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Confidence</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{formatScore(confidence)}</p>
                </div>
                <div className="rounded-xl p-4 border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-500/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-300">Plagiarism</p>
                    <p className="text-2xl font-black text-yellow-700 dark:text-yellow-200">{formatScore(plagiarismScore)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        AI Detection Report
                    </label>
                    <textarea
                        readOnly
                        value={detectionSummary}
                        rows={10}
                        className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-800 dark:text-gray-200 p-3 outline-none"
                    />
                </div>

                <div className="rounded-xl border border-green-500/40 bg-green-50 dark:bg-green-500/5 p-4">
                    <label className="block text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-2">
                        AI Paraphraser Output
                    </label>
                    <textarea
                        readOnly
                        value={humanizedText || 'Paraphrased output will appear here.'}
                        rows={10}
                        className="w-full resize-none rounded-xl border border-green-500/30 bg-white dark:bg-gray-950 text-sm text-gray-800 dark:text-gray-100 p-3 outline-none"
                    />
                    {humanizedText && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            <CopyToClipboard text={humanizedText} onCopy={handleCopy}>
                                <button className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold hover:bg-gray-700 dark:hover:bg-gray-200 transition flex items-center gap-1">
                                    {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </CopyToClipboard>
                            <button
                                onClick={() => handleDownload(humanizedText)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1"
                            >
                                <FiDownload className="w-3 h-3" />
                                Download
                            </button>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-blue-500/40 bg-blue-50 dark:bg-blue-500/5 p-4">
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                        Plagiarism & Summary
                    </label>
                    <textarea
                        readOnly
                        value={finalSummary + (originalText ? `\n\nOriginal text:\n${originalText}` : '')}
                        rows={10}
                        className="w-full resize-none rounded-xl border border-blue-500/30 bg-white dark:bg-gray-950 text-sm text-gray-800 dark:text-gray-100 p-3 outline-none"
                    />
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{humanizedText ? 'Paraphrased version ready' : 'Waiting for text analysis'}</span>
                        {results.processing_time && <span>⚡ {results.processing_time}ms</span>}
                    </div>
                </div>
            </div>

            {indicatorList.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Key Indicators</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        {indicatorList.map((indicator, index) => (
                            <li key={`${indicator}-${index}`} className="flex items-start gap-2">
                                <span className="mt-1 text-gray-400 dark:text-gray-500">•</span>
                                <span>{indicator}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
};

export default ResultDisplay;