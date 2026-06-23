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

export default api;
