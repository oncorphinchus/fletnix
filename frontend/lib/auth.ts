// Token management functions

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
  const token = getLocalToken();
  console.log('isAuthenticated check, token exists:', !!token);
  return !!token;
};

// API authentication functions
export const login = async (username: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    
    // Save token
    if (data.token) {
      setLocalToken(data.token);
    }
    
    return data;
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
  removeLocalToken();
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