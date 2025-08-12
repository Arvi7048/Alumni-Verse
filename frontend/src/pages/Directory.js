"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import api from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import { API_CONFIG } from "../config/config"
import { getImageUrl } from "../utils/image"

const Directory = () => {
  const [alumni, setAlumni] = useState([])
  const [filteredAlumni, setFilteredAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    batch: "",
    branch: "",
    location: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  const fetchAlumni = useCallback(async () => {
    try {
      // Build query parameters for backend filtering
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (filters.batch) params.append('batch', filters.batch)
      if (filters.branch) params.append('branch', filters.branch)
      if (filters.location) params.append('location', filters.location)
      
      const queryString = params.toString()
      const url = queryString ? `/users/directory?${queryString}` : "/users/directory"
      
      const res = await api.get(url)
      if (res.success) {
        // The API returns { users, totalPages, currentPage, total }
        // We need to extract the users array
        const users = res.data.users || []
        setAlumni(users)
        setFilteredAlumni(users) // Set filtered results directly from backend
      } else {
        throw new Error(res.error || 'Failed to fetch alumni')
      }
    } catch (error) {
      console.error("Failed to fetch alumni:", error)
      setAlumni([]) // Set empty array on error
      setFilteredAlumni([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters])

  // Fetch alumni on initial load
  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  // Refetch alumni when search term or filters change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAlumni()
    }, 300) // 300ms debounce to avoid too many API calls

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, fetchAlumni])

  // filterAlumni is already defined above with useCallback

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      batch: "",
      branch: "",
      location: "",
    })
    setSearchTerm("")
  }

  const branches = [...new Set((alumni || []).map((person) => person.branch).filter(Boolean))]
  const batches = [...new Set((alumni || []).map((person) => person.batch).filter(Boolean))].sort((a, b) => b - a)

  if (loading) {
    return <LoadingSpinner text="Loading alumni directory..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Alumni Directory</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with {Array.isArray(alumni) ? alumni.length : 0} alumni from our network</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, company, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year
                </label>
                <select
                  value={filters.batch}
                  onChange={(e) => handleFilterChange("batch", e.target.value)}
                  className="input-field"
                >
                  <option value="">All years</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange("branch", e.target.value)}
                  className="input-field"
                >
                  <option value="">All branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredAlumni.length} of {Array.isArray(alumni) ? alumni.length : 0} alumni
        </p>
      </div>

      {/* Alumni Grid */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <div key={person._id} className="card p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
              <div className="flex-grow">
                <div className="flex items-center mb-4">
                  {person.profileImage ? (
                    <img
                      src={getImageUrl(person.profileImage)}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg";
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <UserCircleIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4">
                    <Link to={`/profile/${person._id}`} className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline">
                      {person.name}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {person.batch} • {person.branch}
                    </p>
                  </div>
                </div>

                {person.company && (
                  <div className="flex items-center mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {person.position} at {person.company}
                    </span>
                  </div>
                )}

                {person.location && (
                  <div className="flex items-center mb-4">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{person.location}</span>
                  </div>
                )}

                {person.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{person.bio}</p>}
              </div>

              <div className="mt-auto pt-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/chat', { state: { user: person._id } })}
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    Message
                  </button>
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No alumni found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Directory
