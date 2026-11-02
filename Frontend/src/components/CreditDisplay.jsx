// src/components/CreditDisplay.jsx
import React from 'react';
import { FiDollarSign } from 'react-icons/fi';

const CreditDisplay = ({ credits }) => {
    const getStatus = () => {
        if (credits <= 10) return { label: 'Low', className: 'text-red-500 dark:text-red-400' };
        if (credits <= 30) return { label: 'Moderate', className: 'text-yellow-600 dark:text-yellow-400' };
        return { label: 'Available', className: 'text-green-600 dark:text-green-400' };
    };

    const status = getStatus();

    return (
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
            <FiDollarSign className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{credits}</span>
            <span className={`text-[10px] font-bold ${status.className}`}>{status.label}</span>
        </div>
    );
};

export default CreditDisplay;