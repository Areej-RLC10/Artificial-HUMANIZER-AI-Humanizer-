// frontend/src/utils/validators.js
export const validateText = (text) => {
    if (!text || text.trim().length === 0) {
        return { valid: false, message: 'Please enter some text' };
    }
    if (text.length < 10) {
        return { valid: false, message: 'Text must be at least 10 characters' };
    }
    if (text.length > 50000) {
        return { valid: false, message: 'Text must be less than 50000 characters' };
    }
    return { valid: true };
};

export const validators = {
    isRequired: (value) => value?.trim().length > 0,
    minLength: (value, min) => value?.length >= min,
    maxLength: (value, max) => value?.length <= max,
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    isStrongPassword: (value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && value.length >= 8;
    },
};