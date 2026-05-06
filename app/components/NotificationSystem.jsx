"use client";

import { useState, useEffect } from "react";
import { Bell, Package, AlertTriangle, UserCheck, ShoppingCart, Truck, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = () => {
    const medicines = JSON.parse(localStorage.getItem("medicines") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const supplierOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    const customerPurchases = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    const existingNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    let newNotifications = [];

    // ========== ADMIN NOTIFICATIONS ==========
    if (user?.role === "Admin") {
      // Low Stock Alerts
      medicines.forEach(med => {
        if (med.quantity < 20) {
          const existing = existingNotifs.find(n => n.type === "low_stock" && n.medicineId === med.id && n.userId === user.id);
          if (!existing) {
            newNotifications.push({
              id: Date.now() + med.id,
              userId: user.id,
              type: "low_stock",
              title: "⚠️ Low Stock Alert",
              message: `${med.name} has only ${med.quantity} units left!`,
              icon: "AlertTriangle",
              color: "yellow",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });

      // Expiry Alerts
      medicines.forEach(med => {
        const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 60 && daysLeft > 0) {
          const existing = existingNotifs.find(n => n.type === "expiry" && n.medicineId === med.id && n.userId === user.id);
          if (!existing) {
            newNotifications.push({
              id: Date.now() + med.id + 100,
              userId: user.id,
              type: "expiry",
              title: "📅 Expiring Soon",
              message: `${med.name} will expire in ${daysLeft} days!`,
              icon: "Package",
              color: "red",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });

      // New Supplier Registration
      const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");
      pendingSuppliers.forEach(sup => {
        const existing = existingNotifs.find(n => n.type === "new_supplier" && n.userId === sup.id && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + sup.id + 200,
            userId: user.id,
            type: "new_supplier",
            title: "👤 New Supplier Registration",
            message: `${sup.name} (${sup.email}) has requested to join.`,
            icon: "UserCheck",
            color: "purple",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      // Daily Sales Summary
      const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
      if (todaySales.length > 0) {
        const totalToday = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
        const existing = existingNotifs.find(n => n.type === "daily_sales" && 
          new Date(n.createdAt).toDateString() === new Date().toDateString() && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + 300,
            userId: user.id,
            type: "daily_sales",
            title: "💰 Daily Sales Summary",
            message: `${todaySales.length} transactions today. Total: TK ${totalToday.toFixed(2)}`,
            icon: "ShoppingCart",
            color: "green",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // ========== PHARMACIST NOTIFICATIONS ==========
    if (user?.role === "Pharmacist") {
      // Low Stock Alerts
      medicines.forEach(med => {
        if (med.quantity < 20) {
          const existing = existingNotifs.find(n => n.type === "low_stock" && n.medicineId === med.id && n.userId === user.id);
          if (!existing) {
            newNotifications.push({
              id: Date.now() + med.id,
              userId: user.id,
              type: "low_stock",
              title: "⚠️ Low Stock Alert",
              message: `${med.name} has only ${med.quantity} units left!`,
              icon: "AlertTriangle",
              color: "yellow",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });

      // Expiry Alerts
      medicines.forEach(med => {
        const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 60 && daysLeft > 0) {
          const existing = existingNotifs.find(n => n.type === "expiry" && n.medicineId === med.id && n.userId === user.id);
          if (!existing) {
            newNotifications.push({
              id: Date.now() + med.id + 100,
              userId: user.id,
              type: "expiry",
              title: "📅 Expiring Soon",
              message: `${med.name} will expire in ${daysLeft} days!`,
              icon: "Package",
              color: "red",
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }

    // ========== SUPPLIER NOTIFICATIONS ==========
    if (user?.role === "Supplier") {
      // New Orders
      const newOrders = supplierOrders.filter(o => o.status === "Pending");
      newOrders.forEach(order => {
        const existing = existingNotifs.find(n => n.type === "new_order" && n.orderId === order.id && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + order.id + 400,
            userId: user.id,
            type: "new_order",
            title: "🆕 New Order Received",
            message: `Order ${order.orderId} for ${order.medicineName} (${order.quantity} units)`,
            icon: "Truck",
            color: "blue",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      // Order Status Updates
      const shippedOrders = supplierOrders.filter(o => o.status === "Shipped");
      shippedOrders.forEach(order => {
        const existing = existingNotifs.find(n => n.type === "order_shipped" && n.orderId === order.id && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + order.id + 500,
            userId: user.id,
            type: "order_shipped",
            title: "🚚 Order Shipped",
            message: `Order ${order.orderId} has been shipped.`,
            icon: "Truck",
            color: "blue",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      const deliveredOrders = supplierOrders.filter(o => o.status === "Delivered");
      deliveredOrders.forEach(order => {
        const existing = existingNotifs.find(n => n.type === "order_delivered" && n.orderId === order.id && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + order.id + 600,
            userId: user.id,
            type: "order_delivered",
            title: "✅ Order Delivered",
            message: `Order ${order.orderId} has been delivered successfully.`,
            icon: "CheckCircle",
            color: "green",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    // ========== CUSTOMER NOTIFICATIONS ==========
    if (user?.role === "Customer") {
      // Order Confirmation
      const recentPurchases = customerPurchases.filter(p => 
        p.customerName === user.name && new Date(p.date).toDateString() === new Date().toDateString()
      );
      recentPurchases.forEach(purchase => {
        const existing = existingNotifs.find(n => n.type === "order_confirmation" && n.orderId === purchase.id && n.userId === user.id);
        if (!existing) {
          newNotifications.push({
            id: Date.now() + purchase.id + 700,
            userId: user.id,
            type: "order_confirmation",
            title: "✅ Order Confirmed",
            message: `Your order ${purchase.invoiceNo} has been confirmed. Total: TK ${purchase.total.toFixed(2)}`,
            icon: "ShoppingCart",
            color: "green",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      // Welcome Notification (first time)
      const welcomeNotif = existingNotifs.find(n => n.type === "welcome" && n.userId === user.id);
      if (!welcomeNotif && user.createdAt && new Date(user.createdAt).toDateString() === new Date().toDateString()) {
        newNotifications.push({
          id: Date.now() + 800,
          userId: user.id,
          type: "welcome",
          title: "🎉 Welcome to PharmaMed!",
          message: "Thank you for joining us. Start shopping for medicines!",
          icon: "Package",
          color: "purple",
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Save new notifications
    if (newNotifications.length > 0) {
      const updated = [...existingNotifs, ...newNotifications];
      localStorage.setItem("notifications", JSON.stringify(updated));
    }
    
    const userNotifs = existingNotifs.filter(n => n.userId === user.id);
    setNotifications(userNotifs);
    setUnreadCount(userNotifs.filter(n => !n.read).length);
  };

  const markAsRead = (notifId) => {
    const allNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updated = allNotifs.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const allNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updated = allNotifs.map(n => 
      n.userId === user.id ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notifId) => {
    const allNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updated = allNotifs.filter(n => n.id !== notifId);
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(notifications.filter(n => n.id !== notifId));
    setUnreadCount(prev => notifications.find(n => n.id === notifId && !n.read) ? prev - 1 : prev);
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case "AlertTriangle": return <AlertTriangle className="w-5 h-5" />;
      case "Package": return <Package className="w-5 h-5" />;
      case "UserCheck": return <UserCheck className="w-5 h-5" />;
      case "ShoppingCart": return <ShoppingCart className="w-5 h-5" />;
      case "Truck": return <Truck className="w-5 h-5" />;
      case "CheckCircle": return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColorClass = (color) => {
    switch(color) {
      case "yellow": return "bg-amber-100 text-amber-700";
      case "red": return "bg-red-100 text-red-700";
      case "purple": return "bg-purple-100 text-purple-700";
      case "green": return "bg-emerald-100 text-emerald-700";
      case "blue": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700">
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? "bg-blue-50" : ""}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(notif.color)}`}>
                        {getIcon(notif.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm text-gray-800">{notif.title}</p>
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
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleTimeString()} - {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}