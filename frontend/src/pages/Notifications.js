"use client"

import { useEffect } from "react"
import { useNotifications } from "../context/NotificationContext"
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../components/LoadingSpinner"

const Notifications = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case "warning":
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
      case "error":
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
  }

  const getNotificationBg = (type, isRead) => {
    const baseClasses = isRead ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/20"

    switch (type) {
      case "success":
        return isRead ? baseClasses : "bg-green-50 dark:bg-green-900/20"
      case "warning":
        return isRead ? baseClasses : "bg-yellow-50 dark:bg-yellow-900/20"
      case "error":
        return isRead ? baseClasses : "bg-red-50 dark:bg-red-900/20"
      default:
        return baseClasses
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60))
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))

    if (diffInHours < 1) {
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`
    }
  }

  if (!notifications) {
    return <LoadingSpinner text="Loading notifications..." />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center">
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card p-4 transition-colors duration-200 ${getNotificationBg(notification.type, notification.isRead)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-sm ${notification.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100 font-medium"}`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          Mark as read
                        </button>
                      )}

                      {!notification.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                    </div>
                  </div>

                  {notification.actionUrl && (
                    <div className="mt-3">
                      <a
                        href={notification.actionUrl}
                        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        View Details →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      )}

      {/* Notification Types Legend */}
      <div className="mt-12 card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notification Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">General Updates</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform updates, announcements</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Success Messages</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Confirmations, achievements</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Warnings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Important reminders, deadlines</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Alerts</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Urgent issues, security alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
