import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('--- API ERROR DETECTED ---');
    console.log('URL:', error.config?.url);
    console.log('Method:', error.config?.method);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('No response received:', error.message);
    }
    console.log('-------------------------');
    return Promise.reject(error);
  }
);

export default api;
