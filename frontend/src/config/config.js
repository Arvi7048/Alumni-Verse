// API Configuration
export const API_CONFIG = {
  // Base URL for socket connection
  BASE_URL: 'http://localhost:5000',
  // Base URL for API requests
  API_BASE_URL: 'http://localhost:5000/api',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    LOGOUT: '/auth/logout'
  },
  
  // OTP Authentication endpoints
  OTP: {
    SEND_REGISTRATION_OTP: '/otp-auth/send-registration-otp',
    VERIFY_REGISTRATION_OTP: '/otp-auth/verify-registration-otp',
    SEND_FORGOT_PASSWORD_OTP: '/otp-auth/forgot-password',
    VERIFY_FORGOT_PASSWORD_OTP: '/otp-auth/verify-forgot-password-otp',
    RESEND_OTP: '/otp-auth/resend-otp'
  },
  
  // User endpoints
  USERS: {
    SEARCH: '/users/search'
  },

  // Chat endpoints
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CREATE_CONVERSATION: '/chat/conversations'
  },
  
  // Other API endpoints
  EVENTS: '/events',
  JOBS: '/jobs',
  STORIES: '/stories',
  DONATIONS: '/donations'
};

// Environment configuration
export const ENV = {
  // Development mode flag
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // API timeout in milliseconds
  API_TIMEOUT: 30000,
  
  // OTP configuration
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 5
  },
  
  // Token configuration
  TOKEN: {
    STORAGE_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken'
  }
};

const config = {
  ...API_CONFIG,
  ...ENV
};

export default config;
