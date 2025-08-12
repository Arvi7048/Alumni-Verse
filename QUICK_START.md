# 🚀 Quick Start Guide - No More Script Errors!

## ✅ **PERMANENT FIX APPLIED**

The script errors have been **permanently fixed** by adding the missing scripts to both frontend and backend package.json files.

## 🎯 **Correct Way to Run the Application**

### **From Root Directory (RECOMMENDED)**
```bash
# Always run these commands from the root directory:
cd C:\Users\arvin\OneDrive\Desktop\alumni-platform

# 1. Install dependencies
npm run install-all

# 2. Create backend/.env file (see below)

# 3. Start MongoDB
mongod

# 4. Seed database
npm run seed

# 5. Start both servers together
npm run dev-full
```

### **Available Scripts (From Root Directory)**
```bash
npm run dev-full    # Start both frontend and backend
npm run server      # Start backend only
npm run client      # Start frontend only
npm run frontend    # Start frontend only (alias)
npm run backend     # Start backend only (alias)
npm run install-all # Install all dependencies
npm run seed        # Seed database
```

## ❌ **What NOT to Do**

### **Don't run scripts from subdirectories:**
```bash
# ❌ WRONG - Don't do this:
cd frontend
npm run client  # This will fail!

cd backend
npm run server  # This might work but not recommended
```

### **Don't use wrong script names:**
```bash
# ❌ WRONG - These don't exist:
npm run start-frontend
npm run start-backend
npm run dev-server
```

## ✅ **What TO Do**

### **Always run from root directory:**
```bash
# ✅ CORRECT - Always do this:
cd C:\Users\arvin\OneDrive\Desktop\alumni-platform
npm run dev-full
```

## 🔧 **Environment Setup**

### **Create backend/.env file:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/alumni-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-alumni-platform-2024

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

## 🚀 **Complete Deployment Steps**

### **Step 1: Prerequisites**
```bash
# Check Node.js and npm
node --version  # Should be v16 or higher
npm --version   # Should be v6 or higher

# Install MongoDB if not installed
# Download from: https://www.mongodb.com/try/download/community
```

### **Step 2: Setup**
```bash
# Navigate to project root
cd C:\Users\arvin\OneDrive\Desktop\alumni-platform

# Install all dependencies
npm run install-all

# Create environment file (see above)
# Create backend/.env with the content shown above
```

### **Step 3: Database**
```bash
# Start MongoDB
mongod

# In a new terminal, seed the database
npm run seed
```

### **Step 4: Start Application**
```bash
# Start both servers together
npm run dev-full
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔑 **Test Credentials**

- **Admin**: admin@alumnihub.com / admin123
- **User**: john.smith@email.com / password123

## 🐛 **Troubleshooting**

### **If you still get script errors:**

1. **Make sure you're in the root directory:**
   ```bash
   pwd  # Should show: C:\Users\arvin\OneDrive\Desktop\alumni-platform
   ```

2. **Reinstall dependencies:**
   ```bash
   npm run install-all
   ```

3. **Check if scripts exist:**
   ```bash
   npm run  # Should show all available scripts
   ```

4. **If ports are in use:**
   ```bash
   # Check what's using the ports
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   
   # Kill processes if needed
   taskkill /PID <PID> /F
   ```

## 📋 **Verification Checklist**

- [ ] Running from root directory
- [ ] MongoDB is running
- [ ] Environment file created
- [ ] Dependencies installed
- [ ] Database seeded
- [ ] Both servers started with `npm run dev-full`
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check passes
- [ ] Can login with test credentials

## 🎉 **Success!**

When everything is working correctly:
- ✅ Frontend loads without errors
- ✅ Backend responds to health check
- ✅ Can login with admin credentials
- ✅ All navigation works
- ✅ No script errors

---

## 📞 **Need Help?**

If you still encounter issues:

1. **Check the directory you're in**
2. **Verify all prerequisites are installed**
3. **Make sure MongoDB is running**
4. **Check the environment file exists**
5. **Run `npm run install-all` again**

**Remember: Always run commands from the root directory!** 🚀 