# College Canteen Management System - Testing Guide

## 🧪 Comprehensive Testing Guide

This guide provides detailed instructions for testing all features of the College Canteen Management System.

## 🚀 Quick Start Testing

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👥 Test Accounts

### Admin Account
- **Email**: admin@canteen.com
- **Password**: admin123
- **Permissions**: Full access to admin dashboard, food management, order management

### Regular User Account
- **Email**: user@canteen.com
- **Password**: user123
- **Permissions**: Menu browsing, order placement, order history

## 🔍 Feature Testing Checklist

### ✅ Authentication System

#### Registration Testing
1. **Navigate to Registration**
   - Go to http://localhost:3000/register
   - Verify responsive design on different screen sizes

2. **Form Validation**
   - [ ] Try submitting empty form - should show validation errors
   - [ ] Enter invalid email format - should show email validation error
   - [ ] Enter password less than 6 characters - should show password length error
   - [ ] Enter mismatched passwords - should show password mismatch error
   - [ ] Enter valid data - should create account and redirect to menu

3. **Success Flow**
   - [ ] Register with new email
   - [ ] Verify automatic login after registration
   - [ ] Check that user appears in navbar
   - [ ] Verify redirect to menu page

#### Login Testing
1. **Navigate to Login**
   - Go to http://localhost:3000/login
   - Test both regular login and demo account buttons

2. **Form Validation**
   - [ ] Try submitting empty form - should show validation errors
   - [ ] Enter invalid credentials - should show error message
   - [ ] Enter valid credentials - should login successfully

3. **Demo Accounts**
   - [ ] Click "Demo User" button - should login as regular user
   - [ ] Click "Demo Admin" button - should login as admin
   - [ ] Verify different navigation options for each role

### ✅ Menu and Food Items

#### Menu Browsing
1. **Navigate to Menu**
   - Go to http://localhost:3000/menu
   - Should work for both authenticated and non-authenticated users

2. **Food Item Display**
   - [ ] Verify all food items are displayed in cards
   - [ ] Check that images load correctly (or show placeholder)
   - [ ] Verify price formatting (₹ symbol)
   - [ ] Check category badges are displayed
   - [ ] Verify stock status badges (Available, Low Stock, Out of Stock)

3. **Filtering and Search**
   - [ ] Test search functionality with food item names
   - [ ] Test category filtering dropdown
   - [ ] Test "Available Only" filter
   - [ ] Test combination of filters
   - [ ] Verify results count updates correctly

4. **Real-time Updates**
   - [ ] Open menu in two browser windows
   - [ ] Place an order in one window
   - [ ] Verify food count updates in real-time in the other window
   - [ ] Check that out-of-stock items update immediately

#### Cart Functionality
1. **Adding Items to Cart**
   - [ ] Login as user
   - [ ] Add items to cart using + and - buttons
   - [ ] Verify quantity limits based on remaining stock
   - [ ] Check cart counter in navbar updates
   - [ ] Verify cart summary appears on menu page

2. **Cart Management**
   - [ ] Test quantity adjustments
   - [ ] Verify total amount calculations
   - [ ] Test cart persistence across page refreshes
   - [ ] Check cart clears when logging out

3. **Checkout Process**
   - [ ] Add items to cart
   - [ ] Click checkout button
   - [ ] Verify order creation and redirect to orders page
   - [ ] Check that cart is cleared after successful order

### ✅ Order Management

#### User Order Flow
1. **Placing Orders**
   - [ ] Login as user
   - [ ] Add multiple items to cart
   - [ ] Complete checkout process
   - [ ] Verify order appears in orders page
   - [ ] Check QR code is generated

2. **Order History**
   - [ ] Navigate to http://localhost:3000/orders
   - [ ] Verify all user orders are displayed
   - [ ] Test status filtering (All, Pending, Fulfilled, Cancelled)
   - [ ] Check order details are complete
   - [ ] Verify QR code display for pending orders

3. **QR Code Features**
   - [ ] Verify QR code generation for new orders
   - [ ] Test QR code copy functionality
   - [ ] Test QR code download feature
   - [ ] Check QR code contains correct order information

#### Admin Order Management
1. **Admin Dashboard Access**
   - [ ] Login as admin
   - [ ] Navigate to http://localhost:3000/admin
   - [ ] Verify access denied for non-admin users

2. **Dashboard Overview**
   - [ ] Check statistics cards display correct data
   - [ ] Verify low stock and out of stock alerts
   - [ ] Test recent orders display
   - [ ] Check real-time updates when new orders arrive

3. **Order Management**
   - [ ] View all orders in Orders tab
   - [ ] Test order status updates (Fulfill/Cancel)
   - [ ] Verify real-time notifications for new orders
   - [ ] Check order filtering and search

4. **QR Code Scanning**
   - [ ] Navigate to QR Scanner tab
   - [ ] Test camera permission request
   - [ ] Scan a valid order QR code
   - [ ] Verify order fulfillment process
   - [ ] Test invalid QR code handling

### ✅ Real-time Features

#### Socket.io Connection
1. **Connection Testing**
   - [ ] Open browser developer tools
   - [ ] Check console for Socket.io connection messages
   - [ ] Verify no connection errors

2. **Real-time Order Updates**
   - [ ] Open admin dashboard in one window
   - [ ] Place order as user in another window
   - [ ] Verify order appears instantly in admin dashboard
   - [ ] Check notification toast appears

3. **Real-time Food Count Updates**
   - [ ] Open menu in multiple windows
   - [ ] Place order in one window
   - [ ] Verify food counts update in all windows
   - [ ] Check stock status changes in real-time

4. **Order Status Updates**
   - [ ] Have pending order as user
   - [ ] Admin fulfills order
   - [ ] Verify user receives real-time notification
   - [ ] Check order status updates immediately

### ✅ Responsive Design

#### Mobile Testing
1. **Navigation**
   - [ ] Test mobile menu toggle
   - [ ] Verify all navigation links work
   - [ ] Check cart counter visibility

2. **Forms**
   - [ ] Test login/register forms on mobile
   - [ ] Verify form validation on small screens
   - [ ] Check button accessibility

3. **Content Layout**
   - [ ] Test food item grid on mobile
   - [ ] Verify order cards are readable
   - [ ] Check admin dashboard on mobile

#### Desktop Testing
1. **Layout**
   - [ ] Test on different desktop resolutions
   - [ ] Verify sidebar navigation
   - [ ] Check responsive grid layouts

2. **Interactions**
   - [ ] Test hover effects
   - [ ] Verify keyboard navigation
   - [ ] Check focus states

### ✅ Error Handling

#### Network Errors
1. **API Failures**
   - [ ] Stop backend server
   - [ ] Try to place order - should show error message
   - [ ] Restart server and verify recovery

2. **Invalid Data**
   - [ ] Try to order more items than available
   - [ ] Test with invalid QR codes
   - [ ] Verify appropriate error messages

#### User Experience
1. **Loading States**
   - [ ] Verify loading spinners appear during API calls
   - [ ] Check button disabled states during processing
   - [ ] Test skeleton loading for data fetching

2. **Success Feedback**
   - [ ] Verify success toasts for completed actions
   - [ ] Check confirmation messages
   - [ ] Test progress indicators

### ✅ Security Testing

#### Authentication
1. **Protected Routes**
   - [ ] Try accessing /admin without login - should redirect
   - [ ] Try accessing /orders without login - should show login prompt
   - [ ] Verify JWT token expiration handling

2. **Authorization**
   - [ ] Login as regular user
   - [ ] Try to access admin endpoints directly
   - [ ] Verify proper error responses

#### Data Validation
1. **Input Sanitization**
   - [ ] Test XSS prevention in form inputs
   - [ ] Verify SQL injection protection
   - [ ] Check file upload restrictions (if any)

2. **API Security**
   - [ ] Test CORS headers
   - [ ] Verify rate limiting (if implemented)
   - [ ] Check authentication headers

## 🐛 Common Issues and Solutions

### Backend Issues
1. **Firebase Connection Error**
   - Check environment variables in `.env`
   - Verify Firebase service account credentials
   - Ensure Firestore is enabled

2. **Port Already in Use**
   - Kill process: `npx kill-port 5000`
   - Or change PORT in `.env`

3. **Socket.io Connection Failed**
   - Check CORS settings
   - Verify frontend SOCKET_URL matches backend

### Frontend Issues
1. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

2. **Styling Issues**
   - Verify Tailwind CSS is working
   - Check shadcn/ui component imports

3. **Real-time Updates Not Working**
   - Check browser console for Socket.io errors
   - Verify network connectivity
   - Test with browser refresh

## 📊 Performance Testing

### Load Testing
1. **Multiple Users**
   - Open multiple browser windows
   - Simulate concurrent orders
   - Monitor server performance

2. **Database Performance**
   - Test with large number of orders
   - Verify query performance
   - Check real-time update latency

### Browser Performance
1. **Memory Usage**
   - Monitor browser memory consumption
   - Check for memory leaks
   - Test long-running sessions

2. **Network Usage**
   - Monitor API call frequency
   - Check payload sizes
   - Verify efficient data fetching

## ✅ Test Completion Checklist

- [ ] All authentication flows tested
- [ ] Menu browsing and filtering works
- [ ] Cart functionality complete
- [ ] Order placement and management tested
- [ ] Admin dashboard fully functional
- [ ] QR code generation and scanning works
- [ ] Real-time updates functioning
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Security measures validated
- [ ] Performance acceptable

## 🎯 Success Criteria

The system passes testing when:
1. All user flows work without errors
2. Real-time features update correctly
3. QR code system functions properly
4. Admin dashboard provides full control
5. Mobile experience is smooth
6. Error handling is graceful
7. Security measures are effective

## 📞 Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser and device information
4. Console error messages
5. Screenshots if applicable

The College Canteen Management System is ready for production when all tests pass successfully!
