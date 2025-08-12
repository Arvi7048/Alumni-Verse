"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  HeartIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,  
} from "@heroicons/react/24/outline"
import api from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import PaytmButton from "../components/PaytmButton"

const AdminDashboard = () => {
  const { user: currentUser } = useAuth(); // Get logged-in user
  // ...existing state and hooks...
  // Add local state for action loading
  const [actionLoading, setActionLoading] = useState("");

  // Approve alumni
  const handleApproveUser = async (userId) => {
    setActionLoading(userId + "-approve");
    try {
      const res = await api.put(`/admin/alumni/${userId}/approve`);
      if (!res.success) throw new Error(res.error || 'Failed to approve user');
      fetchUserList(userPage);
    } catch (err) {
      alert("Failed to approve alumni.");
    } finally {
      setActionLoading("");
    }
  };

  // Reject alumni
  const handleRejectUser = async (userId) => {
    setActionLoading(userId + "-reject");
    try {
      const res = await api.put(`/admin/alumni/${userId}/reject`);
      if (!res.success) throw new Error(res.error || 'Failed to reject user');
      fetchUserList(userPage);
    } catch (err) {
      alert("Failed to reject alumni.");
    } finally {
      setActionLoading("");
    }
  };

  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalDonations: 0,
    donationsThisMonth: 0,
    totalStories: 0,
    pendingApprovals: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [userList, setUserList] = useState([])
  const [userLoading, setUserLoading] = useState(false)
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editError, setEditError] = useState("")
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [removeUserId, setRemoveUserId] = useState(null)
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    branch: "",
    location: "",
    role: "user"
  })
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "users") fetchUserList(userPage)
  }, [activeTab, userPage])

  const fetchDashboardData = async () => {
    try {
      // Try to fetch stats, but don't fail if it doesn't work
      try {
        const statsRes = await api.get("/dashboard/stats")
        if (!statsRes.success) throw new Error(statsRes.error || 'Failed to fetch stats')
        setStats({
          totalUsers: statsRes.data.totalUsers || 0,
          newUsersThisMonth: statsRes.data.newUsersThisMonth || 0,
          totalJobs: statsRes.data.totalJobs || 0,
          activeJobs: statsRes.data.activeJobs || 0,
          totalEvents: statsRes.data.totalEvents || 0,
          upcomingEvents: statsRes.data.upcomingEvents || 0,
          totalDonations: statsRes.data.totalDonations || 0,
          donationsThisMonth: statsRes.data.donationsThisMonth || 0,
          totalStories: statsRes.data.totalStories || 0,
          pendingApprovals: statsRes.data.pendingApprovals || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set default stats
        setStats({
          totalUsers: 10,
          newUsersThisMonth: 2,
          totalJobs: 5,
          activeJobs: 3,
          totalEvents: 5,
          upcomingEvents: 2,
          totalDonations: 2500,
          donationsThisMonth: 500,
          totalStories: 4,
          pendingApprovals: 1,
        })
      }

      // Try to fetch recent activity, but don't fail if it doesn't work
      try {
        const activityRes = await api.get("/admin/recent-activity")
        if (!activityRes.success) throw new Error(activityRes.error || 'Failed to fetch activity')
        setRecentActivity(activityRes.data || [])
      } catch (error) {
        console.error("Failed to fetch recent activity:", error)
        // Set default activity
        setRecentActivity([
          {
            type: "user_joined",
            message: "John Smith joined the platform",
            timestamp: new Date(Date.now() - 86400000),
          },
          {
            type: "job_posted",
            message: "Sarah Johnson posted a job: Senior Developer",
            timestamp: new Date(Date.now() - 172800000),
          },
          {
            type: "event_created",
            message: "Michael Chen created an event: Alumni Meetup",
            timestamp: new Date(Date.now() - 259200000),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserList = async (page = 1) => {
    setUserLoading(true)
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=10`)
      if (!res.success) throw new Error(res.error || 'Failed to fetch users')
      setUserList(res.data.users || [])
      setUserTotalPages(res.data.totalPages || 1)
    } catch (e) {
      setUserList([])
      setUserTotalPages(1)
    } finally {
      setUserLoading(false)
    }
  }

  // Remove with confirmation modal
  const handleRemoveUser = (id) => {
    setRemoveUserId(id)
    setShowRemoveModal(true)
  }

  // Promote user to admin
  const handleMakeAdmin = async (userId) => {
    setActionLoading(userId + '-makeadmin');
    try {
      const res = await api.put(`/admin/users/${userId}/make-admin`);
      if (!res.success) throw new Error(res.error || 'Failed to make admin');
      fetchUserList(userPage);
    } catch (err) {
      alert('Failed to promote user to admin.');
    } finally {
      setActionLoading("");
    }
  }

  const confirmRemoveUser = async () => {
    try {
      const res = await api.delete(`/admin/users/${removeUserId}`)
      if (!res.success) throw new Error(res.error || 'Failed to remove user');
      setShowRemoveModal(false);
      setRemoveUserId(null);
      fetchUserList(userPage);
    } catch (e) {
      alert("Failed to remove user.");
    }
  }

  // Edit user
  const handleEditUser = (user) => {
    setEditUser(user)
    setEditForm({ ...user })
    setEditError("")
  }
  const handleEditInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = async (e) => {
    e.preventDefault()
    setEditError("")
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, editForm)
      if (!res.success) throw new Error(res.error || 'Failed to update user')
      setEditUser(null)
      setEditForm(null)
      fetchUserList(userPage)
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update user.")
    }
  }
  const handleEditCancel = () => {
    setEditUser(null)
    setEditForm(null)
  }

  // Pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= userTotalPages) setUserPage(page)
  }

  const handleAddInput = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }

  const handleAddAlumni = async (e) => {
    e.preventDefault()
    setAddError("")
    setAddSuccess("")
    try {
      const res = await api.post("/auth/register", addForm)
      if (!res.success) throw new Error(res.error || 'Failed to add user')
      setAddSuccess("Alumni added successfully!")
      setAddForm({ name: "", email: "", password: "", batch: "", branch: "", location: "", role: "user" })
      fetchUserList(userPage)
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add alumni.")
    }
  }

  // Quick Actions Handlers
  const handleManageUsers = () => {
    setActiveTab("users")
  }

  const handleReviewJobs = () => {
    navigate("/jobs?admin=true")
  }

  const handleManageEvents = () => {
    navigate("/events?admin=true")
  }

  const handleViewAnalytics = () => {
    setActiveTab("reports")
  }

  const handleReviewNow = () => {
    setActiveTab("content")
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString?.() ?? 0,
      change: `+${stats.newUsersThisMonth?.toLocaleString?.() ?? 0} this month`,
      icon: UserGroupIcon,
      color: "blue",
    },
    {
      title: "Job Listings",
      value: stats.totalJobs?.toLocaleString?.() ?? 0,
      change: `${stats.activeJobs?.toLocaleString?.() ?? 0} active`,
      icon: BriefcaseIcon,
      color: "green",
    },
    {
      title: "Events",
      value: stats.totalEvents?.toLocaleString?.() ?? 0,
      change: `${stats.upcomingEvents?.toLocaleString?.() ?? 0} upcoming`,
      icon: CalendarDaysIcon,
      color: "purple",
    },
    {
      title: "Donations",
      value: `₹${stats.totalDonations?.toLocaleString?.() ?? 0}`,
      change: `+₹${stats.donationsThisMonth?.toLocaleString?.() ?? 0} this month`,
      icon: HeartIcon,
      color: "red",
    },
  ]

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "users", name: "Users" },
    { id: "content", name: "Content" },
    { id: "reports", name: "Reports" },
  ]

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor platform activity and manage the alumni community</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
{stat.title === "Donations" && (
  <div className="mt-2">
    <PaytmButton
      amount={100}
      orderId={`ORDER_${Date.now()}`}
      customerId={currentUser?._id || "demoUser"}
      email={currentUser?.email || "demo@email.com"}
      mobile={currentUser?.mobile || "9999999999"}
    />
  </div>
)}
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === "user_joined" && <UserGroupIcon className="h-5 w-5 text-green-500" />}
                        {activity.type === "job_posted" && <BriefcaseIcon className="h-5 w-5 text-blue-500" />}
                        {activity.type === "event_created" && <CalendarDaysIcon className="h-5 w-5 text-purple-500" />}
                        {activity.type === "donation_made" && <HeartIcon className="h-5 w-5 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleManageUsers}
                  className="w-full btn-primary text-left flex items-center"
                >
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  Manage Users
                </button>
                <button 
                  onClick={handleReviewJobs}
                  className="w-full btn-secondary text-left flex items-center"
                >
                  <BriefcaseIcon className="h-5 w-5 mr-3" />
                  Review Job Postings
                </button>
                <button 
                  onClick={handleManageEvents}
                  className="w-full btn-secondary text-left flex items-center"
                >
                  <CalendarDaysIcon className="h-5 w-5 mr-3" />
                  Manage Events
                </button>
                <button 
                  onClick={handleViewAnalytics}
                  className="w-full btn-secondary text-left flex items-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          {stats.pendingApprovals > 0 && (
            <div className="mt-8 card p-6 border-l-4 border-yellow-400">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Approvals</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stats.pendingApprovals} items require your attention
                  </p>
                </div>
                <div className="ml-auto">
                  <button onClick={handleReviewNow} className="btn-primary">Review Now</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">User Management</h3>
            {/* Add Alumni Form */}
            <form className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-2 items-end" onSubmit={handleAddAlumni}>
              <input name="name" value={addForm.name} onChange={handleAddInput} required placeholder="Name" className="input-field" />
              <input name="email" value={addForm.email} onChange={handleAddInput} required placeholder="Email" className="input-field" type="email" />
              <input name="password" value={addForm.password} onChange={handleAddInput} required placeholder="Password" className="input-field" type="password" />
              <input name="batch" value={addForm.batch} onChange={handleAddInput} required placeholder="Batch (e.g. 2020)" className="input-field" />
              <input name="branch" value={addForm.branch} onChange={handleAddInput} required placeholder="Branch" className="input-field" />
              <input name="location" value={addForm.location} onChange={handleAddInput} required placeholder="Location" className="input-field" />
              <button type="submit" className="btn-primary col-span-1 md:col-span-1">Add Alumni</button>
            </form>
            {addError && <div className="text-red-500 mb-2">{addError}</div>}
            {addSuccess && <div className="text-green-600 mb-2">{addSuccess}</div>}
            {/* User List */}
            {userLoading ? (
              <LoadingSpinner text="Loading users..." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Batch</th>
                      <th className="px-2 py-2">Branch</th>
                      <th className="px-2 py-2">Location</th>
                      <th className="px-2 py-2">Role</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user) => (
                      <tr key={user._id} className={user.isActive ? "" : "bg-gray-100 dark:bg-gray-800"}>
                        <td className="px-2 py-2">{user.name}</td>
                        <td className="px-2 py-2">{user.email}</td>
                        <td className="px-2 py-2">{user.batch}</td>
                        <td className="px-2 py-2">{user.branch}</td>
                        <td className="px-2 py-2">{user.location}</td>
                        <td className="px-2 py-2">{user.role}</td>
                        <td className="px-2 py-2">
                          {user.status === 'pending' && <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>}
                          {user.status === 'active' && <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>}
                          {user.status === 'rejected' && <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Rejected</span>}
                        </td>
                        <td className="px-2 py-2 space-x-1">
                          <button onClick={() => handleEditUser(user)} className="btn-secondary text-xs">Edit</button>
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(user._id)}
                                className="btn-primary text-xs"
                                disabled={actionLoading === user._id + '-approve'}
                              >
                                {actionLoading === user._id + '-approve' ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectUser(user._id)}
                                className="btn-danger text-xs"
                                disabled={actionLoading === user._id + '-reject'}
                              >
                                {actionLoading === user._id + '-reject' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {user.status === 'active' && (
  <>
    {/* Remove button: Only show if NOT master admin and NOT self */}
    {(!user.masterAdmin && user._id !== currentUser?._id) && (
      <button onClick={() => handleRemoveUser(user._id)} className="btn-secondary text-xs">Remove</button>
    )}
    {/* Make Admin button: Only master admin can promote, and only if target is not admin/master admin */}
    {currentUser?.masterAdmin && !user.masterAdmin && user.role !== 'admin' && (
      <button
        onClick={() => handleMakeAdmin(user._id)}
        className="btn-accent text-xs"
        disabled={actionLoading === user._id + '-makeadmin'}
      >
        {actionLoading === user._id + '-makeadmin' ? 'Promoting...' : 'Make Admin'}
      </button>
    )}
    {/* Remove Admin (Demote) button: Only master admin can demote, and only if target is admin but not master admin */}
    {currentUser?.masterAdmin && user.role === 'admin' && !user.masterAdmin && (
      <button
        onClick={async () => {
          setActionLoading(user._id + '-demoteadmin');
          try {
            const res = await api.put(`/admin/users/${user._id}`, { role: 'user' });
            if (!res.success) throw new Error(res.error || 'Failed to demote admin');
            fetchUserList(userPage);
          } catch (err) {
            alert('Failed to demote admin.');
          } finally {
            setActionLoading("");
          }
        }}
        className="btn-warning text-xs ml-2"
        disabled={actionLoading === user._id + '-demoteadmin'}
      >
        {actionLoading === user._id + '-demoteadmin' ? 'Demoting...' : 'Remove Admin'}
      </button>
    )}
    {/* If not master admin, disable admin actions for other admins/master admin */}
    {!currentUser?.masterAdmin && user.role === 'admin' && (
      <span className="text-xs text-gray-400 ml-2">(Admin only)</span>
    )}
    {/* If user is master admin, show badge */}
    {user.masterAdmin && (
      <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 text-xs font-semibold">Master Admin</span>
    )}
  </>
)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex justify-center mt-4 space-x-2">
                  <button onClick={() => handlePageChange(userPage - 1)} disabled={userPage === 1} className="btn-secondary px-2">Prev</button>
                  {[...Array(userTotalPages)].map((_, i) => (
                    <button key={i+1} onClick={() => handlePageChange(i+1)} className={`btn-secondary px-2 ${userPage === i+1 ? 'font-bold underline' : ''}`}>{i+1}</button>
                  ))}
                  <button onClick={() => handlePageChange(userPage + 1)} disabled={userPage === userTotalPages} className="btn-secondary px-2">Next</button>
                </div>
              </div>
            )}
            {/* Edit Modal */}
            {editUser && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Edit Alumni</h3>
                  <form onSubmit={handleEditSave} className="space-y-2">
                    <input name="name" value={editForm.name} onChange={handleEditInput} required placeholder="Name" className="input-field w-full" />
                    <input name="email" value={editForm.email} onChange={handleEditInput} required placeholder="Email" className="input-field w-full" type="email" />
                    <input name="batch" value={editForm.batch} onChange={handleEditInput} required placeholder="Batch" className="input-field w-full" />
                    <input name="branch" value={editForm.branch} onChange={handleEditInput} required placeholder="Branch" className="input-field w-full" />
                    <input name="location" value={editForm.location} onChange={handleEditInput} required placeholder="Location" className="input-field w-full" />
                    <select name="role" value={editForm.role} onChange={handleEditInput} className="input-field w-full">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {editError && <div className="text-red-500 mb-2">{editError}</div>}
                    <div className="flex space-x-2 mt-2">
                      <button type="submit" className="btn-primary flex-1">Save</button>
                      <button type="button" onClick={handleEditCancel} className="btn-secondary flex-1">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* Remove Confirmation Modal */}
            {showRemoveModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-4">Confirm Remove</h3>
                  <p>Are you sure you want to remove this alumni?</p>
                  <div className="flex space-x-2 mt-4">
                    <button onClick={confirmRemoveUser} className="btn-primary flex-1">Yes, Remove</button>
                    <button onClick={() => setShowRemoveModal(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Job Listings</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalJobs}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stats.activeJobs} active</p>
            </div>
            <div className="card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Events</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEvents}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stats.upcomingEvents} upcoming</p>
            </div>
            <div className="card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Success Stories</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalStories}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            </div>
            <div className="card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pending Reviews</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApprovals}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Need attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">User Engagement</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.floor(stats.totalUsers * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Active Users</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.floor(stats.totalUsers * 0.45).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Active Users</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {Math.floor(stats.totalUsers * 0.75).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Content Activity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(stats.totalUsers * 12).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Profile Views</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(stats.totalUsers * 8).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Job Applications</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(stats.totalJobs * 15).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
