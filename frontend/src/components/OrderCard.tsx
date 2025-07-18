'use client';

import React, { useState } from 'react';
import { Order } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  QrCode, 
  Eye,
  EyeOff,
  ShoppingBag
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  showQRCode?: boolean;
  onStatusUpdate?: (orderId: string, status: string) => void;
  isAdmin?: boolean;
  className?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  showQRCode = false,
  onStatusUpdate,
  isAdmin = false,
  className = '',
}) => {
  const [showQR, setShowQR] = useState(showQRCode);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (onStatusUpdate) {
      setIsUpdating(true);
      try {
        await onStatusUpdate(order.id, newStatus);
      } catch (error) {
        console.error('Failed to update order status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const toggleQRCode = () => {
    setShowQR(!showQR);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Order #{order.id.slice(-8).toUpperCase()}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(order.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </div>
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Ordered by: {order.userName}</p>
          <p>Date: {formatDate(order.createdAt)}</p>
          {order.fulfilledAt && (
            <p>Fulfilled: {formatDate(order.fulfilledAt)}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Items Ordered:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.foodItemName}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {/* QR Code Section */}
        {order.status === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">QR Code:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleQRCode}
                className="flex items-center space-x-1"
              >
                {showQR ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
              </Button>
            </div>

            {showQR && (
              <div className="flex justify-center">
                <QRCodeDisplay
                  value={order.qrCode}
                  title="Order QR Code"
                  size={150}
                  showDownload={true}
                  showCopy={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && order.status === 'pending' && (
          <div className="flex space-x-2 pt-3 border-t border-gray-200">
            <Button
              onClick={() => handleStatusUpdate('fulfilled')}
              disabled={isUpdating}
              size="sm"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark as Fulfilled
            </Button>
            
            <Button
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdating}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel Order
            </Button>
          </div>
        )}

        {/* Customer Instructions */}
        {!isAdmin && order.status === 'pending' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Show this QR code at the counter</p>
                <p>Present your QR code to the staff to collect your order.</p>
              </div>
            </div>
          </div>
        )}

        {order.status === 'fulfilled' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                Order completed successfully!
              </p>
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                This order has been cancelled.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
