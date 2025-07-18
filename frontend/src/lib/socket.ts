import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../../../shared/types';

class SocketManager {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Room management
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
      console.log(`📡 Joined room: ${room}`);
    }
  }

  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
      console.log(`📡 Left room: ${room}`);
    }
  }

  // Event listeners
  onFoodCountUpdate(callback: (data: { foodItemId: string; remainingCount: number }) => void) {
    if (this.socket) {
      this.socket.on('food-count-updated', callback);
    }
  }

  onNewOrder(callback: (order: any) => void) {
    if (this.socket) {
      this.socket.on('new-order', callback);
    }
  }

  onOrderFulfilled(callback: (orderId: string) => void) {
    if (this.socket) {
      this.socket.on('order-fulfilled', callback);
    }
  }

  onFoodItemUpdate(callback: (foodItem: any) => void) {
    if (this.socket) {
      this.socket.on('food-item-updated', callback);
    }
  }

  // Remove event listeners
  offFoodCountUpdate(callback?: (data: { foodItemId: string; remainingCount: number }) => void) {
    if (this.socket) {
      this.socket.off('food-count-updated', callback);
    }
  }

  offNewOrder(callback?: (order: any) => void) {
    if (this.socket) {
      this.socket.off('new-order', callback);
    }
  }

  offOrderFulfilled(callback?: (orderId: string) => void) {
    if (this.socket) {
      this.socket.off('order-fulfilled', callback);
    }
  }

  offFoodItemUpdate(callback?: (foodItem: any) => void) {
    if (this.socket) {
      this.socket.off('food-item-updated', callback);
    }
  }
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const socketManager = new SocketManager(SOCKET_URL);
export default socketManager;
