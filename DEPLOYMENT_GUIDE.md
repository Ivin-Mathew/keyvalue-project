# College Canteen Management System - Deployment Guide

## 🚀 Production Deployment Guide

This guide covers deploying the College Canteen Management System to production environments.

## 📋 Pre-deployment Checklist

### Environment Setup
- [ ] Firebase project created and configured
- [ ] Production database setup with security rules
- [ ] Environment variables prepared for production
- [ ] SSL certificates ready (handled by hosting platforms)
- [ ] Domain names configured (optional)

### Code Preparation
- [ ] All features tested locally
- [ ] Production build tested
- [ ] Environment variables updated for production
- [ ] Security configurations reviewed
- [ ] Performance optimizations applied

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `college-canteen-prod`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select database location (choose closest to your users)

### 3. Setup Authentication (Optional)
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Enable "Email/Password" provider
4. Configure authorized domains for production

### 4. Create Service Account
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract credentials for environment variables

### 5. Deploy Security Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

## 🖥️ Backend Deployment (Railway)

### 1. Prepare Backend for Deployment
```bash
cd backend

# Create production build
npm run build

# Test production build locally
npm start
```

### 2. Deploy to Railway
1. Go to [Railway](https://railway.app/)
2. Sign up/Login with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Choose the backend folder as root directory

### 3. Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_for_production
JWT_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.vercel.app
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 4. Configure Build Settings
In Railway dashboard:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `/backend`

### 5. Deploy
Railway will automatically deploy when you push to your main branch.

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment
```bash
cd frontend

# Install dependencies
npm install

# Create production build
npm run build

# Test production build locally
npm start
```

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.railway.app

# Firebase Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# App Configuration
NEXT_PUBLIC_APP_NAME=College Canteen Management System
```

### 4. Deploy
Vercel will automatically deploy when you push to your main branch.

## 🔧 Alternative Deployment Options

### Backend Alternatives

#### Render
1. Go to [Render](https://render.com/)
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

#### Heroku
1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create your-canteen-backend
heroku config:set NODE_ENV=production
# Add other environment variables
git subtree push --prefix backend heroku main
```

### Frontend Alternatives

#### Netlify
1. Go to [Netlify](https://netlify.com/)
2. Connect GitHub repository
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`

#### GitHub Pages (Static Export)
```bash
# Add to next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

## 🔒 Production Security Checklist

### Backend Security
- [ ] JWT secret is strong and unique
- [ ] CORS origins are restricted to frontend domain
- [ ] Rate limiting implemented (optional)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS enforced
- [ ] Security headers configured

### Frontend Security
- [ ] Environment variables properly prefixed with NEXT_PUBLIC_
- [ ] No sensitive data in client-side code
- [ ] CSP headers configured (optional)
- [ ] XSS protection enabled
- [ ] HTTPS enforced

### Database Security
- [ ] Firestore security rules properly configured
- [ ] Service account permissions minimized
- [ ] Database backups enabled
- [ ] Access logs monitored

## 📊 Production Monitoring

### Application Monitoring
1. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Set up alerts for critical errors
   - Monitor API response times

2. **Performance Monitoring**
   - Use Vercel Analytics for frontend
   - Monitor Railway metrics for backend
   - Set up uptime monitoring

3. **User Analytics**
   - Google Analytics for user behavior
   - Monitor conversion rates
   - Track feature usage

### Database Monitoring
1. **Firestore Monitoring**
   - Monitor read/write operations
   - Track database size and costs
   - Set up billing alerts

2. **Performance Metrics**
   - Query performance monitoring
   - Real-time connection monitoring
   - Error rate tracking

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      # Test backend
      - name: Test Backend
        run: |
          cd backend
          npm install
          npm test
      
      # Test frontend
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        # Railway auto-deploys on push
        run: echo "Backend deployed to Railway"
      
      - name: Deploy to Vercel
        # Vercel auto-deploys on push
        run: echo "Frontend deployed to Vercel"
```

## 🚀 Post-Deployment Steps

### 1. Verify Deployment
- [ ] Check all URLs are accessible
- [ ] Test user registration and login
- [ ] Verify admin dashboard functionality
- [ ] Test order placement and QR code generation
- [ ] Confirm real-time updates work
- [ ] Test mobile responsiveness

### 2. Setup Monitoring
- [ ] Configure uptime monitoring
- [ ] Set up error tracking
- [ ] Enable performance monitoring
- [ ] Configure backup schedules

### 3. Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create user guides
- [ ] Set up support channels

### 4. Launch Preparation
- [ ] Create admin accounts
- [ ] Add initial food items
- [ ] Test with real users
- [ ] Prepare launch announcement
- [ ] Set up user support

## 🔧 Troubleshooting Production Issues

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names and values
   - Verify Firebase credentials format

3. **CORS Errors**
   - Update FRONTEND_URL in backend environment
   - Check CORS configuration in backend
   - Verify domain names are correct

4. **Database Connection Issues**
   - Verify Firebase project ID
   - Check service account permissions
   - Ensure Firestore is enabled

### Performance Issues

1. **Slow API Responses**
   - Check database query performance
   - Monitor server resources
   - Optimize database indexes

2. **Frontend Loading Issues**
   - Optimize images and assets
   - Enable CDN caching
   - Minimize bundle size

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Monitor application performance
- [ ] Update dependencies regularly
- [ ] Review security logs
- [ ] Backup database regularly
- [ ] Monitor costs and usage

### Scaling Considerations
- [ ] Monitor user growth
- [ ] Plan for increased traffic
- [ ] Consider database scaling
- [ ] Optimize for performance

The College Canteen Management System is now ready for production deployment! 🎉
