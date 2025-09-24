# Deployment Checklist

## Pre-Deployment Setup

### Database (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster
- [ ] Create database user
- [ ] Whitelist IP addresses (0.0.0.0/0 for initial setup)
- [ ] Get connection string
- [ ] Test connection locally

### Code Preparation
- [ ] Push all code to GitHub repository
- [ ] Verify all localhost references are updated
- [ ] Test application locally with production-like environment variables
- [ ] Ensure all dependencies are in package.json files

## Backend Deployment (Render)

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=<strong-secret>`
- [ ] `EMAIL_SERVICE=gmail`
- [ ] `EMAIL_USER=your-email@gmail.com`
- [ ] `EMAIL_PASS=your-app-password`
- [ ] `ADMIN_EMAIL=admin@yourdomain.com`
- [ ] `FRONTEND_URL=https://your-frontend.vercel.app` (update after frontend deployment)
- [ ] `OPENAI_API_KEY=your-openai-key` (if using AI features)
- [ ] `PAYTM_*` variables (if using payments)

### Deployment Steps
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `npm start`
- [ ] Set all environment variables
- [ ] Deploy and wait for success
- [ ] Test health endpoint: `https://your-service.onrender.com/api/health`

## Frontend Deployment (Vercel)

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
- [ ] `NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com`

### Deployment Steps
- [ ] Connect GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Set all environment variables
- [ ] Deploy and wait for success
- [ ] Test frontend URL

## Post-Deployment Configuration

### CORS Update
- [ ] Get Vercel frontend URL
- [ ] Update `FRONTEND_URL` in Render backend environment variables
- [ ] Restart backend service on Render
- [ ] Verify CORS is working (check browser console)

### Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API endpoints
- [ ] Test file uploads (if applicable)
- [ ] Test real-time features (Socket.io)
- [ ] Test email functionality
- [ ] Test payment integration (if applicable)

### Security
- [ ] Restrict MongoDB Atlas IP addresses to Render/Vercel IPs
- [ ] Verify all secrets are in environment variables
- [ ] Test that no sensitive data is exposed in frontend
- [ ] Enable HTTPS (should be automatic on both platforms)

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor API response times
- [ ] Check logs for any errors
- [ ] Set up uptime monitoring

## URLs to Update After Deployment

Replace these placeholders in your codebase:
- [ ] `https://your-frontend.vercel.app` → Your actual Vercel domain
- [ ] `https://your-backend.onrender.com` → Your actual Render domain
- [ ] Update any hardcoded URLs in documentation

## Final Verification

- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Database connection is stable
- [ ] All features work as expected
- [ ] No console errors in browser
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Rollback Plan

If deployment fails:
- [ ] Keep previous working version tagged in Git
- [ ] Have local development environment ready
- [ ] Document rollback steps for each service
- [ ] Test rollback procedure

---

**Important**: Save your deployment URLs and environment variable values in a secure location for future reference.
