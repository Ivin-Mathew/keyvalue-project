import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "College Canteen Management System",
  description: "A comprehensive canteen management system for colleges with real-time ordering and QR code verification",
  keywords: ["canteen", "food", "ordering", "college", "management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            <footer className="bg-white border-t border-gray-200 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-600">
                  <p>&copy; 2025 College Canteen Management System. All rights reserved.</p>
                </div>
              </div>
            </footer>
            </div>
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
