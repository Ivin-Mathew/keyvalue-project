import { Request, Response } from 'express';
import { collections, firestoreHelpers } from '../services/firebase';
import { socketEmitters } from '../services/socket';
import { FoodItem, UpdateFoodItemRequest } from '../../../shared/types';

export const getAllFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, available } = req.query;
    
    let query = collections.foodItems().orderBy('createdAt', 'desc');
    
    // Filter by category if provided
    if (category && typeof category === 'string') {
      query = query.where('category', '==', category);
    }
    
    // Filter by availability if provided
    if (available !== undefined) {
      const isAvailable = available === 'true';
      query = query.where('isAvailable', '==', isAvailable);
    }

    const snapshot = await query.get();
    
    const foodItems: FoodItem[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        totalCount: data.totalCount,
        remainingCount: data.remainingCount,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });

    res.status(200).json({
      success: true,
      data: foodItems,
      message: 'Food items retrieved successfully'
    });

  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve food items'
    });
  }
};

export const getFoodItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await collections.foodItems().doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    const data = doc.data()!;
    const foodItem: FoodItem = {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      totalCount: data.totalCount,
      remainingCount: data.remainingCount,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };

    res.status(200).json({
      success: true,
      data: foodItem,
      message: 'Food item retrieved successfully'
    });

  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve food item'
    });
  }
};

export const createFoodItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      totalCount,
      imageUrl
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || totalCount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, description, price, category, and totalCount'
      });
    }

    if (price <= 0 || totalCount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be positive and totalCount must be non-negative'
      });
    }

    const foodItemRef = collections.foodItems().doc();
    const now = firestoreHelpers.now();
    
    const foodItemData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.toLowerCase(),
      totalCount: Number(totalCount),
      remainingCount: Number(totalCount),
      imageUrl: imageUrl || null,
      isAvailable: Number(totalCount) > 0,
      createdAt: now,
      updatedAt: now
    };

    await foodItemRef.set(foodItemData);

    const foodItem: FoodItem = {
      id: foodItemRef.id,
      ...foodItemData,
      createdAt: now.toDate(),
      updatedAt: now.toDate()
    };

    // Emit real-time update
    socketEmitters.emitFoodItemUpdate(foodItem);

    res.status(201).json({
      success: true,
      data: foodItem,
      message: 'Food item created successfully'
    });

  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create food item'
    });
  }
};

export const updateFoodItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateFoodItemRequest = req.body;

    const foodItemRef = collections.foodItems().doc(id);
    const doc = await foodItemRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: firestoreHelpers.now()
    };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.description !== undefined) updateData.description = updates.description.trim();
    if (updates.price !== undefined) {
      if (updates.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be positive'
        });
      }
      updateData.price = Number(updates.price);
    }
    if (updates.category !== undefined) updateData.category = updates.category.toLowerCase();
    if (updates.totalCount !== undefined) {
      if (updates.totalCount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Total count must be non-negative'
        });
      }
      updateData.totalCount = Number(updates.totalCount);
    }
    if (updates.remainingCount !== undefined) {
      if (updates.remainingCount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Remaining count must be non-negative'
        });
      }
      updateData.remainingCount = Number(updates.remainingCount);
      updateData.isAvailable = Number(updates.remainingCount) > 0;
    }
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    if (updates.isAvailable !== undefined) updateData.isAvailable = updates.isAvailable;

    await foodItemRef.update(updateData);

    // Get updated document
    const updatedDoc = await foodItemRef.get();
    const updatedData = updatedDoc.data()!;
    
    const foodItem: FoodItem = {
      id: updatedDoc.id,
      name: updatedData.name,
      description: updatedData.description,
      price: updatedData.price,
      category: updatedData.category,
      totalCount: updatedData.totalCount,
      remainingCount: updatedData.remainingCount,
      imageUrl: updatedData.imageUrl,
      isAvailable: updatedData.isAvailable,
      createdAt: updatedData.createdAt.toDate(),
      updatedAt: updatedData.updatedAt.toDate()
    };

    // Emit real-time updates
    socketEmitters.emitFoodItemUpdate(foodItem);
    if (updates.remainingCount !== undefined) {
      socketEmitters.emitFoodCountUpdate(id, updates.remainingCount);
    }

    res.status(200).json({
      success: true,
      data: foodItem,
      message: 'Food item updated successfully'
    });

  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update food item'
    });
  }
};

export const deleteFoodItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const foodItemRef = collections.foodItems().doc(id);
    const doc = await foodItemRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    await foodItemRef.delete();

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });

  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete food item'
    });
  }
};

export const getFoodCategories = async (req: Request, res: Response) => {
  try {
    const snapshot = await collections.foodItems()
      .select('category')
      .get();

    const categories = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(categories).sort(),
      message: 'Food categories retrieved successfully'
    });

  } catch (error) {
    console.error('Get food categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve food categories'
    });
  }
};
