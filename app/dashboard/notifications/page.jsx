"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Bell, AlertTriangle, Package, XCircle, CheckCircle,
  Truck, Users, ShoppingCart, Calendar, Clock,
  Trash2, RefreshCw, Filter, Eye, BellRing,
  AlertOctagon, Info, MessageCircle, X, UserCheck,
  TrendingUp, DollarSign, Award
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
    const supplierOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    const customerPurchases = JSON.parse(localStorage.getItem("customerPurchases") || "[]");

    let alerts = [];

    // ---------- ADMIN area ----------
    if (user?.role === "Admin") {
      medicines.forEach(med => {
        if ((med.quantity || 0) < 20) {
          alerts.push({
            id: Date.now() + med.id,
            type: "low_stock",
            title: "⚠️ Low Stock Alert",
            message: `${med.name}: Only ${med.quantity} units left.`,
            icon: AlertTriangle,
            color: med.quantity < 10 ? "red" : "yellow",
            time: new Date().toISOString(),
            role: "Admin"
          });
        }
        const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 60 && daysLeft > 0) {
          alerts.push({
            id: Date.now() + med.id + 100,
            type: "expiry",
            title: "📅 Expiring Soon",
            message: `${med.name} will expire in ${daysLeft} days.`,
            icon: Calendar,
            color: daysLeft < 30 ? "red" : "orange",
            time: new Date().toISOString(),
            role: "Admin"
          });
        }
      });
      const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");
      pendingSuppliers.forEach(sup => {
        alerts.push({
          id: Date.now() + sup.id + 200,
          type: "pending_supplier",
          title: "👤 New Supplier Registration",
          message: `${sup.name} (${sup.email}) wants to join as supplier.`,
          icon: Users,
          color: "purple",
          time: new Date().toISOString(),
          role: "Admin"
        });
      });
      const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
      if (todaySales.length) {
        const totalToday = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
        alerts.push({
          id: Date.now() + 300,
          type: "sales",
          title: "💰 Daily Sales Summary",
          message: `${todaySales.length} transactions, total TK ${totalToday.toFixed(2)}.`,
          icon: ShoppingCart,
          color: "green",
          time: new Date().toISOString(),
          role: "Admin"
        });
      }
    }

    // ---------- PHARMACIST area ----------
    else if (user?.role === "Pharmacist") {
      medicines.forEach(med => {
        if ((med.quantity || 0) < 20) {
          alerts.push({
            id: Date.now() + med.id,
            type: "low_stock",
            title: "⚠️ Low Stock Alert",
            message: `${med.name}: Only ${med.quantity} units left.`,
            icon: AlertTriangle,
            color: med.quantity < 10 ? "red" : "yellow",
            time: new Date().toISOString(),
            role: "Pharmacist"
          });
        }
        const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 60 && daysLeft > 0) {
          alerts.push({
            id: Date.now() + med.id + 100,
            type: "expiry",
            title: "📅 Expiring Soon",
            message: `${med.name} will expire in ${daysLeft} days.`,
            icon: Calendar,
            color: daysLeft < 30 ? "red" : "orange",
            time: new Date().toISOString(),
            role: "Pharmacist"
          });
        }
      });
    }

    // ---------- SUPPLIER area ----------
    else if (user?.role === "Supplier") {
      supplierOrders.forEach(order => {
        if (order.status === "Pending") {
          alerts.push({
            id: Date.now() + order.id + 400,
            type: "new_order",
            title: "🆕 New Order Received",
            message: `Order ${order.orderId} for ${order.medicineName} (${order.quantity} units).`,
            icon: Truck,
            color: "blue",
            time: order.orderDate || new Date().toISOString(),
            role: "Supplier"
          });
        } else if (order.status === "Shipped") {
          alerts.push({
            id: Date.now() + order.id + 500,
            type: "order_shipped",
            title: "🚚 Order Shipped",
            message: `Order ${order.orderId} has been shipped.`,
            icon: Truck,
            color: "blue",
            time: new Date().toISOString(),
            role: "Supplier"
          });
        } else if (order.status === "Delivered") {
          alerts.push({
            id: Date.now() + order.id + 600,
            type: "order_delivered",
            title: "✅ Order Delivered",
            message: `Order ${order.orderId} delivered successfully.`,
            icon: CheckCircle,
            color: "green",
            time: new Date().toISOString(),
            role: "Supplier"
          });
        }
      });
      if (user.status === "approved") {
        alerts.push({
          id: Date.now() + 700,
          type: "account_approved",
          title: "✅ Account Approved",
          message: "Your supplier account has been approved.",
          icon: CheckCircle,
          color: "green",
          time: new Date().toISOString(),
          role: "Supplier"
        });
      }
    }

    // ---------- CUSTOMER area ----------
    else if (user?.role === "Customer") {
      customerPurchases.filter(p => p.customerName === user.name).forEach(purchase => {
        alerts.push({
          id: Date.now() + purchase.id + 800,
          type: "order_confirmation",
          title: "✅ Order Confirmed",
          message: `Order ${purchase.invoiceNo} confirmed. Total: TK ${purchase.total.toFixed(2)}.`,
          icon: ShoppingCart,
          color: "green",
          time: purchase.date || new Date().toISOString(),
          role: "Customer"
        });
      });
      alerts.push({
        id: Date.now() + 900,
        type: "welcome",
        title: "🎉 Welcome to PharmaMed!",
        message: "Thanks for joining. Start shopping now.",
        icon: Award,
        color: "purple",
        time: new Date().toISOString(),
        role: "Customer"
      });
    }

    // sort newest first
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifications(alerts);
    setIsLoading(false);
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm("Clear all notifications?")) setNotifications([]);
  };

  const refresh = () => loadNotifications();

  const getFiltered = () => {
    if (filter === "all") return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const getIconBg = (color) => {
    const map = {
      yellow: "bg-amber-100", red: "bg-red-100", orange: "bg-orange-100",
      purple: "bg-purple-100", green: "bg-emerald-100", blue: "bg-blue-100"
    };
    return map[color] || "bg-gray-100";
  };

  const getIconCol = (color) => {
    const map = {
      yellow: "text-amber-600", red: "text-red-600", orange: "text-orange-600",
      purple: "text-purple-600", green: "text-emerald-600", blue: "text-blue-600"
    };
    return map[color] || "text-gray-600";
  };

  const getBorder = (color) => {
    const map = {
      yellow: "border-l-amber-500", red: "border-l-red-500", orange: "border-l-orange-500",
      purple: "border-l-purple-500", green: "border-l-emerald-500", blue: "border-l-blue-500"
    };
    return map[color] || "border-l-gray-500";
  };

  const filtered = getFiltered();
  const stats = {
    total: notifications.length,
    lowStock: notifications.filter(n => n.type === "low_stock").length,
    expiry: notifications.filter(n => n.type === "expiry").length,
    pending: notifications.filter(n => n.type === "pending_supplier").length
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl"><Bell className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-gray-500">Role‑based alerts</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="p-2 rounded-xl hover:bg-gray-100"><RefreshCw size={18} /></button>
          {notifications.length > 0 && <button onClick={clearAll} className="p-2 rounded-xl text-red-600"><Trash2 size={18} /></button>}
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-4 rounded-xl"><p className="text-sm">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-amber-500 text-white p-4 rounded-xl"><p className="text-sm">Low Stock</p><p className="text-2xl font-bold">{stats.lowStock}</p></div>
        <div className="bg-rose-500 text-white p-4 rounded-xl"><p className="text-sm">Expiring</p><p className="text-2xl font-bold">{stats.expiry}</p></div>
        <div className="bg-purple-500 text-white p-4 rounded-xl"><p className="text-sm">Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div>
      </div>

      {/* filter tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 flex gap-1 flex-wrap">
        {[
          { id: "all", label: "All", icon: Bell, count: stats.total },
          { id: "low_stock", label: "Low Stock", icon: AlertTriangle, count: stats.lowStock },
          { id: "expiry", label: "Expiry", icon: Calendar, count: stats.expiry },
          { id: "pending_supplier", label: "Pending", icon: Users, count: stats.pending }
        ].map(tab => {
          const Icon = tab.icon;
          const active = filter === tab.id;
          return (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <Icon size={16} /> {tab.label}
              {tab.count > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${active ? "bg-white/20" : "bg-gray-200"}`}>{tab.count}</span>}
            </button>
          );
        })}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center text-gray-500">✨ No notifications</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const Icon = notif.icon;
            return (
              <div key={notif.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${getBorder(notif.color)} p-4 hover:shadow-md transition`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg ${getIconBg(notif.color)} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${getIconCol(notif.color)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{notif.title}</h3>
                      <button onClick={() => clearNotification(notif.id)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notif.time).toLocaleString()}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{notif.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}