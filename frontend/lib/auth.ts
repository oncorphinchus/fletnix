import api from './api';

const TOKEN_KEY = 'fletnix_auth_token';
const USER_KEY = 'fletnix_user';

// Initialize with null values
let token: string | null = null;
let user: any = null;

// Function to load cached values on client side
export const loadCachedAuth = (): void => {
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        // If user data is corrupted, clear it
        localStorage.removeItem(USER_KEY);
        user = null;
      }
    }
  }
};

// Load cached auth data if on client side
if (typeof window !== 'undefined') {
  loadCachedAuth();
}

// Store token in local storage
export const setLocalToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fletnix_token', token);
    console.log('Token stored in localStorage');
  }
};

// Get token from local storage
export const getLocalToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fletnix_token');
  }
  return null;
};

// Remove token from local storage
export const removeLocalToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fletnix_token');
    console.log('Token removed from localStorage');
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Make sure cached values are loaded
  if (typeof window !== 'undefined' && token === null) {
    loadCachedAuth();
  }
  
  return !!token;
};

// API authentication functions
export const login = async (username: string, password: string): Promise<any> => {
  try {
    console.log(`Login request for user: ${username}`);
    
    const response = await api.post('/auth/login', { username, password });
    console.log('Login raw response:', response);
    
    // Check if response has the expected structure
    if (response.data && response.data.status === 'success' && response.data.data) {
      console.log('Successful login response:', response.data);
      
      // Check if token exists
      if (response.data.data.token) {
        const receivedToken: string = response.data.data.token;
        // Only attempt substring if we have a string token
        if (typeof receivedToken === 'string' && receivedToken.length > 10) {
          console.log('Token received:', receivedToken.substring(0, 10) + '...');
        } else {
          console.log('Token received with unexpected format');
        }
        
        // Save token and user data
        token = receivedToken;
        user = response.data.data.user || {}; // Get user from response or default to empty object
        
        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return response.data;
      } else {
        console.error('No token in response:', response.data);
        throw new Error('Login successful but no token received');
      }
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: { 
  username: string; 
  email: string; 
  password: string; 
  display_name?: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  // Clear memory values
  token = null;
  user = null;
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Fetch with authentication token
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getLocalToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  console.log('fetchWithAuth called for URL:', apiUrl + url);
  console.log('Token exists:', !!token);
  
  // If we're server-side or token doesn't exist, return null
  if (typeof window === 'undefined' || !token) {
    console.log('No token or server-side rendering, returning null');
    return Promise.reject(new Error('No authentication token'));
  }

  // Add authorization header to options
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    console.log('Fetching with auth headers');
    const response = await fetch(apiUrl + url, authOptions);
    
    // Handle unauthorized response (e.g., token expired)
    if (response.status === 401) {
      console.log('Unauthorized response, removing token');
      removeLocalToken();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error in fetchWithAuth:', error);
    throw error;
  }
};

export const getUser = (): any => {
  // Make sure cached values are loaded
  if (typeof window !== 'undefined' && user === null) {
    loadCachedAuth();
  }
  
  return user || null;
};

export default {
  login,
  logout,
  isAuthenticated,
  getUser,
  getLocalToken
}; 