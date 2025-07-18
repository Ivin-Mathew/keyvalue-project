// Mock Firebase service for local testing without Firebase
import { User, FoodItem, Order } from '../../../shared/types';

// In-memory storage for local testing
let users: (User & { password: string })[] = [];
let foodItems: FoodItem[] = [];
let orders: Order[] = [];

// Mock Firestore-like interface
export const mockFirestore = {
  collection: (name: string) => ({
    doc: (id?: string) => ({
      id: id || generateId(),
      get: async () => {
        let data: any = null;
        let exists = false;

        if (name === 'users' && id) {
          data = users.find(u => u.id === id);
          exists = !!data;
        } else if (name === 'foodItems' && id) {
          data = foodItems.find(f => f.id === id);
          exists = !!data;
        } else if (name === 'orders' && id) {
          data = orders.find(o => o.id === id);
          exists = !!data;
        }

        return {
          exists,
          data: () => data,
          id
        };
      },
      set: async (data: any) => {
        const docId = id || generateId();
        
        if (name === 'users') {
          const existingIndex = users.findIndex(u => u.id === docId);
          if (existingIndex >= 0) {
            users[existingIndex] = { ...data, id: docId };
          } else {
            users.push({ ...data, id: docId });
          }
        } else if (name === 'foodItems') {
          const existingIndex = foodItems.findIndex(f => f.id === docId);
          if (existingIndex >= 0) {
            foodItems[existingIndex] = { ...data, id: docId };
          } else {
            foodItems.push({ ...data, id: docId });
          }
        } else if (name === 'orders') {
          const existingIndex = orders.findIndex(o => o.id === docId);
          if (existingIndex >= 0) {
            orders[existingIndex] = { ...data, id: docId };
          } else {
            orders.push({ ...data, id: docId });
          }
        }
        
        return { id: docId };
      },
      update: async (data: any) => {
        if (name === 'users' && id) {
          const index = users.findIndex(u => u.id === id);
          if (index >= 0) {
            users[index] = { ...users[index], ...data };
          }
        } else if (name === 'foodItems' && id) {
          const index = foodItems.findIndex(f => f.id === id);
          if (index >= 0) {
            foodItems[index] = { ...foodItems[index], ...data };
          }
        } else if (name === 'orders' && id) {
          const index = orders.findIndex(o => o.id === id);
          if (index >= 0) {
            orders[index] = { ...orders[index], ...data };
          }
        }
      },
      delete: async () => {
        if (name === 'users' && id) {
          users = users.filter(u => u.id !== id);
        } else if (name === 'foodItems' && id) {
          foodItems = foodItems.filter(f => f.id !== id);
        } else if (name === 'orders' && id) {
          orders = orders.filter(o => o.id !== id);
        }
      }
    }),
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        let docs: any[] = [];
        
        if (name === 'users') {
          docs = users.filter(u => {
            if (operator === '==') return (u as any)[field] === value;
            return false;
          }).map(u => ({ id: u.id, data: () => u }));
        } else if (name === 'foodItems') {
          docs = foodItems.filter(f => {
            if (operator === '==') return (f as any)[field] === value;
            return false;
          }).map(f => ({ id: f.id, data: () => f }));
        } else if (name === 'orders') {
          docs = orders.filter(o => {
            if (operator === '==') return (o as any)[field] === value;
            return false;
          }).map(o => ({ id: o.id, data: () => o }));
        }

        return {
          empty: docs.length === 0,
          docs
        };
      }
    }),
    orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
      get: async () => {
        let docs: any[] = [];
        
        if (name === 'users') {
          docs = [...users].sort((a, b) => {
            const aVal = (a as any)[field];
            const bVal = (b as any)[field];
            return direction === 'asc' ? 
              (aVal > bVal ? 1 : -1) : 
              (aVal < bVal ? 1 : -1);
          }).map(u => ({ id: u.id, data: () => u }));
        } else if (name === 'foodItems') {
          docs = [...foodItems].sort((a, b) => {
            const aVal = (a as any)[field];
            const bVal = (b as any)[field];
            return direction === 'asc' ? 
              (aVal > bVal ? 1 : -1) : 
              (aVal < bVal ? 1 : -1);
          }).map(f => ({ id: f.id, data: () => f }));
        } else if (name === 'orders') {
          docs = [...orders].sort((a, b) => {
            const aVal = (a as any)[field];
            const bVal = (b as any)[field];
            return direction === 'asc' ? 
              (aVal > bVal ? 1 : -1) : 
              (aVal < bVal ? 1 : -1);
          }).map(o => ({ id: o.id, data: () => o }));
        }

        return { docs };
      }
    })
  })
};

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const initializeMockFirebase = () => {
  console.log('✅ Mock Firebase initialized for local testing');
  
  // Add sample data
  const sampleFoodItems: FoodItem[] = [
    {
      id: 'food1',
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice with tender chicken pieces',
      price: 120,
      category: 'lunch',
      totalCount: 50,
      remainingCount: 50,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'food2',
      name: 'Vegetable Sandwich',
      description: 'Fresh vegetables with cheese and mayo',
      price: 60,
      category: 'snacks',
      totalCount: 30,
      remainingCount: 30,
      imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'food3',
      name: 'Masala Chai',
      description: 'Traditional Indian spiced tea with milk',
      price: 15,
      category: 'beverages',
      totalCount: 100,
      remainingCount: 100,
      imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  foodItems.push(...sampleFoodItems);
};

export const collections = {
  users: () => mockFirestore.collection('users'),
  foodItems: () => mockFirestore.collection('foodItems'),
  orders: () => mockFirestore.collection('orders'),
};

export const firestoreHelpers = {
  timestampToDate: (timestamp: any): Date => {
    return timestamp instanceof Date ? timestamp : new Date();
  },
  dateToTimestamp: (date: Date): any => {
    return date;
  },
  now: (): any => {
    return new Date();
  },
  batch: () => ({
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: async () => {}
  }),
  runTransaction: async <T>(updateFunction: (transaction: any) => Promise<T>) => {
    const mockTransaction = {
      get: async (ref: any) => ({ exists: true, data: () => ({}) }),
      set: () => {},
      update: () => {},
      delete: () => {}
    };
    return updateFunction(mockTransaction);
  },
};
