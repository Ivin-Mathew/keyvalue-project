import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  verifyQRCode
} from '../controllers/ordersController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (admin) or user's orders
// @access  Private
router.get('/', authenticate, getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticate, getOrderById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticate, createOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

// @route   POST /api/orders/verify-qr
// @desc    Verify QR code and fulfill order
// @access  Private (Admin only)
router.post('/verify-qr', authenticate, authorize('admin'), verifyQRCode);

export default router;
