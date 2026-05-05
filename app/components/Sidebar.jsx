"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Pill,
  Truck,
  User,
  BarChart3,
  Bell
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const getMenuItems = () => {
    switch(user?.role) {
      case "Admin":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { name: "Medicines", icon: Package, href: "/dashboard/medicines" },
          { name: "Categories", icon: BarChart3, href: "/dashboard/categories" },
          { name: "Users", icon: Users, href: "/dashboard/users" },
          { name: "Reports", icon: FileText, href: "/dashboard/reports" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        ];
      case "Pharmacist":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { name: "Sell Medicine", icon: ShoppingCart, href: "/dashboard/sell" },
          { name: "Stock Management", icon: Package, href: "/dashboard/stock" },
          { name: "Sales Reports", icon: FileText, href: "/dashboard/reports" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        ];
      case "Supplier":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { name: "My Orders", icon: Truck, href: "/dashboard/orders" },
          { name: "My Supplies", icon: Package, href: "/dashboard/supplies" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        ];
      case "Customer":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
          { name: "Shop", icon: ShoppingCart, href: "/dashboard/shop" },
          { name: "My Orders", icon: FileText, href: "/dashboard/history" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              PharmacyMS
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2"
          >
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
              <span className="text-gray-600 dark:text-gray-300">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {darkMode ? "☀️" : "🌙"}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}