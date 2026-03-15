import axios from 'axios';

// ✅ HACKATHON RULE: Entha laptop-la irundhum data vara, Render Cloud URL-ah direct-ah kudukanum.
// Localhost condition-ah remove panniyachu to avoid connection issues on other PCs.
const BASE_URL = 'https://delhi-final.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
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