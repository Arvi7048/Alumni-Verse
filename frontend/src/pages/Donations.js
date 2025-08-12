"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { HeartIcon, BanknotesIcon, TrophyIcon } from "@heroicons/react/24/outline"
import api from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import PaytmButton from "../components/PaytmButton"

const Donations = () => {
  const { user } = useAuth()
  const [donationStats, setDonationStats] = useState({
    totalRaised: 0,
    totalDonors: 0,
    recentDonations: [],
  })
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [donationForm, setDonationForm] = useState({
    amount: "",
    message: "",
    anonymous: false,
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const predefinedAmounts = [ 2000, 5000, 10000, 20000, 50000,100000]

  useEffect(() => {
    fetchDonationStats()
  }, [])

  const fetchDonationStats = async () => {
    try {
      const res = await api.get("/donations/stats")
      if (res.success) {
        setDonationStats(res.data)
      } else {
        throw new Error(res.error || 'Failed to fetch donation stats')
      }
    } catch (error) {
      console.error("Failed to fetch donation stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount("")
    setDonationForm({
      ...donationForm,
      amount: amount,
    })
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value
    setCustomAmount(value)
    setSelectedAmount("")
    setDonationForm({
      ...donationForm,
      amount: value,
    })
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setDonationForm({
      ...donationForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleDonate = async (e) => {
    e.preventDefault()
    setDonating(true)

    try {
      // In a real application, you would integrate with a payment processor like Stripe
      const donationData = {
        amount: Number.parseFloat(donationForm.amount),
        message: donationForm.message,
        anonymous: donationForm.anonymous,
      }

      const res = await api.post("/donations", donationData)
      if (!res.success) throw new Error(res.error || 'Failed to process donation')

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Reset form and refresh stats
      setDonationForm({
        amount: "",
        message: "",
        anonymous: false,
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      })
      setSelectedAmount("")
      setCustomAmount("")

      fetchDonationStats()

      alert("Thank you for your donation! Your contribution makes a difference.")
    } catch (error) {
      console.error("Failed to process donation:", error)
      alert("Failed to process donation. Please try again.")
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading donation information..." />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Support Your Alma Mater</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your generous donations help fund scholarships, improve facilities, and support the next generation of
          students. Every contribution makes a difference.
        </p>
      </div>

      {/* Donation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
           ₹{donationStats.totalRaised.toLocaleString()}
          </h3>

          <p className="text-gray-600 dark:text-gray-400">Total Raised</p>
        </div>

        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <HeartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{donationStats.totalDonors}</h3>
          <p className="text-gray-600 dark:text-gray-400">Generous Donors</p>
        </div>

        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
            <TrophyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {Math.floor(donationStats.totalRaised / 1000)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Scholarships Funded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Form */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Make a Donation</h2>

          <form onSubmit={handleDonate} className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select Amount</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors duration-200 ${selectedAmount === amount
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-400 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="input-field pl-8"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                name="message"
                rows={3}
                value={donationForm.message}
                onChange={handleFormChange}
                className="input-field"
                placeholder="Share why you're donating or leave a message for the community..."
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                id="anonymous"
                name="anonymous"
                type="checkbox"
                checked={donationForm.anonymous}
                onChange={handleFormChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make this donation anonymous
              </label>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                Pay Securely with Paytm
              </h3>
              <PaytmButton
                amount={donationForm.amount || customAmount || selectedAmount}
                orderId={`DONATION_${Date.now()}`}
                customerId={user?._id || "guest"}
                email={user?.email || "donor@email.com"}
                mobile={user?.mobile || "9999999999"}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">You will be redirected to Paytm to complete your donation.</p>
            </div>

            <button
              type="submit"
              disabled={!donationForm.amount || donating}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-3"
            >
              {donating ? (
                <>
                  <div className="spinner mr-2"></div>
                  Processing Donation...
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5 mr-2" />
                  Donate ₹{donationForm.amount || "0"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>🔒 Your payment information is secure and encrypted</p>
            <p className="mt-1">This is a demo form - no actual payment will be processed</p>
          </div>
        </div>

        {/* Recent Donations & Impact */}
        <div className="space-y-6">
          {/* Impact Section */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Scholarships</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help deserving students access quality education
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Infrastructure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Improve campus facilities and learning resources
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex-shrink-0">
                  <HeartIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Community Programs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Support alumni events and networking initiatives
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Donations</h3>
            {donationStats.recentDonations.length > 0 ? (
              <div className="space-y-3">
                {donationStats.recentDonations.map((donation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {donation.anonymous ? "Anonymous" : donation.donor}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{donation.message}"</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(donation.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">₹{donation.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent donations to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Donations
