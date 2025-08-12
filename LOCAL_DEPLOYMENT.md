# 🚀 Local Full-Stack Deployment Guide

## 📋 Prerequisites Checklist

### ✅ System Requirements
- [ ] **Node.js** (v16 or higher) - **Installed: v22.12.0** ✅
- [ ] **npm** (v6 or higher) - **Installed: v10.9.0** ✅
- [ ] **MongoDB** (v4.4 or higher) - **Need to install**
- [ ] **Git** (for version control)
- [ ] **Code Editor** (VS Code recommended)

### 🔧 Required Software
1. **MongoDB Community Server**
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

2. **MongoDB Compass** (Optional but recommended)
   - Download: https://www.mongodb.com/try/download/compass

## 🛠️ Step-by-Step Local Deployment

### Step 1: Install MongoDB

#### Option A: Local MongoDB Installation
```bash
# Windows
# 1. Download MongoDB Community Server from official website
# 2. Run the installer
# 3. Add MongoDB to PATH environment variable
# 4. Create data directory
mkdir C:\data\db

# 5. Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update MONGO_URI in .env file

### Step 2: Project Setup

```bash
# 1. Navigate to project directory
cd C:\Users\arvin\OneDrive\Desktop\alumni-platform

# 2. Install all dependencies
npm run install-all

# 3. Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/alumni-platform
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-alumni-platform-2024

# File Upload Configuration
MAX_FILE_SIZE=5242880

# Optional: Email Configuration (for password reset)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

### Step 4: Database Setup

```bash
# 1. Start MongoDB (if using local installation)
mongod

# 2. In a new terminal, seed the database
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
MongoDB Connected
✅ Created 10 users
✅ Created 5 job listings
✅ Created 5 events
✅ Created 4 success stories
✅ Created 8 donations

🎉 Database seeding completed successfully!

📋 Summary:
   Users: 10
   Jobs: 5
   Events: 5
   Stories: 4
   Donations: 8

🔑 Admin Login Credentials:
   Email: admin@alumnihub.com
   Password: admin123
```

### Step 5: Start the Application

#### Option A: Start Both Frontend and Backend (Recommended)
```bash
# Start both servers simultaneously
npm run dev-full
```

#### Option B: Start Separately (For Development)
```bash
# Terminal 1 - Start Backend
npm run server

# Terminal 2 - Start Frontend
npm run client
```

### Step 6: Verify Deployment

#### Check Backend API
```bash
# Test health endpoint
curl http://localhost:5000/api/health
# OR visit: http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

#### Check Frontend
- Open browser: http://localhost:3000
- You should see the login page

#### Check Database
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Verify `alumni-platform` database exists with collections

## 🔍 Verification Checklist

### ✅ Backend Verification
- [ ] MongoDB connection successful
- [ ] Server running on port 5000
- [ ] Health endpoint responding
- [ ] All API routes accessible
- [ ] File uploads working
- [ ] JWT authentication working

### ✅ Frontend Verification
- [ ] React app loading on port 3000
- [ ] Login page accessible
- [ ] Registration working
- [ ] Navigation working
- [ ] All pages loading
- [ ] Responsive design working

### ✅ Database Verification
- [ ] Database created successfully
- [ ] Sample data seeded
- [ ] Collections created:
  - [ ] users
  - [ ] jobs
  - [ ] events
  - [ ] stories
  - [ ] donations
  - [ ] conversations
  - [ ] messages
  - [ ] notifications
  - [ ] feedback

### ✅ Authentication Verification
- [ ] Admin login working
- [ ] User registration working
- [ ] User login working
- [ ] JWT tokens working
- [ ] Protected routes working

## 🧪 Testing the Application

### 1. Admin Testing
```bash
# Login as admin
Email: admin@alumnihub.com
Password: admin123

# Test admin features:
- Dashboard statistics
- User management
- Content moderation
- Platform analytics
```

### 2. User Testing
```bash
# Login as regular user
Email: john.smith@email.com
Password: password123

# Test user features:
- Profile management
- Alumni directory
- Job board
- Events
- Chat
- Stories
- Donations
```

### 3. API Testing
```bash
# Test key endpoints
GET    http://localhost:5000/api/health
POST   http://localhost:5000/api/auth/login
GET    http://localhost:5000/api/users/directory
GET    http://localhost:5000/api/jobs
GET    http://localhost:5000/api/events
GET    http://localhost:5000/api/stories
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Error
```bash
# Error: MongoDB connection error
# Solution:
# 1. Check if MongoDB is running
mongod

# 2. Check connection string in .env
# 3. Verify database name
```

#### 2. Port Already in Use
```bash
# Error: EADDRINUSE
# Solution:
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

#### 3. Module Not Found
```bash
# Error: Cannot find module
# Solution: Reinstall dependencies
npm run install-all
```

#### 4. JWT Token Issues
```bash
# Error: Token is not valid
# Solution:
# 1. Check JWT_SECRET in .env
# 2. Clear browser localStorage
# 3. Restart servers
```

#### 5. File Upload Issues
```bash
# Error: File upload failed
# Solution:
# 1. Check uploads directory permissions
# 2. Verify MAX_FILE_SIZE in .env
# 3. Ensure directory exists
mkdir backend/uploads
```

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check running processes
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check disk space
dir

# Check environment variables
echo %NODE_ENV%
```

## 📊 Performance Monitoring

### Backend Monitoring
```bash
# Monitor server logs
npm run server

# Check memory usage
# Use Task Manager or:
wmic process where name="node.exe" get ProcessId,WorkingSetSize
```

### Frontend Monitoring
```bash
# Monitor React app
npm run client

# Check browser console for errors
# Use React Developer Tools extension
```

### Database Monitoring
```bash
# Monitor MongoDB
mongod --verbose

# Use MongoDB Compass for visual monitoring
```

## 🔧 Development Workflow

### Daily Development
```bash
# 1. Start MongoDB
mongod

# 2. Start both servers together
npm run dev-full

# OR start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client

# 4. Make changes and test
# 5. Check logs for errors
```

### Code Changes
```bash
# Backend changes auto-reload with nodemon
# Frontend changes auto-reload with React

# For database changes:
npm run seed

# For dependency changes:
npm run install-all
```

## 📝 Logs and Debugging

### Backend Logs
```bash
# Server logs
npm run server

# Database logs
mongod --verbose

# Error logs
# Check console output for detailed errors
```

### Frontend Logs
```bash
# React logs
npm run client

# Browser console
# Press F12 to open developer tools
```

### Database Logs
```bash
# MongoDB logs
# Check MongoDB Compass for visual logs
# Or use MongoDB shell:
mongo
show dbs
use alumni-platform
show collections
```

## 🎯 Success Criteria

Your local deployment is successful when:

1. ✅ **Backend API** responds to health check
2. ✅ **Frontend** loads without errors
3. ✅ **Database** contains seeded data
4. ✅ **Authentication** works for admin and users
5. ✅ **All features** are functional:
   - User registration/login
   - Profile management
   - Alumni directory
   - Job board
   - Events
   - Chat
   - Stories
   - Donations
   - Admin dashboard

## 🚀 Next Steps

After successful local deployment:

1. **Test all features** thoroughly
2. **Customize content** and styling
3. **Add real data** and users
4. **Set up version control** (Git)
5. **Prepare for production** deployment
6. **Set up monitoring** and logging
7. **Implement CI/CD** pipeline

## 📞 Support

If you encounter issues:

1. **Check logs** in all terminals
2. **Verify environment** variables
3. **Test individual** components
4. **Check network** connectivity
5. **Review error** messages
6. **Restart services** if needed

---

## 🎉 Congratulations!

You've successfully deployed your Alumni Association Platform locally! 

**Access your application:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 📊 Database: MongoDB (localhost:27017)

**Ready to explore and customize your platform!** 🚀 