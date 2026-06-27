import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  adapter: 'fetch',
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.config?.method?.toUpperCase(), error.config?.url, '→', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Network Error]', error.config?.method?.toUpperCase(), error.config?.url, '→ No response. Message:', error.message);
    } else {
      console.error('[API Client Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default client;
