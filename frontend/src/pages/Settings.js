"use client"

import { useState } from "react"
import { useTheme } from "../context/ThemeContext"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"

import DownloadAccountDataModal from "../components/DownloadAccountDataModal";
import TwoFactorAuthModal from "../components/TwoFactorAuthModal";

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  // Modal state for security actions
  const [showDownloadData, setShowDownloadData] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const [settings, setSettings] = useState({
    // General settings
    language: "en",
    timezone: "UTC",
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    eventReminders: true,
    messageNotifications: true,
    weeklyDigest: false,
    // Privacy settings
    profileVisibility: "public",
    showEmail: false,
    // Account settings
    loginAlerts: true,
    sessionTimeout: 15,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isDark ? (
                  <>
                    <SunIcon className="h-4 w-4" />
                    <span className="text-sm">Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-4 w-4" />
                    <span className="text-sm">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Localization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange("language", e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange("timezone", e.target.value)}
                className="input-field"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
              {
                key: "pushNotifications",
                label: "Push Notifications",
                description: "Receive browser push notifications",
              },
              { key: "jobAlerts", label: "Job Alerts", description: "Get notified about new job postings" },
              { key: "eventReminders", label: "Event Reminders", description: "Reminders for upcoming events" },
              {
                key: "messageNotifications",
                label: "Message Notifications",
                description: "Notifications for new messages",
              },
              { key: "weeklyDigest", label: "Weekly Digest", description: "Weekly summary of platform activity" },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Profile Visibility</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Who can see your profile?
              </label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange("profileVisibility", e.target.value)}
                className="input-field"
              >
                <option value="public">Everyone</option>
                <option value="alumni">Alumni only</option>
                <option value="connections">My connections only</option>
                <option value="private">Only me</option>
              </select>
            </div>

            {[
              { key: "showEmail", label: "Show email address", description: "Display your email on your profile" },
              { key: "showPhone", label: "Show phone number", description: "Display your phone number on your profile" },
              { key: "allowMessages", label: "Allow messages", description: "Let other alumni send you messages" },
              { key: "showOnlineStatus", label: "Show online status", description: "Display when you're online" },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  settings.twoFactorEnabled
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {settings.twoFactorEnabled ? "Enabled" : "Enable"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Alerts</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified of new login attempts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loginAlerts}
                  onChange={(e) => handleSettingChange("loginAlerts", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                className="input-field max-w-xs"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account Data</h3>
          <div className="space-y-4">
            <button 
              className="btn-secondary" 
              onClick={() => setShowDownloadData(true)}
            >
              Download Account Data
            </button>
          </div>
        </div>
      </div>

      <DownloadAccountDataModal
        open={showDownloadData}
        onClose={() => setShowDownloadData(false)}
      />
      <TwoFactorAuthModal
        open={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        enabled={settings.twoFactorEnabled}
        onStatusChange={(enabled) =>
          setSettings({ ...settings, twoFactorEnabled: enabled })
        }
      />

    </div>
  )
}

export default Settings
