"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Package, ShoppingCart, Users, FileText, 
  LogOut, Menu, X, Sun, Moon, Pill, Truck, User, 
  BarChart3, Bell, Heart, History, TrendingUp, Shield, 
  Stethoscope, ShoppingBag, UserCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMenuItems = () => {
    switch(user?.role) {
      case "Admin":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "blue" },
          { name: "My Profile", icon: UserCircle, href: "/dashboard/profile", color: "purple" },
          { name: "Medicines", icon: Package, href: "/dashboard/medicines", color: "green" },
          { name: "Categories", icon: BarChart3, href: "/dashboard/categories", color: "yellow" },
          { name: "Users", icon: Users, href: "/dashboard/users", color: "indigo" },
          { name: "Reports", icon: FileText, href: "/dashboard/reports", color: "orange" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "pink" },
        ];
      case "Pharmacist":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "blue" },
          { name: "My Profile", icon: UserCircle, href: "/dashboard/profile", color: "purple" },
          { name: "Sell Medicine", icon: ShoppingCart, href: "/dashboard/sell", color: "green" },
          { name: "Stock", icon: Package, href: "/dashboard/stock", color: "orange" },
          { name: "Reports", icon: TrendingUp, href: "/dashboard/reports", color: "blue" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "pink" },
        ];
      case "Supplier":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "blue" },
          { name: "My Profile", icon: UserCircle, href: "/dashboard/profile", color: "purple" },
          { name: "My Orders", icon: Truck, href: "/dashboard/orders", color: "orange" },
          { name: "My Supplies", icon: Package, href: "/dashboard/supplies", color: "green" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "pink" },
        ];
      case "Customer":
        return [
          { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "blue" },
          { name: "My Profile", icon: UserCircle, href: "/dashboard/profile", color: "purple" },
          { name: "Shop", icon: ShoppingBag, href: "/dashboard/shop", color: "green" },
          { name: "History", icon: History, href: "/dashboard/history", color: "orange" },
          { name: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "pink" },
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
    return pathname !== "/dashboard" && pathname.startsWith(href);
  };

  const getActiveClass = (color) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      green: "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
      orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
      pink: "bg-pink-50 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
    };
    return colorMap[color] || colorMap.blue;
  };

  if (!mounted) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-md">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PharmaMed
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pharmacy Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${
              user?.role === "Admin" ? "from-purple-500 to-pink-500" :
              user?.role === "Pharmacist" ? "from-blue-500 to-cyan-500" :
              user?.role === "Supplier" ? "from-orange-500 to-red-500" :
              "from-green-500 to-emerald-500"
            } flex items-center justify-center shadow-md`}>
              <span className="text-lg font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-gradient-to-r ${
                user?.role === "Admin" ? "from-purple-500 to-pink-500" :
                user?.role === "Pharmacist" ? "from-blue-500 to-cyan-500" :
                user?.role === "Supplier" ? "from-orange-500 to-red-500" :
                "from-green-500 to-emerald-500"
              } text-white`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  active
                    ? getActiveClass(item.color)
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.name}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
            <div className={`relative w-10 h-5 rounded-full transition-all ${
              darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </div>
          </button>

          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}