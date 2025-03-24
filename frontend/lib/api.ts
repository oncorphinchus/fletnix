import axios from 'axios';
import { getLocalToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = getLocalToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchFeaturedMedia = async () => {
  try {
    const response = await api.get('/media/featured');
    console.log('Featured Media API Response:', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching featured media:', error);
    return []; // Return empty array on error
  }
};

export const fetchRecentAdditions = async () => {
  try {
    const response = await api.get('/media/recent');
    console.log('Recent Media API Response:', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching recent additions:', error);
    return []; // Return empty array on error
  }
};

export const searchMedia = async (query: string) => {
  try {
    const response = await api.get(`/media/search?query=${encodeURIComponent(query)}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
};

export const getMediaDetails = async (id: string) => {
  try {
    const response = await api.get(`/media/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error(`Error fetching details for media ${id}:`, error);
    return null;
  }
};

export const fetchLocalMedia = async () => {
  try {
    console.log('Fetching local media from scan endpoint...');
    const response = await api.get('/media/scan');
    console.log('Local media scan response:', response.data);
    
    if (response.data && response.data.status === 'success' && response.data.data) {
      return response.data.data || { movies: [], series: [] };
    } else {
      console.error('Invalid scan response format:', response.data);
      return { movies: [], series: [] };
    }
  } catch (error) {
    console.error('Error scanning local media:', error);
    return { movies: [], series: [] };
  }
};

// Helper function to get the full URL for media files
export const getMediaUrl = (filepath: string) => {
  // If the filepath is already an absolute URL, return it as is
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
    return filepath;
  }
  
  // Otherwise, prepend the API URL, stripping any duplicated "/api" parts
  let path = filepath;
  if (path.startsWith('/api/')) {
    path = path.substring(4); // Remove the leading '/api'
  } else if (path.startsWith('api/')) {
    path = path.substring(3); // Remove the leading 'api'
  }
  
  // Ensure path starts with a slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return `${API_URL}${path}`;
};

export default api; 