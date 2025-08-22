import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9050/',
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    timeout: 10000, 
});
export default api;