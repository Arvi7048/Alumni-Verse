"use client"

import { createContext, useContext, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError as clearErrorAction,
  setCredentials
} from "../features/auth/authSlice"
import api from "../utils/api"
import { API_CONFIG } from "../config/config"
import { safeLocalStorage } from "../utils/safeLocalStorage"

// Create the auth context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth)
  
  // Set auth token in localStorage
  const setAuthToken = useCallback((token, refreshToken) => {
    if (token) {
      safeLocalStorage.setItem('token', token)
      if (refreshToken) {
        safeLocalStorage.setItem('refreshToken', refreshToken)
      }
    } else {
      safeLocalStorage.removeItem('token')
      safeLocalStorage.removeItem('refreshToken')
    }
  }, [])

  // Load User
  const loadUser = useCallback(async () => {
    try {
      const { success, data, error } = await api.get(API_CONFIG.AUTH.ME)
      
      if (success && data) {
        dispatch(setCredentials({ user: data, token: safeLocalStorage.getItem('token') }))
        return { success: true, user: data }
      } else {
        throw new Error(error || 'Failed to load user data')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to load user data' 
      }
    }
  }, [dispatch])

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = safeLocalStorage.getItem('token')
      if (storedToken) {
        try {
          // Load user data with the stored token
          const result = await loadUser()
          if (!result.success) {
            // If loading user fails, clear the token
            setAuthToken(null)
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          setAuthToken(null)
        }
      }
    }
    
    initializeAuth()
  }, [dispatch, setAuthToken, loadUser])

  // Register User
  const register = useCallback(async (formData) => {
    try {
      dispatch(loginStart())
      
      // First, send OTP for registration
      const otpResponse = await api.post(API_CONFIG.OTP.SEND_REGISTRATION_OTP, { 
        email: formData.email 
      })
      
      if (!otpResponse.success) {
        throw new Error(otpResponse.error || 'Failed to send OTP')
      }
      
      // If OTP is sent successfully, return success to proceed to OTP verification
      return { 
        success: true, 
        message: 'OTP sent to your email',
        email: formData.email
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      const errorMsg = error.message || 'Registration failed'
      dispatch(loginFailure(errorMsg))
      return { 
        success: false, 
        error: errorMsg 
      }
    }
  }, [dispatch])
  
  // Verify OTP and complete registration
  const verifyRegistrationOTP = useCallback(async (email, otp, userData) => {
    try {
      dispatch(loginStart())
      
      // Send OTP and user data for verification and registration
      const response = await api.post(API_CONFIG.OTP.VERIFY_REGISTRATION_OTP, {
        ...userData,
        otp
      })
      
      // Accept both { token, user } and { data: { token, user } }
      const payload = response?.data?.token ? response.data : response?.data?.data ? response.data.data : null;
      
      if (response.success && payload?.token) {
        // Set tokens and update auth state
        const { token, refreshToken, user } = payload
        setAuthToken(token, refreshToken)
        dispatch(loginSuccess({ user, token }))
        
        return { 
          success: true, 
          user,
          message: 'Registration successful! Redirecting...' 
        }
      } else {
        throw new Error(response.error || 'Registration failed')
      }
      
    } catch (error) {
      console.error('OTP verification error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to verify OTP' 
      }
    }
  }, [dispatch, setAuthToken])

  // Login User
  const login = useCallback(async (formData) => {
    try {
      dispatch(loginStart())
      
      const { email, password } = formData
      
      // Call login API
      const response = await api.post(API_CONFIG.AUTH.LOGIN, { email, password })
      
      // Accept both { token, user } and { data: { token, user } }
      const payload = response?.data?.token ? response.data : response?.data?.data ? response.data.data : null;

      if (response.success && payload?.token) {
        // Set tokens and update auth state
        const { token, refreshToken, user } = payload
        setAuthToken(token, refreshToken)
        dispatch(loginSuccess({ user, token }))
        
        return { 
          success: true, 
          user,
          message: 'Login successful! Redirecting...' 
        }
      } else {
        // Bubble up any backend-provided error message
        const backendError = response?.error || response?.data?.message
        throw new Error(backendError || 'Login failed')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      const errorMsg = error.message || 'Login failed. Please check your credentials.'
      dispatch(loginFailure(errorMsg))
      
      return { 
        success: false, 
        error: errorMsg 
      }
    }
  }, [dispatch, setAuthToken])

  // Logout User
  const logout = useCallback(() => {
    // Clear tokens and reset auth state
    setAuthToken(null)
    dispatch(logoutAction())
    
    // Redirect to login page
    navigate('/login', { replace: true })
  }, [dispatch, navigate, setAuthToken])

  // Clear Errors
  const clearErrors = useCallback(() => {
    dispatch(clearErrorAction())
  }, [dispatch])

  // Update User Profile
  const updateUser = useCallback((newUserData) => {
    dispatch(setCredentials({ user: { ...user, ...newUserData }, token }))
  }, [dispatch, user, token])

  // Forgot Password - Request password reset
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await api.post(API_CONFIG.OTP.SEND_FORGOT_PASSWORD_OTP, { email })
      
      if (response.success) {
        return { 
          success: true, 
          message: 'If an account exists with this email, a password reset OTP has been sent.' 
        }
      } else {
        throw new Error(response.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to process password reset request' 
      }
    }
  }, [])
  
  // Verify OTP and Reset Password
  const resetPassword = useCallback(async (email, otp, newPassword) => {
    try {
      const response = await api.post(API_CONFIG.OTP.VERIFY_FORGOT_PASSWORD_OTP, { 
        email, 
        otp, 
        newPassword 
      })
      
      if (response.success) {
        return { 
          success: true, 
          message: 'Password has been reset successfully. You can now log in with your new password.' 
        }
      } else {
        throw new Error(response.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to reset password. The OTP may have expired.'
      }
    }
  }, [])

  // Resend OTP (registration or forgot-password)
  const resendOTP = useCallback(async (email, type = 'registration') => {
    try {
      const response = await api.post(API_CONFIG.OTP.RESEND_OTP, { email, type })
      if (response.success) {
        return {
          success: true,
          message: 'A new OTP has been sent to your email.'
        }
      } else {
        throw new Error(response.error || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      return {
        success: false,
        error: error.message || 'Failed to resend OTP. Please try again.'
      }
    }
  }, [])

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    // Auth methods
    loadUser,
    login,
    register,
    verifyRegistrationOTP,
    logout,
    clearErrors,
    updateUser,
    forgotPassword,
    resetPassword,
    resendOTP,
    setAuthToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
