// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'medium' }) => {
    const sizes = {
        small: 'w-5 h-5',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`${sizes[size]} border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;