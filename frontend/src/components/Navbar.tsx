'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShoppingCart, 
  LayoutDashboard,
  UtensilsCrossed
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              <UtensilsCrossed className="w-8 h-8 text-blue-600" />
              <span>Canteen</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/menu" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Menu
                </Link>
                
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Orders
                </Link>

                {/* Cart Icon */}
                <Link
                  href="/menu"
                  className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {getTotalItems() > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Link>

                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                    <User className="w-5 h-5" />
                    <span>Welcome, {user?.name}</span>
                  </div>
                  
                  <Link 
                    href="/menu" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Menu
                  </Link>
                  
                  <Link 
                    href="/orders" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    My Orders
                  </Link>

                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
