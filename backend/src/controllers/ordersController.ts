import { Request, Response } from 'express';
import crypto from 'crypto';
import { collections, firestoreHelpers } from '../services/firebase';
import { socketEmitters } from '../services/socket';
import { Order, OrderItem, CreateOrderRequest } from '../../../shared/types';

// Helper function to generate QR code data
const generateQRCodeData = (orderId: string) => {
  const timestamp = Date.now();
  const data = `${orderId}:${timestamp}`;
  const hash = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'qrcode-secret')
    .update(data)
    .digest('hex');

  return `${orderId}:${timestamp}:${hash}`;
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;
    
    let query = collections.orders().orderBy('createdAt', 'desc');
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      query = query.where('status', '==', status);
    }
    
    // Filter by userId if provided
    if (userId && typeof userId === 'string') {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    
    const orders: Order[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        items: data.items,
        totalAmount: data.totalAmount,
        status: data.status,
        qrCode: data.qrCode,
        createdAt: data.createdAt.toDate(),
        fulfilledAt: data.fulfilledAt ? data.fulfilledAt.toDate() : undefined
      };
    });

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders'
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await collections.orders().doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const data = doc.data()!;
    const order: Order = {
      id: doc.id,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      items: data.items,
      totalAmount: data.totalAmount,
      status: data.status,
      qrCode: data.qrCode,
      createdAt: data.createdAt.toDate(),
      fulfilledAt: data.fulfilledAt ? data.fulfilledAt.toDate() : undefined
    };

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order'
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items }: CreateOrderRequest = req.body;
    const user = req.user!;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one item'
      });
    }

    // Get food items from database
    const foodItemIds = items.map(item => item.foodItemId);
    const foodItemsSnapshot = await collections.foodItems()
      .where('id', 'in', foodItemIds)
      .get();

    if (foodItemsSnapshot.empty || foodItemsSnapshot.docs.length !== foodItemIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more food items not found'
      });
    }

    // Map food items by ID for easy access
    const foodItemsMap = new Map();
    foodItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      foodItemsMap.set(doc.id, {
        id: doc.id,
        name: data.name,
        price: data.price,
        remainingCount: data.remainingCount
      });
    });

    // Check if all items are available in sufficient quantity
    const unavailableItems = [];
    for (const item of items) {
      const foodItem = foodItemsMap.get(item.foodItemId);
      if (!foodItem) {
        unavailableItems.push(item.foodItemId);
        continue;
      }

      if (foodItem.remainingCount < item.quantity) {
        unavailableItems.push(foodItem.name);
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: `The following items are not available in sufficient quantity: ${unavailableItems.join(', ')}`
      });
    }

    // Prepare order items
    const orderItems: OrderItem[] = items.map(item => {
      const foodItem = foodItemsMap.get(item.foodItemId);
      return {
        foodItemId: item.foodItemId,
        foodItemName: foodItem.name,
        quantity: item.quantity,
        price: foodItem.price,
        totalPrice: foodItem.price * item.quantity
      };
    });

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Generate QR code
    const orderRef = collections.orders().doc();
    const qrCode = generateQRCodeData(orderRef.id);

    // Create order
    const orderData = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: orderItems,
      totalAmount,
      status: 'pending' as const,
      qrCode,
      createdAt: firestoreHelpers.now(),
      fulfilledAt: null
    };

    // Use a transaction to update food item counts and create order
    await firestoreHelpers.runTransaction(async transaction => {
      // Update food item counts
      for (const item of items) {
        const foodItemRef = collections.foodItems().doc(item.foodItemId);
        const foodItemDoc = await transaction.get(foodItemRef);
        
        if (!foodItemDoc.exists) {
          throw new Error(`Food item ${item.foodItemId} not found`);
        }
        
        const foodItemData = foodItemDoc.data()!;
        const newRemainingCount = foodItemData.remainingCount - item.quantity;
        
        if (newRemainingCount < 0) {
          throw new Error(`Not enough ${foodItemData.name} available`);
        }
        
        transaction.update(foodItemRef, {
          remainingCount: newRemainingCount,
          isAvailable: newRemainingCount > 0,
          updatedAt: firestoreHelpers.now()
        });

        // Emit food count update
        socketEmitters.emitFoodCountUpdate(item.foodItemId, newRemainingCount);
      }

      // Create order
      transaction.set(orderRef, orderData);
    });

    // Prepare response
    const order: Order = {
      id: orderRef.id,
      ...orderData,
      createdAt: orderData.createdAt.toDate(),
      fulfilledAt: undefined
    };

    // Emit new order event
    socketEmitters.emitNewOrder(order);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status: pending, fulfilled, or cancelled'
      });
    }

    const orderRef = collections.orders().doc(id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const orderData = doc.data()!;

    // If order is already in the requested status
    if (orderData.status === status) {
      return res.status(400).json({
        success: false,
        error: `Order is already ${status}`
      });
    }

    // Update data
    const updateData: any = {
      status
    };

    // If fulfilling the order, set fulfilledAt
    if (status === 'fulfilled') {
      updateData.fulfilledAt = firestoreHelpers.now();
    }

    await orderRef.update(updateData);

    // If cancelling an order, restore food item counts
    if (status === 'cancelled' && orderData.status === 'pending') {
      // Use a transaction to update food item counts
      await firestoreHelpers.runTransaction(async transaction => {
        for (const item of orderData.items) {
          const foodItemRef = collections.foodItems().doc(item.foodItemId);
          const foodItemDoc = await transaction.get(foodItemRef);
          
          if (foodItemDoc.exists) {
            const foodItemData = foodItemDoc.data()!;
            const newRemainingCount = foodItemData.remainingCount + item.quantity;
            
            transaction.update(foodItemRef, {
              remainingCount: newRemainingCount,
              isAvailable: true,
              updatedAt: firestoreHelpers.now()
            });

            // Emit food count update
            socketEmitters.emitFoodCountUpdate(item.foodItemId, newRemainingCount);
          }
        }
      });
    }

    // Get updated order
    const updatedDoc = await orderRef.get();
    const updatedData = updatedDoc.data()!;
    
    const order: Order = {
      id: updatedDoc.id,
      userId: updatedData.userId,
      userName: updatedData.userName,
      userEmail: updatedData.userEmail,
      items: updatedData.items,
      totalAmount: updatedData.totalAmount,
      status: updatedData.status,
      qrCode: updatedData.qrCode,
      createdAt: updatedData.createdAt.toDate(),
      fulfilledAt: updatedData.fulfilledAt ? updatedData.fulfilledAt.toDate() : undefined
    };

    // Emit order fulfilled event
    if (status === 'fulfilled') {
      socketEmitters.emitOrderFulfilled(id);
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order ${status} successfully`
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
};

export const verifyQRCode = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a QR code'
      });
    }

    // Parse QR code
    const [orderId, timestamp, hash] = qrCode.split(':');

    if (!orderId || !timestamp || !hash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code format'
      });
    }

    // Verify hash
    const data = `${orderId}:${timestamp}`;
    const expectedHash = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'qrcode-secret')
      .update(data)
      .digest('hex');

    if (hash !== expectedHash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code signature'
      });
    }

    // Get order
    const orderRef = collections.orders().doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const orderData = doc.data()!;

    // Check if order is already fulfilled
    if (orderData.status === 'fulfilled') {
      return res.status(400).json({
        success: false,
        error: 'Order has already been fulfilled'
      });
    }

    // Check if order is cancelled
    if (orderData.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order has been cancelled'
      });
    }

    // Mark order as fulfilled
    const now = firestoreHelpers.now();
    await orderRef.update({
      status: 'fulfilled',
      fulfilledAt: now
    });

    // Emit order fulfilled event
    socketEmitters.emitOrderFulfilled(orderId);

    const order: Order = {
      id: doc.id,
      userId: orderData.userId,
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'fulfilled',
      qrCode: orderData.qrCode,
      createdAt: orderData.createdAt.toDate(),
      fulfilledAt: now.toDate()
    };

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order verified and fulfilled successfully'
    });

  } catch (error) {
    console.error('Verify QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify QR code'
    });
  }
};
