import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Automated Logging (Exclude the logging endpoint and public routes)
    const isPublicRoute = config.url && (config.url.includes('auth/login/') || config.url.includes('auth/register/'));
    
    if (token && config.url && !config.url.includes('activity/log/') && !isPublicRoute) {
        const logData = {
            action: "API Call",
            details: {
                url: config.url,
                method: config.method?.toUpperCase(),
                data: config.data || null
            }
        };
        
        // Use a raw axios call to avoid triggering this interceptor recursively
        axios.post('http://localhost:8000/api/activity/log/', logData, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => { /* Silent fail for logging */ });
    }

    return config;
});

export default api;
