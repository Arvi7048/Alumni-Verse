"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import OTPInput from "../components/OTPInput"

const OTPForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const sendOTP = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (response.ok) {
        setStep(2)
        setResendCooldown(60)
        setSuccess("OTP sent to your email address")
      } else {
        setError(data.message || "Failed to send OTP")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (otpValue) => {
    setOtp(otpValue)
    setStep(3)
    setError("")
    setSuccess("OTP verified successfully. Please set your new password.")
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) return setError("Both password fields are required")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters long")
    if (newPassword !== confirmPassword) return setError("Passwords do not match")

    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "forgot_password" }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendCooldown(60)
        setSuccess("New OTP sent to your email address")
      } else {
        setError(data.message || "Failed to resend OTP")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            {step === 1 && "Reset your password"}
            {step === 2 && "Verify your email"}
            {step === 3 && "Set new password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {step === 1 && "Enter your email address and we'll send you a verification code"}
            {step === 2 && `We've sent a 6-digit code to ${email}`}
            {step === 3 && "Enter your new password below"}
          </p>
        </div>

        {/* STEP 1 - Email */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={sendOTP}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            {error && <div className="text-red-600 bg-red-50 dark:bg-red-800/30 dark:text-red-400 p-2 rounded text-sm">{error}</div>}
            {success && <div className="text-green-600 bg-green-50 dark:bg-green-800/30 dark:text-green-400 p-2 rounded text-sm">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm">
                ← Back to login
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2 - OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <OTPInput length={6} onComplete={verifyOTP} loading={loading} error={error} />

            {success && <div className="text-green-600 bg-green-50 dark:bg-green-800/30 dark:text-green-400 p-2 rounded text-sm">{success}</div>}

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">Didn't receive the code?</p>
              <button
                onClick={resendOTP}
                disabled={loading || resendCooldown > 0}
                className="text-blue-600 hover:text-blue-500 text-sm disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-500 text-sm"
              >
                ← Back to email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Reset Password */}
        {step === 3 && (
          <form className="space-y-6" onSubmit={resetPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
              <div className="mt-1 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError("")
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError("")
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 bg-red-50 dark:bg-red-800/30 dark:text-red-400 p-2 rounded text-sm">{error}</div>}
            {success && <div className="text-green-600 bg-green-50 dark:bg-green-800/30 dark:text-green-400 p-2 rounded text-sm">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default OTPForgotPassword
