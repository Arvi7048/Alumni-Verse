# Alumni Verse

A comprehensive alumni networking platform built with Next.js, React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Alumni Verse
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `backend/.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/Alumni Verse
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-Alumni Verse-2024
   
   # File Upload
   MAX_FILE_SIZE=5242880
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB (if using local installation)
   mongod
   
   # Or if using MongoDB as a service
   sudo systemctl start mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the application**

   **Option 1: Start both frontend and backend (recommended)**
   ```bash
   npm run dev
   ```

   **Option 2: Start separately**
   ```bash
   # Terminal 1 - Start backend
   npm run server
   
   # Terminal 2 - Start frontend
   npm run client
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Login Credentials

### Admin Account
- **Email**: admin@alumnihub.com
- **Password**: admin123

### Test User Accounts
All test users use the password: `password123`

- john.smith@email.com
- sarah.johnson@email.com
- michael.chen@email.com
- emily.rodriguez@email.com
- david.wilson@email.com
- lisa.thompson@email.com
- robert.garcia@email.com
- jennifer.lee@email.com
- alex.kumar@email.com

## 🏗️ Project Structure

```
Alumni Verse/
├── app/                    # Next.js app directory
├── backend/               # Express.js backend
│   ├── config/           # Database and other configs
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding
│   └── server.js        # Main server file
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main App component
│   └── package.json
├── components/          # Shared UI components
└── package.json        # Root package.json
```

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Start Next.js development server
- `npm run server` - Start backend server
- `npm run client` - Start React frontend
- `npm run install-all` - Install dependencies for all packages
- `npm run seed` - Seed the database with sample data

### Backend Directory
- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend in production mode
- `npm run seed` - Seed the database

### Frontend Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/Alumni Verse |
| `JWT_SECRET` | JWT signing secret | (required) |
| `MAX_FILE_SIZE` | Maximum file upload size | 5242880 |

### Database

The application uses MongoDB as the primary database. Make sure MongoDB is running before starting the application.

## 🚀 Features

### User Features
- **Authentication**: Login, Register, Forgot Password
- **Profile Management**: View and edit profiles
- **Alumni Directory**: Browse and search alumni
- **Job Board**: View jobs, post jobs, apply for jobs
- **Events**: View events, create events, RSVP
- **Success Stories**: Read stories, share stories, like stories
- **Chat**: Real-time messaging with other alumni
- **Donations**: Make donations to support the institution
- **Feedback**: Submit feedback and surveys
- **Notifications**: View and manage notifications

### Admin Features
- **Admin Dashboard**: Platform statistics and analytics
- **User Management**: View and manage all users
- **Content Moderation**: Review and approve content
- **Platform Analytics**: Monitor user growth and engagement

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password

### Users
- `GET /api/users/directory` - Get alumni directory
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings` - Update user settings

### Jobs
- `GET /api/jobs` - Get job listings
- `POST /api/jobs` - Create job listing
- `POST /api/jobs/:id/apply` - Apply for job

### Events
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `POST /api/events/:id/rsvp` - RSVP to event

### Stories
- `GET /api/stories` - Get success stories
- `POST /api/stories` - Create success story
- `POST /api/stories/:id/like` - Like story

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/recent-activity` - Get recent activity

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check the MONGO_URI in your .env file
   - Ensure the database name is correct

2. **Port Already in Use**
   - Change the PORT in backend/.env
   - Kill any processes using ports 3000 or 5000

3. **File Upload Issues**
   - Check file permissions in the uploads directory
   - Ensure MAX_FILE_SIZE is set appropriately

4. **JWT Token Issues**
   - Make sure JWT_SECRET is set in .env
   - Clear browser localStorage if needed

### Reset Database

To reset the database and start fresh:

```bash
# Connect to MongoDB
mongo

# Drop the database
use Alumni Verse
db.dropDatabase()

# Exit MongoDB
exit

# Re-seed the database
npm run seed
```

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production` in backend/.env
2. Update `MONGO_URI` to your production database
3. Set a strong `JWT_SECRET`
4. Configure CORS origins for your domain
5. Set up proper file storage (AWS S3, etc.)
6. Configure email service for password reset
7. Set up SSL certificates
8. Configure reverse proxy (nginx)
9. Set up monitoring and logging

## 📝 Development Notes

- The frontend uses React with functional components and hooks
- The backend uses Express.js with MongoDB and Mongoose
- Real-time features are implemented with Socket.io
- File uploads are handled with Multer
- Authentication uses JWT tokens
- All passwords are hashed with bcrypt
- The application includes comprehensive error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed
5. Review the API responses in browser developer tools

The platform includes comprehensive logging to help diagnose issues during development and production.
