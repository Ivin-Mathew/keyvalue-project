# College Canteen Management System - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the College Canteen Management System locally.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for database)

## 🔧 Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd college-canteen-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 3. Environment Configuration

#### Backend Environment (.env)
Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# CORS Configuration
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment (.env.local)
Create `frontend/.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

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

### 4. Database Setup

Run the database setup script to create sample data:

```bash
cd backend
npm run setup-db
```

This will create:
- Admin user: `admin@canteen.com` (password: `admin123`)
- Sample user: `user@canteen.com` (password: `user123`)
- Sample food items with different categories

### 5. Start the Application

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 👥 Test Accounts

### Admin Account
- **Email**: admin@canteen.com
- **Password**: admin123
- **Access**: Full admin dashboard, food management, order management

### User Account
- **Email**: user@canteen.com
- **Password**: user123
- **Access**: Menu browsing, order placement, order history

## 🧪 Testing the System

### 1. User Flow Testing
1. Register a new account or login with test credentials
2. Browse the menu at `/menu`
3. Add items to cart and place an order
4. View your orders at `/orders`
5. Check the QR code for your pending order

### 2. Admin Flow Testing
1. Login with admin credentials
2. Access admin dashboard at `/admin`
3. View live orders and manage food items
4. Use QR scanner to fulfill orders
5. Update food item counts and availability

### 3. Real-time Features Testing
1. Open multiple browser windows
2. Place an order in one window
3. Check that food counts update in real-time in other windows
4. Verify that new orders appear instantly in admin dashboard

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Food Items
- `GET /api/food-items` - Get all food items
- `GET /api/food-items/:id` - Get specific food item
- `POST /api/food-items` - Create food item (Admin)
- `PUT /api/food-items/:id` - Update food item (Admin)
- `DELETE /api/food-items/:id` - Delete food item (Admin)

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `POST /api/orders/verify-qr` - Verify QR code (Admin)

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify your Firebase credentials in `.env`
   - Ensure Firestore is enabled in Firebase Console
   - Check that service account has proper permissions

2. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check that both servers are running on correct ports

3. **Socket.io Connection Issues**
   - Ensure `NEXT_PUBLIC_SOCKET_URL` matches backend URL
   - Check browser console for connection errors

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run build`

### Logs and Debugging

- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser developer console
- Network requests: Use browser Network tab

## 📱 Mobile Testing

The application is responsive and works on mobile devices:
1. Test on different screen sizes
2. Verify QR code scanning works on mobile cameras
3. Check touch interactions and navigation

## 🚀 Production Deployment

### Backend (Railway/Render)
1. Connect your repository
2. Set environment variables
3. Deploy the backend service

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Database (Firebase)
1. Update security rules for production
2. Set up proper indexes
3. Configure authentication settings

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all environment variables are set correctly
4. Verify Firebase configuration and permissions

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Backend server running on port 5000
- ✅ Frontend application on port 3000
- ✅ Database connection established
- ✅ Real-time updates working
- ✅ QR code generation and scanning functional

You now have a fully functional College Canteen Management System!
