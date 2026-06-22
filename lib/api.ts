import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.params = { ...config.params, api_key: API_KEY };
  return config;
});

export default api;
