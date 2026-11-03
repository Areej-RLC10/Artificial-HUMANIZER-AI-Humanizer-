// frontend/src/utils/formatters.js
export const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return `${(score * 100).toFixed(1)}%`;
};

export const getScoreColor = (score) => {
    if (score > 0.7) return 'text-red-600';
    if (score > 0.4) return 'text-yellow-600';
    return 'text-green-600';
};

export const getScoreBg = (score) => {
    if (score > 0.7) return 'bg-red-100';
    if (score > 0.4) return 'bg-yellow-100';
    return 'bg-green-100';
};

export const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};