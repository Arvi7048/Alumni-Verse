# Alumni Association Platform - Complete Setup Guide

## 🚀 Quick Start Checklist

### ✅ Prerequisites Check
- [x] Node.js (v16 or higher) - **Installed: v22.12.0**
- [x] npm (v6 or higher) - **Installed: v10.9.0**
- [ ] MongoDB (v4.4 or higher) - **Need to install/start**

### 📋 Installation Steps

1. **Install all dependencies**
   ```bash
   npm run install-all
   ```

2. **Create environment file**
   
   Create `backend/.env` file with the following content:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/alumni-platform
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-alumni-platform-2024
   
   # File Upload
   MAX_FILE_SIZE=5242880
   ```

3. **Start MongoDB**
   
   **Option A: Install MongoDB locally**
   ```bash
   # Download and install MongoDB from https://www.mongodb.com/try/download/community
   # Start MongoDB service
   mongod
   ```
   
   **Option B: Use MongoDB Atlas (Cloud)**
   - Sign up at https://www.mongodb.com/atlas
   - Create a free cluster
   - Get your connection string and update MONGO_URI in .env

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Test Credentials

### Admin Account
- **Email**: admin@alumnihub.com
- **Password**: admin123

### Regular User Accounts
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

## 🏗️ Project Architecture

This is a **hybrid application** with:
- **Next.js** for the main app structure
- **React** frontend for the actual application
- **Express.js** backend API
- **MongoDB** database

### File Structure
```
alumni-platform/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page (renders React app)
│   └── globals.css        # Global styles
├── backend/               # Express.js backend
│   ├── config/           # Database configuration
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
- `npm run server` - Start backend server only
- `npm run client` - Start React frontend only
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

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/alumni-platform | Yes |
| `JWT_SECRET` | JWT signing secret | (none) | Yes |
| `MAX_FILE_SIZE` | Maximum file upload size | 5242880 | No |

### Database Schema

The application includes the following MongoDB models:
- **User** - User profiles and authentication
- **Job** - Job listings and applications
- **Event** - Events and RSVPs
- **Story** - Success stories
- **Donation** - Donation records
- **Conversation** - Chat conversations
- **Message** - Chat messages
- **Notification** - User notifications
- **Feedback** - User feedback

## 🚀 Features Overview

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
   ```bash
   # Error: MongoDB connection error
   # Solution: Make sure MongoDB is running
   mongod
   ```

2. **Port Already in Use**
   ```bash
   # Error: EADDRINUSE
   # Solution: Change PORT in backend/.env or kill existing processes
   # Windows:
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

3. **Module Not Found Errors**
   ```bash
   # Solution: Reinstall dependencies
   npm run install-all
   ```

4. **JWT Token Issues**
   ```bash
   # Solution: Clear browser localStorage
   # Or check JWT_SECRET in .env file
   ```

5. **File Upload Issues**
   ```bash
   # Solution: Check uploads directory permissions
   # Ensure MAX_FILE_SIZE is set appropriately
   ```

### Reset Database

To reset the database and start fresh:

```bash
# Connect to MongoDB
mongo

# Drop the database
use alumni-platform
db.dropDatabase()

# Exit MongoDB
exit

# Re-seed the database
npm run seed
```

### Development Tips

1. **Check Logs**: Monitor console output for both frontend and backend
2. **Browser DevTools**: Check Network tab for API calls
3. **MongoDB Compass**: Use for database inspection
4. **Postman**: Test API endpoints directly

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production` in backend/.env
2. Update `MONGO_URI` to production database
3. Set a strong `JWT_SECRET`
4. Configure CORS origins for your domain

### File Storage
- Set up AWS S3 or similar for file uploads
- Update upload configuration

### Security
- Set up SSL certificates
- Configure reverse proxy (nginx)
- Set up monitoring and logging
- Implement rate limiting

### Performance
- Enable MongoDB indexing
- Implement caching (Redis)
- Optimize images and assets
- Set up CDN

## 📝 Development Notes

### Tech Stack
- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Multer
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Code Quality
- All passwords are hashed with bcrypt
- Comprehensive error handling and validation
- Input sanitization and validation
- Secure file upload handling
- CORS configuration
- Rate limiting implementation

### Testing
- API endpoints can be tested with Postman
- Frontend components can be tested manually
- Database operations are validated through seeding

## 🆘 Support

If you encounter any issues:

1. **Check Console Logs**: Look for error messages in terminal
2. **Verify Environment**: Ensure all .env variables are set
3. **Database Connection**: Confirm MongoDB is running
4. **Dependencies**: Run `npm run install-all` to reinstall
5. **API Testing**: Use browser dev tools to check API responses

### Getting Help
- Check the troubleshooting section above
- Review the API documentation
- Test individual components
- Verify database connectivity

The platform includes comprehensive logging to help diagnose issues during development and production.

---

## 🎯 Next Steps

After successful setup:

1. **Explore Features**: Test all user and admin features
2. **Customize**: Modify content, styling, and functionality
3. **Add Content**: Create real events, jobs, and stories
4. **Deploy**: Set up production environment
5. **Monitor**: Implement analytics and monitoring

Happy coding! 🚀
