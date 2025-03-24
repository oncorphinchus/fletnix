// Token management functions

// Store token in local storage
export const setLocalToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fletnix_token', token);
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
  }
};

// Check if token exists
export const isAuthenticated = (): boolean => {
  return !!getLocalToken();
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

export const logout = (): void => {
  removeLocalToken();
};

// Helper function to make authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getLocalToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        removeLocalToken();
        throw new Error('Authentication expired. Please login again.');
      }
      
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}; 