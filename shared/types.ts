// Shared type definitions for the College Canteen Management System

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  totalCount: number;
  remainingCount: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  qrCode: string;
  createdAt: Date;
  fulfilledAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrderRequest {
  items: Array<{
    foodItemId: string;
    quantity: number;
  }>;
}

export interface UpdateFoodItemRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  totalCount?: number;
  remainingCount?: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

// Socket.io event types
export interface SocketEvents {
  // Client to Server
  'join-room': (room: string) => void;
  'leave-room': (room: string) => void;
  
  // Server to Client
  'food-count-updated': (data: { foodItemId: string; remainingCount: number }) => void;
  'new-order': (order: Order) => void;
  'order-fulfilled': (orderId: string) => void;
  'food-item-updated': (foodItem: FoodItem) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

// Food categories
export type FoodCategory = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'beverages'
  | 'desserts';

// Order status types
export type OrderStatus = 'pending' | 'fulfilled' | 'cancelled';

// User roles
export type UserRole = 'user' | 'admin';

// QR Code data structure
export interface QRCodeData {
  orderId: string;
  timestamp: number;
  hash: string;
}
