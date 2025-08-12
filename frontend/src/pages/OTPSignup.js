import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import OTPInput from "../components/OTPInput";
import { safeLocalStorage } from "../utils/safeLocalStorage";

const OTPSignup = () => {
  const [pendingApprovalMsg, setPendingApprovalMsg] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    batch: "",
    branch: "",
    location: "",
  });
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, batch, branch, location } = formData;
    
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!batch) {
      setError("Graduation year is required");
      return false;
    }
    if (!branch.trim()) {
      setError("Branch is required");
      return false;
    }
    if (!location.trim()) {
      setError("Location is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log('Sending OTP to:', formData.email);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/send-registration-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep(2);
      setResendCooldown(60);
      setCountdown(300);

    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otpValue) => {
    if (loading) return; // Prevent multiple submissions
    
    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      console.log('Verifying OTP...');
      // Create a new object with only the fields the backend expects
      const { confirmPassword, ...userData } = formData;
      const verificationData = {
        ...userData,  // All form data except confirmPassword
        otp: otpValue // Add the OTP
      };
      
      console.log('Sending verification data:', verificationData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/verify-registration-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(verificationData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('OTP verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }
      
      if (data.pendingApproval) {
        setPendingApprovalMsg(data.message || "Registration complete. Awaiting admin approval.");
        setStep(3);
        return;
      }
      
      if (data.token && data.user) {
        try {
          safeLocalStorage.setItem("token", data.token);
          safeLocalStorage.setItem("user", JSON.stringify(data.user));
          
          setStep(3);
          setPendingApprovalMsg("Registration successful! Redirecting to dashboard...");
          
          setTimeout(() => {
            navigate("/", { 
              replace: true,
              state: { 
                message: "Registration successful!",
                messageType: "success"
              }
            });
          }, 2000);
          
          return;
        } catch (storageError) {
          console.error('Error saving user data:', storageError);
          navigate("/login", { 
            replace: true,
            state: { 
              message: "Registration successful! Please log in.",
              messageType: "success"
            }
          });
          return;
        }
      }
      
      throw new Error("Unexpected response from server");
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      let errorMessage = "An error occurred during verification. Please try again.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('OTP Verification Error:', error);
      setError(errorMessage);
      
    } finally {
      setLoading(false);
      controller.abort(); // Clean up the controller
    }
  };

  const resendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log('Resending OTP to:', formData.email);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/otp-auth/resend-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email,
          type: "registration"
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      
      setResendCooldown(60);
      setCountdown(300);
      setError("");
      setPendingApprovalMsg("A new OTP has been sent to your email.");
      
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const branches = [
    "Computer Science", "Information Technology", "Electronics", "Mechanical",
    "Civil", "Electrical", "Chemical", "Biotechnology", "Artificial Intelligence", "Other"
  ];
  
  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="input-field w-full"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="input-field w-full"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            className="input-field w-full pr-10"
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field w-full pr-10"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Graduation Year
          </label>
          <select
            id="batch"
            name="batch"
            required
            value={formData.batch}
            onChange={handleChange}
            className="input-field w-full"
          >
            <option value="">Select year</option>
            {batches.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branch
          </label>
          <select
            id="branch"
            name="branch"
            required
            value={formData.branch}
            onChange={handleChange}
            className="input-field w-full"
          >
            <option value="">Select branch</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Location (City, Country)
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          value={formData.location}
          onChange={handleChange}
          className="input-field w-full"
          placeholder="e.g., Mumbai, India"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="spinner mr-2"></div>
              Sending OTP...
            </>
          ) : (
            "Get Verification Code"
          )}
        </button>
      </div>
    </form>
  );

  const [otp, setOtp] = useState('');

  // Handle OTP input changes - just update the state
  const handleOTPChange = (otpValue) => {
    setOtp(otpValue);
    setError(''); // Clear any previous errors when OTP changes
  };

  // Handle verify button click - only way to trigger OTP verification
  const handleVerifyClick = () => {
    // Double-check OTP length before proceeding
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    verifyOTP(otp);
  };

  const renderOTPVerification = () => (
    <div className="mt-8 space-y-6 text-center">
      <OTPInput 
        length={6} 
        onComplete={handleOTPChange} // Only updates OTP state, doesn't trigger verification
        loading={loading} 
        error={error}
        autoSubmit={false} // Ensure no auto-submit
      />
      <button
        type="button"
        onClick={handleVerifyClick}
        disabled={loading || otp.length !== 6}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="spinner mr-2"></div>
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </button>
      <div>
        <button
          type="button"
          onClick={resendOTP}
          disabled={resendCooldown > 0 || loading}
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </button>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to form
        </button>
      </div>
    </div>
  );

  const renderPendingApproval = () => (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Registration Submitted</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your registration is pending approval. You'll receive an email once your account is activated.
      </p>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 1: return renderForm();
      case 2: return renderOTPVerification();
      case 3: return renderPendingApproval();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? "Join Our Alumni Network" : step === 3 ? "Registration Pending" : "Verify Your Email"}
            </h2>
            <p className="mt-1 text-blue-100 text-sm">
              {step === 1
                ? "Create your account to connect with fellow alumni"
                : step === 3
                ? "Your registration is being reviewed by our team"
                : `We've sent a code to ${formData.email}`}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {pendingApprovalMsg && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {pendingApprovalMsg}
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            {renderContent()}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPSignup;
