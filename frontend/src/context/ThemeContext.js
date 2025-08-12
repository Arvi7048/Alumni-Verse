"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { safeLocalStorage } from "../utils/safeLocalStorage"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setIsMounted(true)
    
    // Only run on client side
    const savedTheme = safeLocalStorage.getItem("theme")
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia("(prefers-color-scheme: dark)").matches 
      : false
    
    setIsDark(savedTheme ? savedTheme === "dark" : prefersDark)
  }, [])

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add("dark")
      document.body.style.backgroundColor = '#1a202c' // Dark background
    } else {
      root.classList.remove("dark")
      document.body.style.backgroundColor = '#ffffff' // Light background
    }
    
    // Update localStorage
    safeLocalStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark, isMounted])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  // Prevent hydration mismatch by only rendering children when mounted
  if (!isMounted) {
    return (
      <ThemeContext.Provider value={{ isDark: false, toggleTheme }}>
        <div className="min-h-screen bg-white dark:bg-gray-900" />
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
