"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import api from "../utils/api"


const Home = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeJobs: 0,
    upcomingEvents: 0,
    totalDonations: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line
  }, [user])

  const fetchDashboardData = async () => {
    try {
      let statsRes, activitiesRes
      // Use dashboard stats endpoint (now has same data as admin)
      [statsRes, activitiesRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/activities"),
      ])
      
      if (!statsRes.success) throw new Error(statsRes.error || 'Failed to fetch stats')
      if (!activitiesRes.success) throw new Error(activitiesRes.error || 'Failed to fetch activities')
      
      // Dashboard stats now includes all admin data
      setStats({
        totalAlumni: statsRes.data.totalUsers || 0,
        totalJobs: statsRes.data.totalJobs || 0,
        totalEvents: statsRes.data.totalEvents || 0,
        totalDonations: statsRes.data.totalDonations || 0,
        activeJobs: statsRes.data.activeJobs || 0,
        upcomingEvents: statsRes.data.upcomingEvents || 0
      })
      
      setRecentActivities(activitiesRes.data || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: "Browse Alumni",
      description: "Connect with fellow alumni",
      href: "/directory",
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
    {
      name: "Find Jobs",
      description: "Explore career opportunities",
      href: "/jobs",
      icon: BriefcaseIcon,
      color: "bg-green-500",
    },
    {
      name: "Upcoming Events",
      description: "Join alumni events",
      href: "/events",
      icon: CalendarDaysIcon,
      color: "bg-purple-500",
    },
    {
      name: "Start Chatting",
      description: "Message other alumni",
      href: "/chat",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-pink-500",
    },
    {
      name: "Make Donation",
      description: "Support your alma mater",
      href: "/donations",
      icon: HeartIcon,
      color: "bg-red-500",
    },
    {
      name: "Share Story",
      description: "Inspire others with your journey",
      href: "/stories",
      icon: TrophyIcon,
      color: "bg-yellow-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay connected with your Alumni Verse and explore new opportunities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alumni</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {(user?.role === 'admin' ? stats.totalAlumni : stats.totalAlumni).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <BriefcaseIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalJobs?.toLocaleString?.() ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <CalendarDaysIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalEvents?.toLocaleString?.() ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ₹{stats.totalDonations?.toLocaleString?.() ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activities</h2>
          <div className="card p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities
                  .slice(0, 5) // Only take the 6 most recent activities
                  .map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.createdAt && !isNaN(new Date(activity.createdAt)) ? new Date(activity.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 card p-8 text-center bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900 dark:to-blue-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Connect?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Join thousands of alumni who are already networking, sharing opportunities, and making a difference in their
          communities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/directory" className="btn-primary">
            Explore Alumni Directory
          </Link>
          <Link to="/events" className="btn-secondary">
            View Upcoming Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
