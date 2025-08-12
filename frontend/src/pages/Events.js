"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { PlusIcon, CalendarDaysIcon, MapPinIcon, UserGroupIcon, ClockIcon } from "@heroicons/react/24/outline"
import api from "../utils/api"
import Modal from "../components/Modal"
import LoadingSpinner from "../components/LoadingSpinner"

const Events = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [rsvping, setRsvping] = useState(null)
  const [eventForm, setEventForm] = useState({
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  maxAttendees: "",
})
const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events")
      if (res.success) {
        // The backend returns { events, totalPages, currentPage, total }
        setEvents(res.data.events || [])
      } else {
        throw new Error(res.error || 'Failed to fetch events')
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      let dateStr = eventForm.date
// If date is in DD-MM-YYYY format, convert to YYYY-MM-DD
if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
  const [day, month, year] = dateStr.split("-")
  dateStr = `${year}-${month}-${day}`
}
const dateTimeISO = `${dateStr}T${eventForm.time}:00` // seconds for ISO
const eventData = {
  title: eventForm.title,
  description: eventForm.description,
  date: new Date(dateTimeISO), // includes both date and time
  location: eventForm.location,
  ...(eventForm.maxAttendees ? { maxAttendees: Number.parseInt(eventForm.maxAttendees) } : {}),
}
// Only send combined date+time in 'date' field

      const res = await api.post("/events", eventData)
      if (!res.success) throw new Error(res.error || 'Failed to create event')
      setEvents([res.data, ...events])
      setShowCreateModal(false)
      setEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        maxAttendees: "",
      })
    } catch (error) {
      let msg = "Failed to create event. Please try again."
      if (error?.response?.data?.errors) {
        msg = error.response.data.errors.map(e => e.msg).join(" ")
      } else if (error?.response?.data?.message) {
        msg = error.response.data.message
      }
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleRSVP = async (eventId) => {
    setRsvping(eventId)
    try {
      const res = await api.post(`/events/${eventId}/rsvp`)
      if (!res.success) throw new Error(res.error || 'Failed to RSVP')
      // Update the event in the list to show user has RSVP'd
      setEvents(
        events.map((event) => (event._id === eventId ? { ...event, rsvps: [...event.rsvps, user._id] } : event)),
      )
    } catch (error) {
      console.error("Failed to RSVP:", error)
    } finally {
      setRsvping(null)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (typeof window === 'undefined' || !window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/events/${eventId}`);
      if (!res.success) throw new Error(res.error || 'Failed to delete event');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (error) {
      alert('Failed to delete event.');
    }
  }

  const handleCancelRSVP = async (eventId) => {
    setRsvping(eventId)
    try {
      const res = await api.delete(`/events/${eventId}/rsvp`)
      if (!res.success) throw new Error(res.error || 'Failed to cancel RSVP')
      // Update the event in the list to remove user's RSVP
      setEvents(
        events.map((event) =>
          event._id === eventId ? { ...event, rsvps: event.rsvps.filter((id) => id !== user._id) } : event,
        ),
      )
    } catch (error) {
      console.error("Failed to cancel RSVP:", error)
    } finally {
      setRsvping(null)
    }
  }

  const hasRSVPd = (event) => {
    return event.rsvps.includes(user._id)
  }

  const isEventCreator = (event) => {
    return event.createdBy && event.createdBy._id && user && user._id && event.createdBy._id === user._id;
  }

  const isEventFull = (event) => {
    return event.maxAttendees && event.rsvps.length >= event.maxAttendees
  }

  const isPastEvent = (event) => {
    return new Date(event.date) < new Date()
  }

  if (loading) {
    return <LoadingSpinner text="Loading events..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Alumni Events</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect with fellow alumni at upcoming events</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event._id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {event.rsvps.length} attending
                      {event.maxAttendees && ` / ${event.maxAttendees} max`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm font-medium mr-2"
                    >
                      Delete
                    </button>
                  )}
                  {isPastEvent(event) && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      Past Event
                    </span>
                  )}
                  {isEventFull(event) && !isPastEvent(event) && (
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                      Full
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{event.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Created by {(event.createdBy && event.createdBy.name) ? event.createdBy.name : 'Unknown User'}</div>

                <div className="flex space-x-2">
                  {!isEventCreator(event) && !isPastEvent(event) && (
                    <>
                      {hasRSVPd(event) ? (
                        <button
                          onClick={() => handleCancelRSVP(event._id)}
                          disabled={rsvping === event._id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {rsvping === event._id ? (
                            <>
                              <div className="spinner mr-2"></div>
                              Canceling...
                            </>
                          ) : (
                            "Cancel RSVP"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRSVP(event._id)}
                          disabled={rsvping === event._id || isEventFull(event)}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {rsvping === event._id ? (
                            <>
                              <div className="spinner mr-2"></div>
                              RSVPing...
                            </>
                          ) : isEventFull(event) ? (
                            "Event Full"
                          ) : (
                            "RSVP"
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No events yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Be the first to create an alumni event!</p>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Event" size="lg">
        {createError && (
  <div className="text-red-600 bg-red-100 rounded px-3 py-2 mb-2">
    {createError}
  </div>
)}
<form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Title *</label>
            <input
              type="text"
              name="title"
              required
              value={eventForm.title}
              onChange={handleEventFormChange}
              className="input-field"
              placeholder="e.g. Alumni Networking Meetup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={eventForm.description}
              onChange={handleEventFormChange}
              className="input-field"
              placeholder="Describe the event, agenda, and what attendees can expect..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                required
                value={eventForm.date}
                onChange={handleEventFormChange}
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time *</label>
              <input
                type="time"
                name="time"
                required
                value={eventForm.time}
                onChange={handleEventFormChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              required
              value={eventForm.location}
              onChange={handleEventFormChange}
              className="input-field"
              placeholder="e.g. Conference Room A, 123 Main St or Virtual (Zoom link)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Attendees</label>
            <input
              type="number"
              name="maxAttendees"
              value={eventForm.maxAttendees}
              onChange={handleEventFormChange}
              className="input-field"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creating ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Events
