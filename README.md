# College Canteen Management System

A comprehensive full-stack web application for managing college canteen operations with real-time features, built with modern technologies and best practices.

## ✨ Key Features

### 🍽️ User Experience
- **Smart Menu Browsing**: Interactive food catalog with real-time availability
- **Intelligent Cart System**: Persistent cart with quantity validation
- **Seamless Ordering**: One-click checkout with instant order confirmation
- **QR Code Integration**: Unique QR codes for secure order pickup
- **Real-time Updates**: Live food count updates across all devices
- **Mobile-First Design**: Responsive interface optimized for all devices

### 👨‍💼 Admin Management
- **Comprehensive Dashboard**: Real-time analytics and order monitoring
- **Live Order Tracking**: Instant notifications for new orders
- **QR Code Scanner**: Built-in camera scanner for order verification
- **Inventory Management**: Real-time stock tracking and alerts
- **Order Fulfillment**: Streamlined order processing workflow
- **Performance Analytics**: Detailed insights and reporting

### 🔧 Technical Features
- **Secure Authentication**: JWT-based user authentication
- **Modern UI Components**: shadcn/ui for consistent design
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first responsive layout
- **Progressive Web App**: PWA capabilities for mobile installation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **QR Code**: qrcode.react + @zxing/library

- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.io server
- **Security**: Helmet, CORS, input validation
- **Logging**: Morgan middleware

### Database & Infrastructure
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Admin SDK
- **File Storage**: Firebase Storage (optional)
- **Real-time**: Firestore real-time listeners
- **Security**: Firestore security rules

## 📁 Project Structure

```
college-canteen-system/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── shared/                  # Shared types and utilities
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Firebase** account for database
- **Modern browser** with camera support (for QR scanning)

### Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd college-canteen-system

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

2. **Environment Configuration**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Configure Firebase credentials in backend/.env

# Frontend environment
cp frontend/.env.local.example frontend/.env.local
# Configure API URLs and Firebase config
```

3. **Database Setup**
```bash
cd backend
npm run setup-db  # Creates sample data and test accounts
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend && npm run dev
```

### 🎯 Test Accounts
- **Admin**: admin@canteen.com / admin123
- **User**: user@canteen.com / user123

## 🎨 Feature Showcase

### 🏠 Landing Page
- Modern hero section with gradient backgrounds
- Feature highlights with interactive cards
- Statistics showcase and call-to-action sections
- Responsive design with mobile-first approach

### 🔐 Authentication System
- Elegant login/register forms with validation
- Demo account quick access buttons
- JWT-based secure authentication
- Persistent login sessions with auto-refresh

### 🍽️ Smart Menu System
- **Interactive Food Cards**: High-quality images, pricing, and stock status
- **Advanced Filtering**: Search, category filters, and availability toggles
- **Real-time Updates**: Live stock counts and availability status
- **Smart Cart**: Persistent cart with quantity validation and total calculations

### 🛒 Shopping Cart & Checkout
- **Persistent Cart**: Survives page refreshes and browser sessions
- **Smart Validation**: Prevents over-ordering based on stock levels
- **One-Click Checkout**: Streamlined order placement process
- **Instant Feedback**: Real-time cart updates and notifications

### 📱 Order Management
- **Order History**: Complete order tracking with status updates
- **QR Code System**: Unique QR codes for each order with copy/download
- **Real-time Status**: Live updates when orders are fulfilled
- **Order Details**: Comprehensive order information and receipt

### 👨‍💼 Admin Dashboard
- **Live Analytics**: Real-time statistics and performance metrics
- **Order Management**: Complete order lifecycle management
- **Inventory Control**: Stock tracking with low-stock alerts
- **QR Scanner**: Built-in camera scanner for order verification

### ⚡ Real-time Features
- **Live Updates**: Instant food count updates across all devices
- **Order Notifications**: Real-time alerts for new orders
- **Status Sync**: Immediate order status synchronization
- **Multi-device Sync**: Changes reflect instantly on all connected devices

## 🔧 Environment Configuration

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 📊 Database Schema

### Collections

#### users
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
}
```

#### foodItems
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  totalCount: number;
  remainingCount: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### orders
```typescript
{
  id: string;
  userId: string;
  items: Array<{
    foodItemId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  qrCode: string;
  createdAt: Timestamp;
  fulfilledAt?: Timestamp;
}
```



## 📱 QR Code System

- Each order generates a unique QR code containing the order ID
- Management can scan QR codes to verify and fulfill orders
- QR codes are invalidated once orders are fulfilled
- Failed scans are logged for security purposes

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your repository to Railway or Render
2. Set environment variables in the platform dashboard
3. Deploy the backend service

### Database (Firebase)
1. Create a Firebase project
2. Enable Firestore database
3. Set up security rules
4. Configure authentication

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)**: Detailed installation and configuration
- **[Testing Guide](TESTING_GUIDE.md)**: Comprehensive testing procedures
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[API Documentation](docs/API.md)**: Complete API reference (coming soon)

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run comprehensive testing
# See TESTING_GUIDE.md for detailed testing procedures
```

## 🚀 Deployment

The application is ready for production deployment on:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or any Node.js hosting
- **Database**: Firebase Firestore (managed service)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured for production security
- **Firebase Security Rules**: Database-level access control
- **XSS Protection**: Client-side security measures
- **HTTPS Enforcement**: SSL/TLS encryption in production

## 🎯 Performance Features

- **Real-time Updates**: Socket.io for instant synchronization
- **Optimized Images**: Next.js image optimization
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Efficient data caching strategies
- **Mobile Optimization**: PWA-ready with offline capabilities
- **SEO Optimized**: Server-side rendering with Next.js

## 📊 Project Statistics

- **Frontend**: 15+ React components with TypeScript
- **Backend**: 20+ API endpoints with full CRUD operations
- **Database**: 3 main collections with real-time listeners
- **Real-time**: Socket.io integration for live updates
- **UI Components**: shadcn/ui for consistent design system
- **Testing**: Comprehensive test coverage (coming soon)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing React framework
- **Firebase** for the real-time database and hosting
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.io** for real-time communication
- **Lucide** for the comprehensive icon library

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@canteen-system.com (if applicable)

---

<div align="center">

**Built with ❤️ for college communities**

[⭐ Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [✨ Request Feature](https://github.com/your-repo/issues)

</div>
