import axios from 'axios';

// ✅ DEV MODE: Using local backend for testing with Twilio & Ngrok.
// Switch to 'https://delhi-final.onrender.com/api' before deploying to production.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://delhi-final.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    // withCredentials removed: JWT Bearer token auth does NOT need cookies
});

api.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // ✅ Cloud deployment safety headers
        config.headers['ngrok-skip-browser-warning'] = 'true';
        config.headers['Content-Type'] = 'application/json';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;