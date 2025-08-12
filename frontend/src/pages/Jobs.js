"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline"
import api from "../utils/api"
import Modal from "../components/Modal"
import LoadingSpinner from "../components/LoadingSpinner"

const Jobs = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [aiSearching, setAISearching] = useState(false)
  const [aiError, setAIError] = useState("")
  const [showPostModal, setShowPostModal] = useState(false)
  const [filters] = useState({
    jobType: 'all',
    location: '',
    salary: ''
  })
  const [posting, setPosting] = useState(false)
  const [applying, setApplying] = useState(null)
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    salary: "",
    applicationUrl: "",
    applicationEmail: "",
  })

  // ✅ Keep this only version of filterJobs
  const filterJobs = useCallback(() => {
    let filtered = jobs

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.requirements.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term)
      )
    }

    if (filters.jobType && filters.jobType !== 'all') {
      filtered = filtered.filter(job => job.jobType === filters.jobType)
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.salary) {
      filtered = filtered.filter(job => {
        if (!job.salary) return false
        return job.salary >= filters.salary
      })
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm, filters])

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [filterJobs])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(jobs)
      setAIError("")
      return
    }
    let cancelled = false
    async function aiSearch() {
      setAISearching(true)
      setAIError("")
      try {
        const res = await api.post("/ai/search", {
          query: searchTerm,
          entity: "jobs"
        })
        if (!res.success) throw new Error(res.error || 'AI search failed')
        if (!cancelled) setFilteredJobs(res.data.results || [])
      } catch (err) {
        setAIError("AI search failed, showing keyword results.")
        filterJobs()
      } finally {
        setAISearching(false)
      }
    }
    aiSearch()
    return () => { cancelled = true }
  }, [searchTerm, jobs, filterJobs])

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs")
      if (res.success) {
        setJobs(res.data.jobs || [])
      } else {
        throw new Error(res.error || 'Failed to fetch jobs')
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobFormChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value,
    })
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    setPosting(true)

    try {
      const res = await api.post("/jobs", jobForm)
      if (!res.success) throw new Error(res.error || 'Failed to post job')
      setJobs([res.data, ...jobs])
      setShowPostModal(false)
      setJobForm({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        salary: "",
        applicationUrl: "",
        applicationEmail: "",
      })
    } catch (error) {
      console.error("Failed to post job:", error)
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (typeof window === 'undefined' || !window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`)
      if (!res.success) throw new Error(res.error || 'Failed to delete job');
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (error) {
      alert('Failed to delete job.');
    }
  }

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      const res = await api.post(`/jobs/${jobId}/apply`)
      if (!res.success) throw new Error(res.error || 'Failed to apply for job')
      setJobs(jobs.map((job) =>
        job._id === jobId ? { ...job, applicants: [...job.applicants, user._id] } : job
      ))
    } catch (error) {
      console.error("Failed to apply for job:", error)
    } finally {
      setApplying(null)
    }
  }

  const hasApplied = (job) => {
    return job.applicants.includes(user._id)
  }

  const isJobPoster = (job) => {
    return job.postedBy && job.postedBy._id && user && user._id && job.postedBy._id === user._id;
  }

  if (loading) {
    return <LoadingSpinner text="Loading job listings..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Job Board</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover career opportunities shared by alumni</p>
        </div>
        <button onClick={() => setShowPostModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Post Job
        </button>
      </div>

      {/* Search */}
      <div className="card p-6 mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          {aiSearching && <div className="text-xs text-gray-500 mt-2">AI searching...</div>}
          {aiError && <div className="text-xs text-red-500 mt-2">{aiError}</div>}
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job._id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm font-medium mr-2"
                    >
                      Delete
                    </button>
                  )}
                  {job.salary && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      ₹ {String(job.salary).replace(/[^0-9.,-]/g, '')}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Job Description</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.requirements && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Requirements</h4>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posted by {job.postedBy?.name || 'Unknown User'} • {job.applicants?.length || 0} applicant
                  {job.applicants?.length !== 1 ? "s" : ""}
                </div>

                <div className="flex space-x-2">
                  {!isJobPoster(job) && (
                    <>
                      {hasApplied(job) ? (
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(job._id)}
                          disabled={applying === job._id}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {applying === job._id ? (
                            <>
                              <div className="spinner mr-2"></div>
                              Applying...
                            </>
                          ) : (
                            "Apply Now"
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {(job.applicationUrl || job.applicationEmail) && (
                    <a
                      href={job.applicationUrl || `mailto:${job.applicationEmail}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      External Apply
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? "Try adjusting your search criteria." : "Be the first to post a job opportunity!"}
          </p>
        </div>
      )}

      {/* Post Job Modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post a Job" size="lg">
        <form onSubmit={handlePostJob} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                value={jobForm.title}
                onChange={handleJobFormChange}
                className="input-field"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company *</label>
              <input
                type="text"
                name="company"
                required
                value={jobForm.company}
                onChange={handleJobFormChange}
                className="input-field"
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                required
                value={jobForm.location}
                onChange={handleJobFormChange}
                className="input-field"
                placeholder="e.g. San Francisco, CA or Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type *</label>
              <select name="type" required value={jobForm.type} onChange={handleJobFormChange} className="input-field">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Range</label>
            <input
              type="text"
              name="salary"
              value={jobForm.salary}
              onChange={handleJobFormChange}
              className="input-field"
              placeholder="e.g. ₹80,000 - ₹120,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={jobForm.description}
              onChange={handleJobFormChange}
              className="input-field"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements</label>
            <textarea
              name="requirements"
              rows={3}
              value={jobForm.requirements}
              onChange={handleJobFormChange}
              className="input-field"
              placeholder="List the required skills, experience, and qualifications..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application URL</label>
              <input
                type="url"
                name="applicationUrl"
                value={jobForm.applicationUrl}
                onChange={handleJobFormChange}
                className="input-field"
                placeholder="https://company.com/careers/apply"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Application Email
              </label>
              <input
                type="email"
                name="applicationEmail"
                value={jobForm.applicationEmail}
                onChange={handleJobFormChange}
                className="input-field"
                placeholder="careers@company.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={posting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {posting ? (
                <>
                  <div className="spinner mr-2"></div>
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
    // No need to change your return() unless you want enhancements.
  )
}

export default Jobs
