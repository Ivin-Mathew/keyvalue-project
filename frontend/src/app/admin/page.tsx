'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Order, FoodItem } from '../../../../shared/types';
import { apiClient } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import OrderCard from '@/components/OrderCard';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { 
  Loader2, 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  QrCode,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    fetchOrders();
    fetchFoodItems();
    
    // Connect to socket for real-time updates
    const socket = socketManager.connect();
    socketManager.joinRoom('management');
    
    // Listen for new orders
    socketManager.onNewOrder((newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`New order received from ${newOrder.userName}!`);
    });

    // Listen for food count updates
    socketManager.onFoodCountUpdate((data) => {
      setFoodItems(prev => prev.map(item => 
        item.id === data.foodItemId 
          ? { ...item, remainingCount: data.remainingCount, isAvailable: data.remainingCount > 0 }
          : item
      ));
    });

    return () => {
      socketManager.leaveRoom('management');
      socketManager.disconnect();
    };
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      if (response.success && response.data) {
        // Sort orders by creation date (newest first)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await apiClient.getFoodItems();
      if (response.success && response.data) {
        setFoodItems(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch food items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await apiClient.updateOrderStatus(orderId, status);
      if (response.success && response.data) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? response.data! : order
        ));
        toast.success(`Order ${status} successfully`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      const response = await apiClient.verifyQRCode(qrCode);
      if (response.success && response.data) {
        setOrders(prev => prev.map(order => 
          order.id === response.data!.id ? response.data! : order
        ));
        toast.success('Order verified and fulfilled successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify QR code');
    }
  };

  const getOrderStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= today
    );

    return {
      total: orders.length,
      today: todayOrders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      fulfilled: orders.filter(o => o.status === 'fulfilled').length,
      todayRevenue: todayOrders
        .filter(o => o.status === 'fulfilled')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };
  };

  const getLowStockItems = () => {
    return foodItems.filter(item => item.remainingCount <= 5 && item.remainingCount > 0);
  };

  const getOutOfStockItems = () => {
    return foodItems.filter(item => item.remainingCount === 0);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <LayoutDashboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You need admin privileges to access this dashboard
            </p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();
  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders, food items, and monitor operations</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-yellow-800">Low Stock Alert</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lowStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-yellow-700">{item.name}</span>
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                            {item.remainingCount} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Out of Stock Alert */}
              {outOfStockItems.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Out of Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {outOfStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-red-700">{item.name}</span>
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Pending Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Pending Orders</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOrders}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>No pending orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.slice(0, 3).map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusUpdate={handleOrderStatusUpdate}
                        isAdmin={true}
                      />
                    ))}
                    {pendingOrders.length > 3 && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('orders')}
                        >
                          View All Orders ({pendingOrders.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusUpdate={handleOrderStatusUpdate}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Food Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {foodItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price}</p>
                        <Badge 
                          variant={item.remainingCount === 0 ? "destructive" : 
                                  item.remainingCount <= 5 ? "secondary" : "default"}
                        >
                          {item.remainingCount} remaining
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner">
            <div className="max-w-md mx-auto">
              <QRCodeScanner
                onScan={handleQRScan}
                title="Scan Order QR Code"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
