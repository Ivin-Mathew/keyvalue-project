'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FoodItem } from '../../../shared/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, getCategoryColor, capitalizeFirst } from '@/lib/utils';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface FoodItemCardProps {
  foodItem: FoodItem;
  onAddToCart?: (foodItem: FoodItem, quantity: number) => void;
  showAddToCart?: boolean;
  className?: string;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({
  foodItem,
  onAddToCart,
  showAddToCart = true,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= foodItem.remainingCount) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (onAddToCart && quantity > 0) {
      setIsAdding(true);
      try {
        await onAddToCart(foodItem, quantity);
        setQuantity(1); // Reset quantity after adding
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const isOutOfStock = foodItem.remainingCount === 0 || !foodItem.isAvailable;
  const isLowStock = foodItem.remainingCount <= 5 && foodItem.remainingCount > 0;

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${className}`}>
      <div className="relative">
        {foodItem.imageUrl ? (
          <Image
            src={foodItem.imageUrl}
            alt={foodItem.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = '/placeholder-food.jpg';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            className={getCategoryColor(foodItem.category)}
            size="sm"
          >
            {capitalizeFirst(foodItem.category)}
          </Badge>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <Badge variant="destructive" size="sm">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm">
              Low Stock ({foodItem.remainingCount})
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Available ({foodItem.remainingCount})
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {foodItem.name}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            {foodItem.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(foodItem.price)}
            </span>
            
            {showAddToCart && !isOutOfStock && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="w-8 text-center font-medium">
                  {quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= foodItem.remainingCount}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {showAddToCart && (
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            loading={isAdding}
            className="w-full"
            variant={isOutOfStock ? 'secondary' : 'primary'}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart ({formatCurrency(foodItem.price * quantity)})
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FoodItemCard;
