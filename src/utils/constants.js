// frontend/src/utils/constants.js
export const ANALYSIS_ACTIONS = {
    DETECT: 'detect',
    HUMANIZE: 'humanize',
    BOTH: 'both',
};

export const STYLES = {
    CASUAL: 'casual',
    PROFESSIONAL: 'professional',
    CONVERSATIONAL: 'conversational',
};

export const ACTION_LABELS = {
    [ANALYSIS_ACTIONS.DETECT]: 'Detect AI',
    [ANALYSIS_ACTIONS.HUMANIZE]: 'Humanize Text',
    [ANALYSIS_ACTIONS.BOTH]: 'Both',
};

export const STYLE_LABELS = {
    [STYLES.CASUAL]: 'Casual',
    [STYLES.PROFESSIONAL]: 'Professional',
    [STYLES.CONVERSATIONAL]: 'Conversational',
};

export const CREDIT_COST = 1;
export const FREE_CREDITS = 100;