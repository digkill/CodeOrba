import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const generateProject = (data) => API.post('/generate_project', data);
export const generateCode = (taskData) => API.post('/generate', taskData);
export const getFiles = () => API.get('/files');
export const downloadFile = (filename) => API.get(`/download/${filename}`, { responseType: 'blob' });
