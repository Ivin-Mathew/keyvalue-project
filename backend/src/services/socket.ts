import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/types';

let io: Server;

export const setupSocketHandlers = (socketServer: Server) => {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle joining rooms
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`📡 Client ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      console.log(`📡 Client ${socket.id} left room: ${room}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io handlers setup complete');
};

// Helper functions to emit events
export const socketEmitters = {
  // Emit food count update to all clients
  emitFoodCountUpdate: (foodItemId: string, remainingCount: number) => {
    if (io) {
      io.emit('food-count-updated', { foodItemId, remainingCount });
      console.log(`📊 Emitted food count update: ${foodItemId} -> ${remainingCount}`);
    }
  },

  // Emit new order to management dashboard
  emitNewOrder: (order: any) => {
    if (io) {
      io.to('management').emit('new-order', order);
      console.log(`📋 Emitted new order: ${order.id}`);
    }
  },

  // Emit order fulfillment
  emitOrderFulfilled: (orderId: string) => {
    if (io) {
      io.emit('order-fulfilled', orderId);
      console.log(`✅ Emitted order fulfilled: ${orderId}`);
    }
  },

  // Emit food item update
  emitFoodItemUpdate: (foodItem: any) => {
    if (io) {
      io.emit('food-item-updated', foodItem);
      console.log(`🍽️ Emitted food item update: ${foodItem.id}`);
    }
  },

  // Emit to specific room
  emitToRoom: (room: string, event: string, data: any) => {
    if (io) {
      io.to(room).emit(event, data);
      console.log(`📡 Emitted to room ${room}: ${event}`);
    }
  },

  // Emit to all clients
  emitToAll: (event: string, data: any) => {
    if (io) {
      io.emit(event, data);
      console.log(`📡 Emitted to all clients: ${event}`);
    }
  },
};

export const getSocketServer = (): Server => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};
