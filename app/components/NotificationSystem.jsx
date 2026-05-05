"use client";

import { useState, useEffect } from "react";
import { Bell, Package, AlertTriangle, UserCheck, ShoppingCart, X, CheckCircle } from "lucide-react";

export default function NotificationSystem({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    
    // Check for updates every 30 seconds
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    // Filter notifications for current user
    const userNotifs = stored.filter(n => n.userId === user.id || n.forAll === true);
    setNotifications(userNotifs);
    setUnreadCount(userNotifs.filter(n => !n.read).length);
  };

  const checkForNewNotifications = () => {
    const medicines = JSON.parse(localStorage.getItem("medicines") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const existingNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    const newNotifications = [];

    // 1. Low Stock Alerts
    medicines.forEach(med => {
      if (med.quantity < 20) {
        const existing = existingNotifs.find(n => n.type === "low_stock" && n.medicineId === med.id);
        if (!existing || existing.status !== "active") {
          newNotifications.push({
            id: Date.now() + med.id,
            userId: user.id,
            forAll: true,
            type: "low_stock",
            title: "⚠️ Low Stock Alert",
            message: `${med.name} has only ${med.quantity} units left in stock!`,
            medicineId: med.id,
            status: "active",
            read: false,
            createdAt: new Date().toISOString(),
            icon: "AlertTriangle",
            color: "yellow"
          });
        }
      }
    });

    // 2. Expiry Alerts (within 60 days)
    medicines.forEach(med => {
      const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 60 && daysLeft > 0) {
        const existing = existingNotifs.find(n => n.type === "expiry" && n.medicineId === med.id);
        if (!existing || existing.status !== "active") {
          newNotifications.push({
            id: Date.now() + med.id + 100,
            userId: user.id,
            forAll: true,
            type: "expiry",
            title: "📅 Expiry Alert",
            message: `${med.name} will expire in ${daysLeft} days!`,
            medicineId: med.id,
            daysLeft: daysLeft,
            status: "active",
            read: false,
            createdAt: new Date().toISOString(),
            icon: "Package",
            color: "red"
          });
        }
      }
    });

    // 3. Pending Suppliers (for Admin only)
    if (user.role === "Admin") {
      const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");
      pendingSuppliers.forEach(sup => {
        const existing = existingNotifs.find(n => n.type === "pending_supplier" && n.supplierId === sup.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + sup.id,
            userId: user.id,
            forAll: false,
            type: "pending_supplier",
            title: "👤 New Supplier Request",
            message: `${sup.name} (${sup.email}) has requested to join as a supplier.`,
            supplierId: sup.id,
            status: "active",
            read: false,
            createdAt: new Date().toISOString(),
            icon: "UserCheck",
            color: "purple"
          });
        }
      });
    }

    // Add new notifications
    if (newNotifications.length > 0) {
      const updated = [...existingNotifs, ...newNotifications];
      localStorage.setItem("notifications", JSON.stringify(updated));
      loadNotifications();
    }
  };

  const markAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
    loadNotifications();
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
    loadNotifications();
  };

  const clearNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    localStorage.setItem("notifications", JSON.stringify(updated));
    loadNotifications();
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case "AlertTriangle": return <AlertTriangle className="w-5 h-5" />;
      case "Package": return <Package className="w-5 h-5" />;
      case "UserCheck": return <UserCheck className="w-5 h-5" />;
      case "ShoppingCart": return <ShoppingCart className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColorClass = (color) => {
    switch(color) {
      case "yellow": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200";
      case "red": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
      case "purple": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
      case "green": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">New alerts will appear here</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${!notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getColorClass(notif.color)}`}>
                      {getIcon(notif.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{notif.title}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleTimeString()} - {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const updated = notifications.filter(n => n.type !== "low_stock" && n.type !== "expiry");
                  localStorage.setItem("notifications", JSON.stringify(updated));
                  loadNotifications();
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all old notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}