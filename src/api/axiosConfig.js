import axios from 'axios';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isDevelopment 
    ? 'http://localhost:10000/api' 
    : 'https://delhi-final.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // ✅ Localhost-la irukkumbodhu idhu thavai illai, aana irundhalum thappu illa
        config.headers['ngrok-skip-browser-warning'] = 'true';

        // ✅ Content-Type setting
        config.headers['Content-Type'] = 'application/json';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;