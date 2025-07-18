import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get color for food category badges
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    breakfast: 'bg-orange-100 text-orange-800 border-orange-200',
    lunch: 'bg-green-100 text-green-800 border-green-200',
    dinner: 'bg-blue-100 text-blue-800 border-blue-200',
    snacks: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    beverages: 'bg-purple-100 text-purple-800 border-purple-200',
    desserts: 'bg-pink-100 text-pink-800 border-pink-200',
  }
  return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Capitalize first letter of a string
export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// Get color for order status badges
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-orange-100 text-orange-800 border-orange-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    fulfilled: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}
