import express from 'express';
import {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getFoodCategories
} from '../controllers/foodItemsController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/food-items
// @desc    Get all food items
// @access  Public
router.get('/', getAllFoodItems);

// @route   GET /api/food-items/categories
// @desc    Get all food categories
// @access  Public
router.get('/categories', getFoodCategories);

// @route   GET /api/food-items/:id
// @desc    Get food item by ID
// @access  Public
router.get('/:id', getFoodItemById);

// @route   POST /api/food-items
// @desc    Create new food item
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), createFoodItem);

// @route   PUT /api/food-items/:id
// @desc    Update food item
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('admin'), updateFoodItem);

// @route   DELETE /api/food-items/:id
// @desc    Delete food item
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteFoodItem);

export default router;
