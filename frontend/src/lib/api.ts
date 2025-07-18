import { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  FoodItem,
  Order,
  CreateOrderRequest,
  UpdateFoodItemRequest
} from '../../../shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/auth/profile');
  }

  // Food items endpoints
  async getFoodItems(params?: { category?: string; available?: boolean }): Promise<ApiResponse<FoodItem[]>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.available !== undefined) searchParams.append('available', params.available.toString());
    
    const query = searchParams.toString();
    return this.request<FoodItem[]>(`/api/food-items${query ? `?${query}` : ''}`);
  }

  async getFoodItem(id: string): Promise<ApiResponse<FoodItem>> {
    return this.request<FoodItem>(`/api/food-items/${id}`);
  }

  async createFoodItem(data: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'remainingCount' | 'isAvailable'>): Promise<ApiResponse<FoodItem>> {
    return this.request<FoodItem>('/api/food-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFoodItem(id: string, data: UpdateFoodItemRequest): Promise<ApiResponse<FoodItem>> {
    return this.request<FoodItem>(`/api/food-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFoodItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/food-items/${id}`, {
      method: 'DELETE',
    });
  }

  async getFoodCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/api/food-items/categories');
  }

  // Orders endpoints
  async getOrders(params?: { status?: string; userId?: string }): Promise<ApiResponse<Order[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.userId) searchParams.append('userId', params.userId);
    
    const query = searchParams.toString();
    return this.request<Order[]>(`/api/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/api/orders/${id}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async verifyQRCode(qrCode: string): Promise<ApiResponse<Order>> {
    return this.request<Order>('/api/orders/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
