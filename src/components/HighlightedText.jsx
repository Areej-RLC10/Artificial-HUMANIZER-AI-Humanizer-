// src/components/HighlightedText.jsx
import React from 'react';

const HighlightedText = ({ sentences }) => {
    if (!sentences) return null;

    const getStyles = (category) => {
        switch (category) {
            case 'human':
                return 'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-900/30 dark:text-sky-200';
            case 'mixed':
                return 'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'likely_ai':
                return 'bg-pink-100 text-pink-900 border-pink-200 dark:bg-pink-900/30 dark:text-pink-200';
            case 'surely_ai':
                return 'bg-pink-100 text-pink-900 border-pink-300 underline decoration-red-500 decoration-2 underline-offset-4 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-700';
            default:
                return 'bg-gray-100 text-gray-900';
        }
    };

    return (
        <div className="leading-loose text-sm p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            {sentences.map((sentence, index) => (
                <span 
                    key={index} 
                    className={`inline-block px-1.5 py-0.5 rounded-md border ${getStyles(sentence.category)} mr-1.5 mb-1.5 transition-all cursor-pointer hover:shadow-sm`}
                    title={`AI Probability: ${sentence.score}%`}
                >
                    {sentence.text}
                </span>
            ))}
        </div>
    );
};

export default HighlightedText;