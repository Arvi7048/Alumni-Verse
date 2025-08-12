"use client"

import { useState } from "react"
import { ChatBubbleLeftRightIcon, StarIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import api from "../utils/api"

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("feedback")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    type: "general",
    subject: "",
    message: "",
    rating: 0,
  })

  // Survey form state
  const [surveyForm, setSurveyForm] = useState({
    overallSatisfaction: 0,
    platformUsability: 0,
    contentQuality: 0,
    networkingValue: 0,
    recommendationLikelihood: 0,
    favoriteFeatures: [],
    improvements: "",
    additionalComments: "",
  })

  const feedbackTypes = [
    { value: "general", label: "General Feedback" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "content", label: "Content Issue" },
    { value: "other", label: "Other" },
  ]

  const features = [
    "Alumni Directory",
    "Job Board",
    "Events",
    "Chat/Messaging",
    "Success Stories",
    "Donation System",
    "Profile Management",
    "Notifications",
  ]

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target
    setFeedbackForm({
      ...feedbackForm,
      [name]: value,
    })
  }

  const handleSurveyChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "favoriteFeatures") {
      setSurveyForm({
        ...surveyForm,
        favoriteFeatures: checked
          ? [...surveyForm.favoriteFeatures, value]
          : surveyForm.favoriteFeatures.filter((f) => f !== value),
      })
    } else {
      setSurveyForm({
        ...surveyForm,
        [name]: type === "number" ? Number.parseInt(value) : value,
      })
    }
  }

  const handleRatingClick = (rating, field = "rating") => {
    if (activeTab === "feedback") {
      setFeedbackForm({
        ...feedbackForm,
        [field]: rating,
      })
    } else {
      setSurveyForm({
        ...surveyForm,
        [field]: rating,
      })
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await api.post("/feedback", {
        type: "feedback",
        data: feedbackForm,
      })
      if (!res.success) throw new Error(res.error || 'Failed to submit feedback')

      setSubmitted(true)
      setFeedbackForm({
        type: "general",
        subject: "",
        message: "",
        rating: 0,
      })
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSurveySubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await api.post("/feedback", {
        type: "survey",
        data: surveyForm,
      })
      if (!res.success) throw new Error(res.error || 'Failed to submit survey')

      setSubmitted(true)
      setSurveyForm({
        overallSatisfaction: 0,
        platformUsability: 0,
        contentQuality: 0,
        networkingValue: 0,
        recommendationLikelihood: 0,
        favoriteFeatures: [],
        improvements: "",
        additionalComments: "",
      })
    } catch (error) {
      console.error("Failed to submit survey:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, onStarClick, field = "rating") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onStarClick(star, field)} className="focus:outline-none">
            {star <= rating ? (
              <StarIconSolid className="h-6 w-6 text-yellow-400" />
            ) : (
              <StarIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
            )}
          </button>
        ))}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <PaperAirplaneIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your {activeTab} has been submitted successfully. We appreciate your input and will use it to improve the
            platform.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setActiveTab("feedback")
            }}
            className="btn-primary"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Feedback & Survey</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Help us improve the alumni platform with your valuable feedback
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
            activeTab === "feedback"
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
          General Feedback
        </button>
        <button
          onClick={() => setActiveTab("survey")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
            activeTab === "survey"
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <StarIcon className="h-5 w-5 inline mr-2" />
          Platform Survey
        </button>
      </div>

      {/* Feedback Form */}
      {activeTab === "feedback" && (
        <div className="card p-8">
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback Type</label>
              <select name="type" value={feedbackForm.type} onChange={handleFeedbackChange} className="input-field">
                {feedbackTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                required
                value={feedbackForm.subject}
                onChange={handleFeedbackChange}
                className="input-field"
                placeholder="Brief description of your feedback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Rating</label>
              {renderStars(feedbackForm.rating, handleRatingClick)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                name="message"
                required
                rows={6}
                value={feedbackForm.message}
                onChange={handleFeedbackChange}
                className="input-field"
                placeholder="Please provide detailed feedback..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Survey Form */}
      {activeTab === "survey" && (
        <div className="card p-8">
          <form onSubmit={handleSurveySubmit} className="space-y-8">
            {/* Rating Questions */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall satisfaction with the alumni platform
                </label>
                {renderStars(surveyForm.overallSatisfaction, handleRatingClick, "overallSatisfaction")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Platform usability and ease of navigation
                </label>
                {renderStars(surveyForm.platformUsability, handleRatingClick, "platformUsability")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quality of content and information
                </label>
                {renderStars(surveyForm.contentQuality, handleRatingClick, "contentQuality")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Value for networking and connections
                </label>
                {renderStars(surveyForm.networkingValue, handleRatingClick, "networkingValue")}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How likely are you to recommend this platform to other alumni?
                </label>
                {renderStars(surveyForm.recommendationLikelihood, handleRatingClick, "recommendationLikelihood")}
              </div>
            </div>

            {/* Feature Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Which features do you find most valuable? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      name="favoriteFeatures"
                      value={feature}
                      checked={surveyForm.favoriteFeatures.includes(feature)}
                      onChange={handleSurveyChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Open-ended Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What improvements would you like to see?
              </label>
              <textarea
                name="improvements"
                rows={4}
                value={surveyForm.improvements}
                onChange={handleSurveyChange}
                className="input-field"
                placeholder="Suggest features, improvements, or changes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional comments
              </label>
              <textarea
                name="additionalComments"
                rows={3}
                value={surveyForm.additionalComments}
                onChange={handleSurveyChange}
                className="input-field"
                placeholder="Any other thoughts or suggestions..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <StarIcon className="h-5 w-5 mr-2" />
                  Submit Survey
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Feedback
