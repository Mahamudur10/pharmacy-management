"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Truck, Package, CheckCircle, Clock, Search, 
  Filter, Eye, Calendar, DollarSign, TrendingUp
} from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
    loadOrders();
  }, [user, router]);

  const loadOrders = () => {
    setIsLoading(true);
    const stored = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    setOrders(stored);
    setIsLoading(false);
  };

  const updateStatus = (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem("supplierOrders", JSON.stringify(updated));
    setOrders(updated);
    alert(`Order status updated to ${status}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Shipped": return "bg-blue-100 text-blue-700";
      case "Delivered": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Pending": return <Clock size={14} className="inline mr-1" />;
      case "Shipped": return <Truck size={14} className="inline mr-1" />;
      case "Delivered": return <CheckCircle size={14} className="inline mr-1" />;
      default: return null;
    }
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    totalValue: orders.reduce((sum, o) => sum + (o.price * o.quantity), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage your supply orders</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Shipped</p>
              <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Total Order Value</p>
            <p className="text-2xl font-bold">{formatTK(stats.totalValue)}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or medicine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr key={order.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-mono text-sm text-gray-800">{order.orderId}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{order.medicineName}</td>
                    <td className="px-5 py-3 text-gray-600">{order.quantity} units</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(order.price)}</td>
                    <td className="px-5 py-3 text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {order.status === "Pending" && (
                          <button 
                            onClick={() => updateStatus(order.id, "Shipped")} 
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm flex items-center gap-1"
                          >
                            <Truck size={14} /> Ship
                          </button>
                        )}
                        {order.status === "Shipped" && (
                          <button 
                            onClick={() => updateStatus(order.id, "Delivered")} 
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> Deliver
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <span className="text-emerald-600 text-sm flex items-center gap-1">
                            <CheckCircle size={14} /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Order Status Guide</h3>
            <p className="text-xs text-gray-600 mt-1">
              • Pending: Awaiting your confirmation
              <br />• Shipped: Order has been dispatched
              <br />• Delivered: Order completed successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}