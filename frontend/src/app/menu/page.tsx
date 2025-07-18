'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { FoodItem } from '../../../../shared/types';
import { apiClient } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import FoodItemCard from '@/components/FoodItemCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ShoppingCart, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function MenuPage() {
  const { isAuthenticated } = useAuth();
  const { items: cartItems, addItem, getTotalItems, getTotalAmount, checkout, isCheckingOut } = useCart();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
    
    // Connect to socket for real-time updates
    const socket = socketManager.connect();
    
    // Listen for food count updates
    socketManager.onFoodCountUpdate((data) => {
      setFoodItems(prev => prev.map(item => 
        item.id === data.foodItemId 
          ? { ...item, remainingCount: data.remainingCount, isAvailable: data.remainingCount > 0 }
          : item
      ));
    });

    // Listen for food item updates
    socketManager.onFoodItemUpdate((updatedItem) => {
      setFoodItems(prev => prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    });

    return () => {
      socketManager.disconnect();
    };
  }, []);

  useEffect(() => {
    filterItems();
  }, [foodItems, searchTerm, selectedCategory, showAvailableOnly]);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFoodItems();
      if (response.success && response.data) {
        setFoodItems(response.data);
      } else {
        setError('Failed to load food items');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getFoodCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const filterItems = () => {
    let filtered = [...foodItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(item => item.isAvailable && item.remainingCount > 0);
    }

    setFilteredItems(filtered);
  };

  const handleAddToCart = async (foodItem: FoodItem, quantity: number) => {
    addItem(foodItem, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading delicious food items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">Discover and order your favorite food items</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Availability Filter */}
              <Button
                variant={showAvailableOnly ? "default" : "outline"}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className="justify-start"
              >
                Available Only
              </Button>

              {/* Refresh */}
              <Button
                variant="outline"
                onClick={fetchFoodItems}
                className="justify-start"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cart Summary */}
        {isAuthenticated && cartItems.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {getTotalItems()} items in cart
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-blue-900">
                    ₹{getTotalAmount().toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={checkout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              Showing {filteredItems.length} of {foodItems.length} items
            </span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </Badge>
            )}
            {showAvailableOnly && (
              <Badge variant="secondary">Available Only</Badge>
            )}
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((foodItem) => (
              <FoodItemCard
                key={foodItem.id}
                foodItem={foodItem}
                onAddToCart={handleAddToCart}
                showAddToCart={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
