// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - automatically add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const auth = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    user: () => api.get('/user'),
};

// Analysis API
export const analysis = {
    analyze: (data) => api.post('/analyze', data),
    history: (page = 1) => api.get(`/history?page=${page}`),
    get: (id) => api.get(`/analysis/${id}`),
    compare: (id) => api.get(`/analysis/${id}/compare`),
    export: (id, format) => api.get(`/export/${id}?format=${format}`, {
        responseType: 'blob'
    }),
};

export default api;