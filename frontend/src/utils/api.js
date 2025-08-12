import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { safeLocalStorage } from './safeLocalStorage';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for cookies if using them
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // Skip adding auth header for public endpoints
    const publicEndpoints = [
      API_CONFIG.AUTH.LOGIN,
      API_CONFIG.AUTH.REGISTER,
      API_CONFIG.AUTH.FORGOT_PASSWORD,
      API_CONFIG.OTP.SEND_REGISTRATION_OTP,
      API_CONFIG.OTP.VERIFY_REGISTRATION_OTP,
      API_CONFIG.OTP.SEND_FORGOT_PASSWORD_OTP,
      API_CONFIG.OTP.VERIFY_FORGOT_PASSWORD_OTP,
      API_CONFIG.OTP.RESEND_OTP
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.endsWith(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        // If no token and not a public endpoint, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No authentication token found'));
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data || {};
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we've already tried to refresh the token, log the user out
      if (originalRequest._retry) {
        // Clear auth data
        safeLocalStorage.removeItem('token');
        safeLocalStorage.removeItem('refreshToken');
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // Mark that we've tried to refresh the token
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = safeLocalStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use the refresh token to get a new access token
          const response = await axios.post(
            `${API_CONFIG.API_BASE_URL}${API_CONFIG.AUTH.REFRESH_TOKEN}`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true,
            }
          );
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          if (newToken && newRefreshToken) {
            // Store the new tokens
            safeLocalStorage.setItem('token', newToken);
            safeLocalStorage.setItem('refreshToken', newRefreshToken);
            
            // Update the Authorization header
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Retry the original request with the new token
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // If refresh fails, log the user out
        safeLocalStorage.removeItem('token');
        safeLocalStorage.removeItem('refreshToken');
        
        // Only redirect if not already on the login page
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other error status codes
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 400:
          return Promise.reject(new Error(data.message || 'Bad request'));
        case 403:
          return Promise.reject(new Error('You do not have permission to perform this action'));
        case 404:
          return Promise.reject(new Error('The requested resource was not found'));
        case 500:
          return Promise.reject(new Error('An internal server error occurred'));
        default:
          return Promise.reject(new Error(data.message || 'An error occurred'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response received from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new Error(error.message || 'An error occurred'));
    }
  }
);

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    errorMessage = data?.message || `Request failed with status code ${status}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response received from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'An error occurred while setting up the request';
  }
  
  return { success: false, error: errorMessage };
};

// Wrapper functions for common HTTP methods
const apiClient = {
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      let response;
      // Special handling for file uploads
      if (data instanceof FormData) {
        response = await api.post(url, data, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
      } else {
        response = await api.post(url, data, {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          withCredentials: true,
        });
      }
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      // Special handling for FormData (file uploads)
      if (data instanceof FormData) {
        const response = await api.put(url, data, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        return { success: true, data: response };
      }
      
      // For regular JSON data
      const response = await api.put(url, data, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        withCredentials: true,
      });
      
      return { 
        success: true, 
        data: response,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('PUT request failed:', {
        url,
        error: error.response?.data || error.message,
        status: error.response?.status,
        config: error.config
      });
      return handleApiError(error);
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Add other HTTP methods as needed
};

export default apiClient;
