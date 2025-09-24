# Deployment Guide: Vercel + Render

This guide will help you deploy your Alumni Verse application using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas (recommended)

## Prerequisites

1. **MongoDB Atlas Account**: [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Vercel Account**: [vercel.com](https://vercel.com)
3. **Render Account**: [render.com](https://render.com)
4. **GitHub Repository**: Push your code to GitHub

## Step 1: Database Setup (MongoDB Atlas)

1. Create a new cluster on MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for now
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/alumni-platform`)

## Step 2: Backend Deployment (Render)

### Option A: Using Render Dashboard
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `alumni-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### Option B: Using render.yaml (Recommended)
1. Push the `backend/render.yaml` file to your repository
2. Go to Render dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect and use the `render.yaml` configuration

### Environment Variables (Backend)
Set these in Render dashboard → Environment tab:

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-platform
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
OPENAI_API_KEY=your-openai-api-key
```

**Important**: Update `FRONTEND_URL` with your actual Vercel domain after frontend deployment.

## Step 3: Frontend Deployment (Vercel)

### Option A: Using Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to your project root
3. Run `vercel`
4. Follow the prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Your account
   - **Link to existing project?** → No
   - **What's your project's name?** → alumni-verse-frontend
   - **In which directory is your code located?** → `./frontend`

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Environment Variables (Frontend)
Set these in Vercel dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.onrender.com
```

**Important**: Replace `your-backend-domain` with your actual Render backend URL.

## Step 4: Update CORS Settings

After both deployments are complete:

1. **Get your Vercel domain**: Your frontend will be available at `https://your-project-name.vercel.app`
2. **Get your Render domain**: Your backend will be available at `https://your-service-name.onrender.com`
3. **Update backend CORS**:
   - Go to Render dashboard → Your backend service → Environment
   - Update `FRONTEND_URL` to your Vercel domain
   - Or manually update the CORS origins in `backend/server.js`

## Step 5: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-backend-domain.onrender.com/api/health`
3. **Test API Connection**: Check browser console for any CORS errors

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Backend is deployed and accessible
- [ ] Frontend is deployed and accessible
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Health check endpoint returns 200
- [ ] User registration/login works
- [ ] File uploads work (if applicable)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly in backend environment variables
2. **Database Connection**: Verify MongoDB Atlas connection string and network access
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **Environment Variables**: Ensure all required variables are set in both Vercel and Render

### Logs and Debugging

- **Vercel Logs**: Dashboard → Your project → Functions tab
- **Render Logs**: Dashboard → Your service → Logs tab
- **MongoDB Atlas**: Check cluster logs and connection issues

## Production Considerations

1. **Security**: 
   - Use strong JWT secrets
   - Enable MongoDB Atlas authentication
   - Restrict IP addresses in MongoDB Atlas
   - Use environment variables for all secrets

2. **Performance**:
   - Enable MongoDB Atlas auto-scaling
   - Consider Render paid plans for better performance
   - Optimize images and static assets

3. **Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times
   - Set up uptime monitoring

## Cost Estimation

- **Vercel**: Free tier (good for most projects)
- **Render**: Free tier available (with limitations)
- **MongoDB Atlas**: Free tier available (512MB storage)

## Support

If you encounter issues:
1. Check the logs in both Vercel and Render dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check browser console for frontend errors

---

**Note**: Remember to update all localhost references in your codebase to use the production URLs after deployment.
