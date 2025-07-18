'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FoodItem, CreateOrderRequest } from '../../../shared/types';
import { apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (foodItem: FoodItem, quantity: number) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  checkout: () => Promise<void>;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse saved cart:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);

  const addItem = (foodItem: FoodItem, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.foodItem.id === foodItem.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > foodItem.remainingCount) {
          toast.error(`Only ${foodItem.remainingCount} items available`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.foodItem.id === foodItem.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > foodItem.remainingCount) {
          toast.error(`Only ${foodItem.remainingCount} items available`);
          return prevItems;
        }
        
        return [...prevItems, { foodItem, quantity }];
      }
    });

    toast.success(`Added ${quantity} ${foodItem.name} to cart`);
  };

  const removeItem = (foodItemId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.foodItem.id === foodItemId);
      if (item) {
        toast.success(`Removed ${item.foodItem.name} from cart`);
      }
      return prevItems.filter(item => item.foodItem.id !== foodItemId);
    });
  };

  const updateQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodItemId);
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.foodItem.id === foodItemId) {
          if (quantity > item.foodItem.remainingCount) {
            toast.error(`Only ${item.foodItem.remainingCount} items available`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.foodItem.price * item.quantity), 0);
  };

  const checkout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);

    try {
      const orderRequest: CreateOrderRequest = {
        items: items.map(item => ({
          foodItemId: item.foodItem.id,
          quantity: item.quantity
        }))
      };

      const response = await apiClient.createOrder(orderRequest);
      
      if (response.success && response.data) {
        clearCart();
        toast.success('Order placed successfully!');
        
        // Redirect to orders page to show the new order
        if (typeof window !== 'undefined') {
          window.location.href = '/orders';
        }
      } else {
        throw new Error(response.error || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
    checkout,
    isCheckingOut,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
