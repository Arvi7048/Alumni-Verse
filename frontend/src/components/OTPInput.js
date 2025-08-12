import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, loading = false, error = "", autoSubmit = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  // Notify parent component when OTP changes
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === length && onComplete) {
      // Only auto-submit if autoSubmit is explicitly set to true
      if (autoSubmit) {
        onComplete(otpValue);
      } else {
        // Just update the parent's OTP state
        onComplete(otpValue);
      }
    }
  }, [otp, length, onComplete, autoSubmit]);

  useEffect(() => {
    if (inputRefs.current[0] && !loading) {
      inputRefs.current[0].focus();
    }
  }, [loading]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if current input has a value
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1].focus()
      }
      // Clear current input
      setOtp([...otp.map((d, idx) => (idx === index ? "" : d))])
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)
    const pastedArray = pastedData.split('').slice(0, length)
    
    const newOtp = [...otp]
    pastedArray.forEach((char, index) => {
      if (!isNaN(char) && index < length) {
        newOtp[index] = char
      }
    })
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => val === "")
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
    inputRefs.current[focusIndex].focus()
  }

  useEffect(() => {
    const otpValue = otp.join("")
    if (otpValue.length === length && onComplete) {
      onComplete(otpValue)
    }
  }, [otp, length, onComplete])

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={loading}
            className={`otp-input w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${data ? 'otp-input-filled' : ''}
              ${error 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
              }
              ${loading 
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}

          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  )
}

export default OTPInput
