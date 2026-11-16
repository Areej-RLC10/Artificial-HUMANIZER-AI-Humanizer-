import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MAX_WORDS = 300;

const countWords = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

const TryBox = () => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState('humanize');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [limitReached, setLimitReached] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');
    const [remaining, setRemaining] = useState(null);

    const words = countWords(text);
    const overLimit = words > MAX_WORDS;

    const handleSubmit = async () => {
        setError('');
        setResult(null);

        if (!words) {
            setError('Paste some text first.');
            return;
        }
        if (overLimit) {
            setError(`Please keep it under ${MAX_WORDS} words, or sign up for longer texts.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/try`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ text, mode }),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
                setLimitReached(true);
                setLimitMessage(data.message || "You've used today's free tries.");
                setRemaining(0);
                return;
            }
            if (!res.ok) {
                setError(data.message || 'Something went wrong. Please try again.');
                return;
            }

            setResult(data);
            if (typeof data.remaining === 'number') setRemaining(data.remaining);
        } catch {
            setError('Could not reach the server. It may be waking up, so please try again in a minute.');
        } finally {
            setLoading(false);
        }
    };

    const copyResult = () => {
        navigator.clipboard.writeText(result.humanized_text);
        toast.success('Copied!');
    };

    const tabClass = (active) =>
        `flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
            active
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
        }`;

    return (
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 text-left shadow-xl">
            <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                <button type="button" onClick={() => { setMode('humanize'); setResult(null); }} className={tabClass(mode === 'humanize')}>
                    Humanize
                </button>
                <button type="button" onClick={() => { setMode('detect'); setResult(null); }} className={tabClass(mode === 'detect')}>
                    Detect AI
                </button>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Paste your text here to try it free, no account needed..."
                className="w-full resize-y rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />

            <div className="mt-2 flex items-center justify-between text-xs">
                <span className={overLimit ? 'font-bold text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}>
                    {words} / {MAX_WORDS} words
                </span>
                {remaining !== null && !limitReached && (
                    <span className="text-gray-400 dark:text-gray-500">
                        {remaining} free {remaining === 1 ? 'try' : 'tries'} left today
                    </span>
                )}
            </div>

            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

            {limitReached ? (
                <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5 text-center">
                    <p className="font-bold text-gray-900 dark:text-white">{limitMessage}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Sign up free to keep going, with longer texts and saved history.
                    </p>
                    <Link to="/register" className="btn-primary mt-4 inline-block">
                        Sign up free
                    </Link>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary mt-4 flex w-full items-center justify-center gap-2"
                >
                    <FiZap className="h-4 w-4" />
                    <span>{loading ? 'Working...' : mode === 'humanize' ? 'Humanize text' : 'Check for AI'}</span>
                </button>
            )}

            {result && mode === 'humanize' && result.humanized_text && (
                <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Humanized text</h3>
                        <button type="button" onClick={copyResult} className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:underline">
                            <FiCopy /> Copy
                        </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">{result.humanized_text}</p>
                </div>
            )}

            {result && mode === 'detect' && typeof result.ai_score === 'number' && (
                <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">AI likelihood</p>
                    <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{Math.round(result.ai_score * 100)}%</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Detectors can be wrong. Treat this as a signal, not proof. Sign up for sentence-level highlighting.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TryBox;
