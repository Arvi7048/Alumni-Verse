"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function NotFound() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect to home page after a delay
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, isAuthenticated])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Redirecting you to {isAuthenticated ? 'dashboard' : 'home'}...
        </p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
