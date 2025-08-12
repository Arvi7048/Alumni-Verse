const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
const path = require("path")
const dotenv = require("dotenv")

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '.env')
console.log(`Loading environment variables from: ${envPath}`)
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('Error loading .env file:', result.error)
  process.exit(1)
}

// Log that environment was loaded successfully
console.log('Environment variables loaded successfully')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE ? 'Set' : 'Not set')
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'Not set')

const connectDB = require("./config/database")
const { errorHandler } = require("./middleware/errorHandler")
const { socketAuth } = require("./middleware/auth")
const paytmRoutes = require('./routes/paytm');
const paytmCallbackRoutes = require('./routes/paytmCallback');

// Import routes
const authRoutes = require("./routes/auth")
const otpAuthRoutes = require("./routes/otpAuth")
const userRoutes = require("./routes/users")
const jobRoutes = require("./routes/jobs")
const eventRoutes = require("./routes/events")
const storyRoutes = require("./routes/stories")
const chatRoutes = require("./routes/chat")
const donationRoutes = require("./routes/donations")
const feedbackRoutes = require("./routes/feedback")
const notificationRoutes = require("./routes/notifications")
const uploadRoutes = require("./routes/upload")
const adminRoutes = require("./routes/admin")
const dashboardRoutes = require("./routes/dashboard")
const aiRoutes = require("./routes/ai")

const app = express()
const server = createServer(app)

// Connect to MongoDB
connectDB()

// Security middleware
// Allow cross-origin resource loading for static images (uploads) to prevent NotSameOrigin blocking
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL, // optional custom frontend URL from env
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://your-frontend-domain.com',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In other environments, allow only specific domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Rate limiting - disabled in development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  })
  app.use("/api/", limiter)
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/otp-auth", otpAuthRoutes)
app.use("/api/users", userRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/stories", storyRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/donations", donationRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/ai", aiRoutes)
app.use('/api/paytm', paytmRoutes);
app.use('/api/paytm', paytmCallbackRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
})

// Socket.io middleware for authentication
io.use(socketAuth)

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`)

  // Join user to their personal room
  socket.join(`user_${socket.userId}`)

  // Handle joining conversation rooms
  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`)
  })

  // Handle leaving conversation rooms
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`)
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`)
  })
})

// Make io available to routes
app.set("io", io)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})
