import axios from 'axios';

const api = axios.create({
    // 🚩 Localhost-la run panna ippo idhu dhaan mukkiyam
    baseURL: 'http://localhost:8080/api',
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