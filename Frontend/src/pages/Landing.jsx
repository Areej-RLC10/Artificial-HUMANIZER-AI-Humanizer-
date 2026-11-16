import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiSearch, FiEdit3 } from 'react-icons/fi';
import TryBox from '../components/TryBox';

const TOOLS = [
    {
        icon: FiCpu,
        title: 'AI Humanizer',
        text: 'Rewrite AI-generated text so it reads naturally, with varied sentence rhythm and a more personal tone, while keeping your meaning.',
    },
    {
        icon: FiSearch,
        title: 'AI Detector',
        text: 'See which sentences look machine-written. Sentence-level highlighting shows exactly where to edit instead of one vague score.',
    },
    {
        icon: FiEdit3,
        title: 'Paraphraser',
        text: 'Reword a paragraph in a fresh voice without changing what it says. Useful for emails, essays and posts.',
    },
];

const STEPS = [
    'Paste your text into the box.',
    'Choose Humanize, Detect or Paraphrase.',
    'Review the result, then edit it so it sounds like you.',
];

const FAQ = [
    { q: 'Is AI Humanizer free?', a: 'Yes. Create a free account and you get 100 credits to start.' },
    {
        q: 'How does the AI detector work?',
        a: 'It analyses writing patterns sentence by sentence, such as repetitive phrasing and uniform rhythm, and highlights the lines that look AI-written.',
    },
    {
        q: 'Can the detector be wrong?',
        a: 'Yes. No AI detector is 100% accurate. Treat the result as a signal to review your text, not as proof.',
    },
    {
        q: 'Will the humanizer keep my meaning?',
        a: 'It is designed to keep your ideas and change the wording and flow. Always read the result and adjust it before you use it.',
    },
    {
        q: 'Is my text stored?',
        a: 'Texts you analyse while logged in are saved to your history so you can compare versions. Do not paste anything confidential.',
    },
];

const Landing = () => {
    useEffect(() => {
        document.title = 'Free AI Humanizer, AI Detector & Paraphraser | AI Humanizer';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
        }
        meta.setAttribute(
            'content',
            'Make AI-written text sound natural. Free AI humanizer, AI content detector with sentence highlighting, and paraphraser.'
        );
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            <header className="border-b border-gray-200 dark:border-gray-800">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black">
                            AI
                        </div>
                        <span className="text-lg font-black tracking-tight">AI HUMANIZER</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition">
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-xl bg-black dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-black hover:opacity-80 transition"
                        >
                            Sign up free
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                <section className="mx-auto max-w-3xl px-4 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            Humanize · Detect · Paraphrase
                        </p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                            Free AI Humanizer: Make AI Text Sound Human
                        </h1>
                        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
                            Humanize AI-written text, detect which sentences look machine-made, and paraphrase in your own voice, all in one place.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to="/register" className="btn-primary inline-block w-full sm:w-auto text-center">
                                Get 100 free credits
                            </Link>
                            <Link
                                to="/login"
                                className="inline-block w-full sm:w-auto rounded-xl border border-gray-300 dark:border-gray-700 px-6 py-3 text-center text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                            >
                                Log in
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <section className="mx-auto max-w-3xl px-4 pb-12">
                    <TryBox />
                </section>

                <section className="mx-auto max-w-6xl px-4 py-12">
                    <h2 className="text-center text-2xl font-black tracking-tight">Three tools for better writing</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {TOOLS.map((t) => {
                            const Icon = t.icon;
                            return (
                                <article key={t.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                                    <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-12">
                    <h2 className="text-center text-2xl font-black tracking-tight">How it works</h2>
                    <ol className="mt-8 space-y-4">
                        {STEPS.map((s, i) => (
                            <li key={s} className="flex items-start gap-4">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black dark:bg-white text-sm font-black text-white dark:text-black">
                                    {i + 1}
                                </span>
                                <p className="pt-1 text-gray-700 dark:text-gray-300">{s}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-12">
                    <h2 className="text-center text-2xl font-black tracking-tight">Frequently asked questions</h2>
                    <div className="mt-8 divide-y divide-gray-200 dark:divide-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800">
                        {FAQ.map((f) => (
                            <details key={f.q} className="p-5">
                                <summary className="cursor-pointer font-bold">{f.q}</summary>
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} AI Humanizer. Built by Areej Raj.
            </footer>
        </div>
    );
};

export default Landing;
