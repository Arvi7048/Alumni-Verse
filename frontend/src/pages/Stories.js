"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { PlusIcon, HeartIcon, ChatBubbleLeftIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import api from "../utils/api"
import Modal from "../components/Modal"
import LoadingSpinner from "../components/LoadingSpinner"

const Stories = () => {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [storyForm, setStoryForm] = useState({
    title: "",
    content: "",
    image: null,
  })

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await api.get("/stories")
      if (res.success) {
        // Defensive: handle both array and object response
        if (Array.isArray(res.data)) {
          setStories(res.data)
        } else if (Array.isArray(res.data.stories)) {
          setStories(res.data.stories)
        } else {
          setStories([])
        }
      } else {
        throw new Error(res.error || 'Failed to fetch stories')
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoryFormChange = (e) => {
    if (e.target.name === "image") {
      setStoryForm({
        ...storyForm,
        image: e.target.files[0],
      })
    } else {
      setStoryForm({
        ...storyForm,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleCreateStory = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    // Frontend validation
    if (!storyForm.title || storyForm.title.trim().length < 10) {
      setError("Story title must be at least 10 characters long")
      setCreating(false)
      return
    }

    if (!storyForm.content || storyForm.content.trim().length < 100) {
      setError("Story content must be at least 100 characters long")
      setCreating(false)
      return
    }

    if (storyForm.title.trim().length > 150) {
      setError("Story title cannot exceed 150 characters")
      setCreating(false)
      return
    }

    if (storyForm.content.trim().length > 5000) {
      setError("Story content cannot exceed 5000 characters")
      setCreating(false)
      return
    }

    try {
      let imageUrl = null

      // Upload image if provided
      if (storyForm.image) {
        setUploading(true)
        const formData = new FormData()
        formData.append("image", storyForm.image)

        const uploadRes = await api.post("/upload/story-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        if (!uploadRes.success) throw new Error(uploadRes.error || 'Failed to upload image')
        imageUrl = uploadRes.data.imageUrl
        setUploading(false)
      }

      const storyData = {
        title: storyForm.title,
        content: storyForm.content,
        image: imageUrl,
      }

      const res = await api.post("/stories", storyData)
      if (!res.success) throw new Error(res.error || 'Failed to create story')
      // Defensive: if res.data is an array, spread it; otherwise treat as single story
      if (Array.isArray(res.data)) {
        setStories([...res.data, ...stories])
      } else {
        setStories([res.data, ...stories])
      }
      setShowCreateModal(false)
      setStoryForm({
        title: "",
        content: "",
        image: null,
      })
    } catch (error) {
      console.error("Failed to create story:", error)
      // Try to show detailed validation errors from backend
      if (error?.response?.data?.errors) {
        // Mongoose validation error array
        setError(
          error.response.data.errors.map((err) => err.msg || err.message).join("; ")
        )
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError("Failed to share story. Please try again.")
      }
    } finally {
      setCreating(false)
      setUploading(false)
    }
  }

  const handleLike = async (storyId) => {
    try {
      const res = await api.post(`/stories/${storyId}/like`)
      if (!res.success) throw new Error(res.error || 'Failed to like story')
      // Update the story in the list
      setStories(
        stories.map((story) =>
          story._id === storyId
            ? {
                ...story,
                likes: story.likes.includes(user._id)
                  ? story.likes.filter((id) => id !== user._id)
                  : [...story.likes, user._id],
              }
            : story,
        ),
      )
    } catch (error) {
      console.error("Failed to like story:", error)
    }
  }

  const hasLiked = (story) => {
    return story.likes.includes(user._id)
  }

  if (loading) {
    return <LoadingSpinner text="Loading success stories..." />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Success Stories</h1>
          <p className="text-gray-600 dark:text-gray-400">Share and celebrate alumni achievements</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Share Story
        </button>
      </div>

      {/* Stories List */}
      {Array.isArray(stories) && stories.length > 0 ? (
        <div className="space-y-8">
          {stories.map((story) => (
            <article key={story._id} className="card p-6">
              {/* Story Header */}
              <div className="flex items-center mb-4">
                {story.submittedBy && story.submittedBy.profileImage ? (
                  <img
                    src={story.submittedBy.profileImage || "/placeholder.svg"}
                    alt={story.submittedBy.name || 'Unknown User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                      {(story.submittedBy && story.submittedBy.name ? story.submittedBy.name.charAt(0).toUpperCase() : 'U')}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{story.submittedBy && story.submittedBy.name ? story.submittedBy.name : 'Unknown User'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(story.submittedBy && story.submittedBy.batch ? story.submittedBy.batch : '-')}
                    {' • '}
                    {(story.submittedBy && story.submittedBy.branch ? story.submittedBy.branch : '-')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Story Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{story.title}</h2>

              {/* Story Image */}
              {story.image && (
                <div className="mb-4">
                  <img
                    src={story.image || "/placeholder.svg"}
                    alt={story.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Story Content */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{story.content}</p>
              </div>

              {/* Story Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  {user?.role === "admin" && (
                    <button
                      onClick={async () => {
                        if (typeof window !== 'undefined' && window.confirm("Are you sure you want to delete this story? This cannot be undone.")) {
                          try {
                            const res = await api.delete(`/stories/${story._id}`)
                            if (!res.success) throw new Error(res.error || 'Failed to delete story')
                            setStories(stories.filter((s) => s._id !== story._id))
                          } catch (err) {
                            alert(err?.response?.data?.message || "Failed to delete story.")
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 border border-red-200 rounded"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => handleLike(story._id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      hasLiked(story)
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {hasLiked(story) ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                    <span className="text-sm font-medium">
                      {story.likes.length} {story.likes.length === 1 ? "like" : "likes"}
                    </span>
                  </button>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span className="text-sm">{story.comments?.length || 0} comments</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(story.createdAt).toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No stories yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Be the first to share your success story!</p>
        </div>
      )}

      {/* Create Story Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Share Your Success Story"
        size="lg"
      >
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 border border-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateStory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Story Title *</label>
            <input
              type="text"
              name="title"
              required
              value={storyForm.title}
              onChange={handleStoryFormChange}
              className="input-field"
              placeholder="e.g. From Student to CEO: My Journey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Story *</label>
            <textarea
              name="content"
              required
              rows={8}
              value={storyForm.content}
              onChange={handleStoryFormChange}
              className="input-field"
              placeholder="Share your journey, challenges overcome, achievements, and advice for fellow alumni..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Image (Optional)
            </label>
            <input type="file" name="image" accept="image/*" onChange={handleStoryFormChange} className="input-field" />
            {storyForm.image && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Selected: {storyForm.image.name}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creating || uploading ? (
                <>
                  <div className="spinner mr-2"></div>
                  {uploading ? "Uploading..." : "Sharing..."}
                </>
              ) : (
                "Share Story"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Stories
