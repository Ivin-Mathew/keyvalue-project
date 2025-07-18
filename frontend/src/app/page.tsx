'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  UtensilsCrossed,
  Clock,
  QrCode,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <UtensilsCrossed className="w-8 h-8 text-blue-600" />,
      title: 'Easy Food Ordering',
      description: 'Browse available food items and place orders with just a few clicks.'
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: 'Real-time Updates',
      description: 'Get live updates on food availability and order status.'
    },
    {
      icon: <QrCode className="w-8 h-8 text-purple-600" />,
      title: 'QR Code System',
      description: 'Secure order verification using unique QR codes for each order.'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'Secure & Reliable',
      description: 'Built with security in mind and reliable order management.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '500+', icon: <Users className="w-5 h-5" /> },
    { label: 'Orders Processed', value: '10K+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Food Items', value: '50+', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { label: 'Success Rate', value: '99%', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              College Canteen
              <span className="block text-yellow-300">Management System</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Streamline your canteen operations with real-time ordering, QR code verification,
              and comprehensive management tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/menu">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                      View Menu
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/menu">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                      Browse Menu
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for college canteens with modern technology and user-friendly design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
