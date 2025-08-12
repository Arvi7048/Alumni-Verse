"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { CameraIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import api from "../utils/api"
import { toast } from "react-hot-toast"
import { API_CONFIG } from "../config/config"
import { getImageUrl } from "../utils/image"

const Profile = () => {
  const { id } = useParams();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const viewingOwnProfile = !id || id === user?._id;
  const [profileUser, setProfileUser] = useState(viewingOwnProfile ? user : null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    batch: user?.batch || "",
    branch: user?.branch || "",
    location: user?.location || "",
    bio: user?.bio || "",
    company: user?.company || "",
    position: user?.position || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    website: user?.website || "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (viewingOwnProfile) {
        // Always fetch fresh profile data from API for current user
        setLoading(true);
        try {
          const res = await api.get("/users/profile");
          if (res.success) {
            const userData = res.data;
            setProfileUser(userData);
            setFormData({
              name: userData?.name || "",
              email: userData?.email || "",
              batch: userData?.batch || "",
              branch: userData?.branch || "",
              location: userData?.location || "",
              bio: userData?.bio || "",
              company: userData?.company || "",
              position: userData?.position || "",
              linkedin: userData?.linkedin || "",
              github: userData?.github || "",
              website: userData?.website || "",
            });
          } else {
            throw new Error(res.error || 'Failed to fetch profile');
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          // Fallback to user from context if API fails
          setProfileUser(user);
          setFormData({
            name: user?.name || "",
            email: user?.email || "",
            batch: user?.batch || "",
            branch: user?.branch || "",
            location: user?.location || "",
            bio: user?.bio || "",
            company: user?.company || "",
            position: user?.position || "",
            linkedin: user?.linkedin || "",
            github: user?.github || "",
            website: user?.website || "",
          });
        } finally {
          setLoading(false);
        }
      } else if (id) {
        setLoading(true);
        try {
          const res = await api.get(`/users/${id}`);
          if (!res.success) throw new Error(res.error || 'Failed to fetch user');
          setProfileUser(res.data);
        } catch (error) {
          setProfileUser(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfileUser();
    // eslint-disable-next-line
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const cleanFormData = (data) => {
    // Create a new object with only the fields we want to send
    const cleaned = {};
    
    // List of allowed fields that can be updated
    const allowedFields = [
      'name', 'email', 'batch', 'branch', 'location', 
      'bio', 'company', 'position', 'linkedin', 'github', 'website'
    ];
    
    // Only include allowed fields and remove any empty strings
    allowedFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== '') {
        cleaned[field] = data[field];
      }
    });
    
    return cleaned;
  };

  const validateFormData = (data) => {
    // Add any client-side validation here
    const errors = [];
    
    // Example validation:
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (data.batch && isNaN(parseInt(data.batch))) {
      errors.push('Batch year must be a number');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean and validate the form data
      const cleanedData = cleanFormData(formData);
      const validationErrors = validateFormData(cleanedData);
      
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        return;
      }
      
      // Log the data being sent to the server
      console.log('Submitting profile update with data:', JSON.stringify(cleanedData, null, 2));
      
      // Log the API endpoint and headers
      console.log('API Endpoint:', '/users/profile');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Request Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ***`
      });
      
      // Make the API call
      const res = await api.put("/users/profile", cleanedData);
      
      if (!res.success) {
        console.error('Profile update failed with response:', res);
        throw new Error(res.error || 'Failed to update profile');
      }
      
      console.log('Profile update successful:', res.data);
      updateUser(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile:", error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Try to get a more specific error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Include credentials for CORS
      });

      if (!res.data || !res.data.imageUrl) {
        throw new Error('Invalid response from server');
      }

      // Update user context with new image URL
      updateUser({ ...user, profileImage: res.data.imageUrl });
      
      // Also update local profile user state
      setProfileUser(prev => ({
        ...prev,
        profileImage: res.data.imageUrl
      }));

      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const branches = [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Chemical",
    "Biotechnology",
    "Artificial-Intelligence",
    "Other",
  ]

  const currentYear = new Date().getFullYear()
  const batches = Array.from({ length: 50 }, (_, i) => currentYear - i)

  if (loading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading profile...</div>;
  }
  if (!profileUser) {
    return <div className="flex justify-center items-center min-h-[200px] text-red-500">Profile not found.</div>;
  }
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      const res = await api.post('/otp-auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      
      if (!res.success) throw new Error(res.error || 'Failed to change password');
      
      // Show success message
      toast.success('Password changed successfully!');
      
      // Reset form and close dialog
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePasswordDialog(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    // Double confirmation for safety
    if (typeof window === 'undefined' || !window.confirm("WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.delete("/users/delete-account", {
        withCredentials: true
      });
      
      if (!res.success) throw new Error(res.error || 'Failed to delete account');
      
      // Show success message before logging out
      toast.success("Your account has been successfully deleted");
      
      // Logout the user
      logout(); // No need to await this as it's a synchronous operation
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Change Password Dialog */}
      {showChangePasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
              <button 
                onClick={() => {
                  setShowChangePasswordDialog(false);
                  setPasswordError('');
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {passwordError}
                </div>
              )}
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field w-full"
                  required
                  minLength="6"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field w-full"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordDialog(false);
                    setPasswordError('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Account</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete your account? This action is permanent and cannot be undone. 
              All your data will be permanently removed from our servers.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete My Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="card p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <div className="flex space-x-3">
            {viewingOwnProfile && (
              <>
                <button 
                  onClick={() => setShowChangePasswordDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {profileUser?.profileImage ? (
              <img
                src={getImageUrl(profileUser.profileImage)}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "/placeholder.svg";
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                  {profileUser?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}

            {viewingOwnProfile && isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="h-4 w-4" />
                )}
              </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">{profileUser?.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {profileUser?.batch} • {profileUser?.branch}
          </p>
        </div>

        {/* Profile Form */}
        {viewingOwnProfile ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Professional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Current company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="GitHub profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Personal website"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Graduation Year</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.batch}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.branch}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.location}</div>
              </div>
            </div>
            {/* Professional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Professional Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.company}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.position}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
                {profileUser?.linkedin ? (
                  <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profileUser.linkedin}
                  </a>
                ) : (
                  <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">N/A</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <div className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">{profileUser?.bio}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
