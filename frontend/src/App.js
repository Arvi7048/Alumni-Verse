import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Toaster } from "react-hot-toast"
import PageWrapper from "./components/PageWrapper";
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import ClientWrapper from "./components/ClientWrapper"

// Pages
import Login from "./pages/Login"
import OTPSignup from "./pages/OTPSignup"
import OTPForgotPassword from "./pages/OTPForgotPassword"
import Profile from "./pages/Profile"
import Directory from "./pages/Directory"
import Chat from "./pages/Chat"
import Jobs from "./pages/Jobs"
import Donations from "./pages/Donations"
import Stories from "./pages/Stories"
import Events from "./pages/Events"
import Feedback from "./pages/Feedback"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import About from "./pages/About"
import AdminDashboard from "./pages/AdminDashboard"
import Home from "./pages/Home"



function App() {
  return (
    <ClientWrapper>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Toaster position="top-center" />
                <Routes>
                  {/* Routes without Navbar */}
                  <Route path="/signup" element={<OTPSignup />} />
                  <Route path="/otp-signup" element={<OTPSignup />} />
                  <Route path="/forgot-password" element={<OTPForgotPassword />} />
                  <Route path="/otp-forgot-password" element={<OTPForgotPassword />} />

                  {/* Routes with Navbar and conditional layout */}
                  <Route element={<PageWrapper />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                    <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
                    <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                    <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  </Route>

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ClientWrapper>
  )
}

export default App
