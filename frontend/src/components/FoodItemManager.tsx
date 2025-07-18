'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, UpdateFoodItemRequest } from '../../../shared/types';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  Package,
  DollarSign,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

interface FoodItemManagerProps {
  foodItems: FoodItem[];
  onFoodItemsChange: (items: FoodItem[]) => void;
}

interface FoodItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  totalCount: number;
  remainingCount: number;
  imageUrl?: string;
}

const FOOD_CATEGORIES = [
  'breakfast',
  'lunch', 
  'dinner',
  'snacks',
  'beverages',
  'desserts'
];

export default function FoodItemManager({ foodItems, onFoodItemsChange }: FoodItemManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FoodItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'snacks',
    totalCount: 0,
    remainingCount: 0,
    imageUrl: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'snacks',
      totalCount: 0,
      remainingCount: 0,
      imageUrl: ''
    });
  };

  const handleCreateItem = async () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0 || formData.totalCount < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    // For new items, set remainingCount to totalCount
    const remainingCount = formData.totalCount;

    setLoading(true);
    try {
      const response = await apiClient.createFoodItem({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        totalCount: formData.totalCount,
        imageUrl: formData.imageUrl || '/images/placeholder-food.svg'
      });

      if (response.success && response.data) {
        const updatedItems = [...foodItems, response.data];
        onFoodItemsChange(updatedItems);
        toast.success('Food item created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.error || 'Failed to create food item');
      }
    } catch (error) {
      console.error('Create food item error:', error);
      toast.error('Failed to create food item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      totalCount: item.totalCount,
      remainingCount: item.remainingCount,
      imageUrl: item.imageUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !formData.name.trim() || !formData.description.trim() || formData.price <= 0 || formData.totalCount < 0 || formData.remainingCount < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    // Validate that remainingCount doesn't exceed totalCount
    if (formData.remainingCount > formData.totalCount) {
      toast.error('Remaining count cannot exceed total count');
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateFoodItemRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        totalCount: formData.totalCount,
        remainingCount: formData.remainingCount,
        imageUrl: formData.imageUrl || '/images/placeholder-food.svg',
        isAvailable: formData.remainingCount > 0
      };

      const response = await apiClient.updateFoodItem(editingItem.id, updateData);

      if (response.success && response.data) {
        const updatedItems = foodItems.map(item => 
          item.id === editingItem.id ? response.data! : item
        );
        onFoodItemsChange(updatedItems);
        toast.success('Food item updated successfully');
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
      } else {
        toast.error(response.error || 'Failed to update food item');
      }
    } catch (error) {
      console.error('Update food item error:', error);
      toast.error('Failed to update food item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: FoodItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.deleteFoodItem(item.id);

      if (response.success) {
        const updatedItems = foodItems.filter(i => i.id !== item.id);
        onFoodItemsChange(updatedItems);
        toast.success('Food item deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete food item');
      }
    } catch (error) {
      console.error('Delete food item error:', error);
      toast.error('Failed to delete food item');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStockUpdate = async (item: FoodItem, newCount: number) => {
    if (newCount < 0) return;

    setLoading(true);
    try {
      const updateData: UpdateFoodItemRequest = {
        totalCount: newCount,
        remainingCount: Math.min(newCount, item.remainingCount),
        isAvailable: newCount > 0
      };

      const response = await apiClient.updateFoodItem(item.id, updateData);

      if (response.success && response.data) {
        const updatedItems = foodItems.map(i =>
          i.id === item.id ? response.data! : i
        );
        onFoodItemsChange(updatedItems);
        toast.success('Stock updated successfully');
      } else {
        toast.error(response.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      toast.error('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRemainingUpdate = async (item: FoodItem, newRemainingCount: number) => {
    if (newRemainingCount < 0 || newRemainingCount > item.totalCount) return;

    setLoading(true);
    try {
      const updateData: UpdateFoodItemRequest = {
        remainingCount: newRemainingCount,
        isAvailable: newRemainingCount > 0
      };

      const response = await apiClient.updateFoodItem(item.id, updateData);

      if (response.success && response.data) {
        const updatedItems = foodItems.map(i =>
          i.id === item.id ? response.data! : i
        );
        onFoodItemsChange(updatedItems);
        toast.success('Remaining stock updated successfully');
      } else {
        toast.error(response.error || 'Failed to update remaining stock');
      }
    } catch (error) {
      console.error('Update remaining stock error:', error);
      toast.error('Failed to update remaining stock');
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = foodItems.filter(item => item.remainingCount <= 5 && item.remainingCount > 0);
  const outOfStockItems = foodItems.filter(item => item.remainingCount === 0);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Food Item Management</h2>
          <p className="text-gray-600">Manage your menu items, prices, and inventory</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Food Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="totalCount">Total Count *</Label>
                  <Input
                    id="totalCount"
                    type="number"
                    min="0"
                    value={formData.totalCount}
                    onChange={(e) => {
                      const newTotal = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        totalCount: newTotal,
                        remainingCount: newTotal // Auto-set remaining count for new items
                      });
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Initial stock will be set to this amount
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateItem} disabled={loading} className="flex-1">
                  {loading ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Create Item
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Out of Stock ({outOfStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="destructive">0 left</Badge>
                    </div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <p className="text-sm text-red-600">+{outOfStockItems.length - 3} more items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Low Stock ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="secondary">{item.remainingCount} left</Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-yellow-600">+{lowStockItems.length - 3} more items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map(item => (
          <Card key={item.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-lg font-semibold text-green-600">₹{item.price}</span>
              </div>

              {/* Stock Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Stock:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStockUpdate(item, Math.max(0, item.totalCount - 10))}
                      disabled={loading || item.totalCount <= 0}
                      className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300"
                      title="Decrease total stock by 10"
                    >
                      -
                    </Button>
                    <span className="font-medium min-w-[3rem] text-center bg-gray-50 px-2 py-1 rounded border">
                      {item.totalCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickStockUpdate(item, item.totalCount + 10)}
                      disabled={loading}
                      className="h-6 w-6 p-0 hover:bg-green-50 hover:border-green-300"
                      title="Increase total stock by 10"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickRemainingUpdate(item, Math.max(0, item.remainingCount - 1))}
                      disabled={loading || item.remainingCount <= 0}
                      className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300"
                      title="Decrease available stock by 1"
                    >
                      -
                    </Button>
                    <Badge
                      variant={item.remainingCount === 0 ? "destructive" :
                              item.remainingCount <= 5 ? "secondary" : "default"}
                      className="min-w-[3rem] text-center px-2"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {item.remainingCount}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickRemainingUpdate(item, Math.min(item.totalCount, item.remainingCount + 1))}
                      disabled={loading || item.remainingCount >= item.totalCount}
                      className="h-6 w-6 p-0 hover:bg-green-50 hover:border-green-300"
                      title="Increase available stock by 1"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={item.isAvailable ? "default" : "destructive"}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stock Level</span>
                  <span>{Math.round((item.remainingCount / item.totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.remainingCount === 0 ? 'bg-red-500' :
                      item.remainingCount <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(5, (item.remainingCount / item.totalCount) * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="edit-totalCount">Total Count *</Label>
                <Input
                  id="edit-totalCount"
                  type="number"
                  min="0"
                  value={formData.totalCount}
                  onChange={(e) => setFormData({ ...formData, totalCount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="edit-remainingCount">Remaining Stock *</Label>
                <Input
                  id="edit-remainingCount"
                  type="number"
                  min="0"
                  max={formData.totalCount}
                  value={formData.remainingCount}
                  onChange={(e) => setFormData({ ...formData, remainingCount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current available stock (cannot exceed total count)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateItem} disabled={loading} className="flex-1">
                {loading ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Update Item
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {foodItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first menu item</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
