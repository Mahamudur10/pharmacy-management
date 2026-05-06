"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Bell, AlertTriangle, Package, XCircle, CheckCircle, 
  Truck, Users, ShoppingCart, Calendar, Clock, 
  Trash2, RefreshCw, Filter, Eye, BellRing,
  AlertOctagon, Info, MessageCircle, X
} from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
    loadNotifications();
  }, [user, router]);

  const loadNotifications = () => {
    setIsLoading(true);
    const medicines = JSON.parse(localStorage.getItem("medicines") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const alerts = [];

    // Low Stock Alerts
    medicines.forEach(med => {
      if ((med.quantity || 0) < 20) {
        const severity = med.quantity < 10 ? "critical" : "warning";
        alerts.push({ 
          id: Date.now() + med.id, 
          type: "low_stock", 
          title: "⚠️ Low Stock Alert", 
          message: `${med.name}: Only ${med.quantity} units left in stock!`,
          icon: AlertTriangle, 
          color: med.quantity < 10 ? "red" : "yellow",
          severity: severity,
          time: new Date().toISOString(),
          medicineId: med.id
        });
      }
    });

    // Expiry Alerts
    medicines.forEach(med => {
      const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 60 && daysLeft > 0) {
        alerts.push({ 
          id: Date.now() + med.id + 100, 
          type: "expiry", 
          title: "📅 Expiring Soon", 
          message: `${med.name} will expire in ${daysLeft} days!`,
          icon: Calendar, 
          color: daysLeft < 30 ? "red" : "orange",
          daysLeft: daysLeft,
          time: new Date().toISOString(),
          medicineId: med.id
        });
      }
    });

    // Pending Supplier Approvals (Admin only)
    if (user?.role === "Admin") {
      const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");
      pendingSuppliers.forEach(sup => {
        alerts.push({ 
          id: Date.now() + sup.id + 200, 
          type: "pending_supplier", 
          title: "👤 New Supplier Registration", 
          message: `${sup.name} (${sup.email}) has requested to join as a supplier.`,
          icon: Users, 
          color: "purple",
          time: sup.createdAt || new Date().toISOString(),
          userId: sup.id
        });
      });
    }

    // Recent Sales (Today)
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
    if (todaySales.length > 0 && user?.role !== "Customer") {
      const totalToday = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
      alerts.push({ 
        id: Date.now() + 300, 
        type: "sales", 
        title: "💵 Today's Sales Summary", 
        message: `${todaySales.length} transactions completed today. Total: TK ${totalToday.toFixed(2)}`,
        icon: ShoppingCart, 
        color: "green",
        time: new Date().toISOString(),
        count: todaySales.length
      });
    }

    // Sort by time (newest first)
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifications(alerts);
    setIsLoading(false);
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const getIconBgColor = (color) => {
    const colors = {
      yellow: "bg-amber-100",
      red: "bg-red-100",
      orange: "bg-orange-100",
      purple: "bg-purple-100",
      green: "bg-green-100",
      blue: "bg-blue-100"
    };
    return colors[color] || "bg-gray-100";
  };

  const getIconColor = (color) => {
    const colors = {
      yellow: "text-amber-600",
      red: "text-red-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
      green: "text-green-600",
      blue: "text-blue-600"
    };
    return colors[color] || "text-gray-600";
  };

  const getBorderColor = (color) => {
    const colors = {
      yellow: "border-l-amber-500",
      red: "border-l-red-500",
      orange: "border-l-orange-500",
      purple: "border-l-purple-500",
      green: "border-l-green-500",
      blue: "border-l-blue-500"
    };
    return colors[color] || "border-l-gray-500";
  };

  const filterStats = {
    total: notifications.length,
    lowStock: notifications.filter(n => n.type === "low_stock").length,
    expiry: notifications.filter(n => n.type === "expiry").length,
    pending: notifications.filter(n => n.type === "pending_supplier").length
  };

  const filteredNotifications = getFilteredNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl shadow-md">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Stay updated with important alerts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshNotifications}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Clear All"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-2xl font-bold">{filterStats.total}</p>
            </div>
            <Bell className="w-7 h-7 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Low Stock</p>
              <p className="text-2xl font-bold">{filterStats.lowStock}</p>
            </div>
            <AlertTriangle className="w-7 h-7 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Expiring</p>
              <p className="text-2xl font-bold">{filterStats.expiry}</p>
            </div>
            <Calendar className="w-7 h-7 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{filterStats.pending}</p>
            </div>
            <Users className="w-7 h-7 text-white/80" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: "All", icon: Bell, count: filterStats.total },
            { id: "low_stock", label: "Low Stock", icon: AlertTriangle, count: filterStats.lowStock },
            { id: "expiry", label: "Expiry", icon: Calendar, count: filterStats.expiry },
            { id: "pending_supplier", label: "Pending", icon: Users, count: filterStats.pending }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    isActive ? "bg-white/20" : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group overflow-hidden ${getBorderColor(notif.color)}`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getIconBgColor(notif.color)} flex items-center justify-center group-hover:scale-110 transition`}>
                      <Icon className={`w-6 h-6 ${getIconColor(notif.color)}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {notif.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {notif.message}
                          </p>
                          {notif.type === "low_stock" && notif.severity === "critical" && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertOctagon size={12} />
                              Critical - Immediate action required
                            </div>
                          )}
                          {notif.type === "expiry" && notif.daysLeft && notif.daysLeft < 30 && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <Clock size={12} />
                              Urgent - Expiring soon
                            </div>
                          )}
                          {notif.type === "sales" && notif.count && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle size={12} />
                              {notif.count} transactions
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(notif.time).toLocaleTimeString()} • {new Date(notif.time).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => clearNotification(notif.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Dismiss"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Info size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">About Notifications</h3>
            <p className="text-xs text-gray-600 mt-1">
              Notifications automatically appear when stock is low, medicines are expiring, 
              or new suppliers register. Check back regularly to stay informed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}