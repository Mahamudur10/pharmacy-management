"use client";

import { useState, useEffect } from "react";
import { 
  Package, Users, FileText, AlertTriangle, TrendingUp, 
  Plus, Edit, Trash2, Search, X, Download, 
  Shield, Clock, CheckCircle, XCircle, Eye,
  DollarSign, Box, Layers, UserCheck, Calendar,
  ShoppingCart, Truck, Activity, Zap, Award
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [medicines, setMedicines] = useState([]);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form state
  const [form, setForm] = useState({
    name: "", category: "", batchNumber: "", manufacturer: "",
    supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
    manufactureDate: "", expiryDate: "", discount: "0"
  });

  // Chart data states
  const [salesChartData, setSalesChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const meds = JSON.parse(localStorage.getItem("medicines") || "[]");
    const usersData = JSON.parse(localStorage.getItem("users") || "[]");
    const salesData = JSON.parse(localStorage.getItem("sales") || "[]");
    const cats = JSON.parse(localStorage.getItem("categories") || "[]");
    
    setMedicines(meds);
    setUsers(usersData);
    setSales(salesData);
    setCategories(cats);
    
    prepareCharts(meds, salesData);
  };

  const prepareCharts = (meds, salesData) => {
    // Sales trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const daySales = salesData.filter(s => 
        new Date(s.date).toLocaleDateString() === dateStr
      ).reduce((sum, s) => sum + (s.total || 0), 0);
      last7Days.push({ 
        date: dateStr.slice(0, 5), 
        sales: daySales,
        orders: salesData.filter(s => new Date(s.date).toLocaleDateString() === dateStr).length
      });
    }
    setSalesChartData(last7Days);
    
    // Stock by category pie chart
    const categoryStock = {};
    meds.forEach(med => {
      categoryStock[med.category] = (categoryStock[med.category] || 0) + med.quantity;
    });
    setStockChartData(Object.entries(categoryStock).map(([name, value]) => ({ name, value })));
    
    // Monthly revenue
    const monthlyData = {};
    salesData.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (sale.total || 0);
    });
    setRevenueChartData(Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue })));
    
    // Category distribution for medicines
    const categoryCount = {};
    meds.forEach(med => {
      categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
    });
    setCategoryChartData(Object.entries(categoryCount).map(([name, count]) => ({ name, count })));
  };

  const handleSubmit = () => {
    if (!form.name || !form.sellingPrice) {
      alert("Please fill required fields");
      return;
    }

    if (editingItem) {
      const updated = medicines.map(m => 
        m.id === editingItem.id ? { ...form, id: m.id } : m
      );
      localStorage.setItem("medicines", JSON.stringify(updated));
    } else {
      const newMedicine = { ...form, id: Date.now() };
      localStorage.setItem("medicines", JSON.stringify([...medicines, newMedicine]));
    }
    
    loadData();
    setShowModal(false);
    setEditingItem(null);
    setForm({
      name: "", category: "", batchNumber: "", manufacturer: "",
      supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
      manufactureDate: "", expiryDate: "", discount: "0"
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const updated = medicines.filter(m => m.id !== id);
      localStorage.setItem("medicines", JSON.stringify(updated));
      loadData();
    }
  };

  const handleApproveSupplier = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadData();
  };

  const handleDeleteUser = (userId) => {
    if (confirm("Delete this user?")) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadData();
    }
  };

  const generateReport = (type) => {
    let data = [], filename = "";
    switch(type) {
      case "sales": data = sales; filename = "sales_report.csv"; break;
      case "inventory": data = medicines; filename = "inventory_report.csv"; break;
      case "lowstock": data = medicines.filter(m => m.quantity < 20); filename = "low_stock.csv"; break;
      case "expired": data = medicines.filter(m => new Date(m.expiryDate) < new Date()); filename = "expired_medicines.csv"; break;
      default: return;
    }
    if(data.length === 0) { alert("No data available"); return; }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => Object.values(item).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => m.quantity < 20).length,
    expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0),
    totalUsers: users.length,
    pendingSuppliers: users.filter(u => u.role === "Supplier" && u.status === "pending").length
  };

  const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="text-blue-100 mt-1">Here's what's happening with your pharmacy today.</p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalMedicines}</p>
              <p className="text-xs text-green-600 mt-2">+12% this month</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-yellow-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Alert</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.lowStock}</p>
              <p className="text-xs text-red-600 mt-2">Need restock!</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-2">+23% vs last month</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-purple-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.pendingSuppliers}</p>
              <p className="text-xs text-purple-600 mt-2">Suppliers waiting</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
              <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Banner */}
      {pendingSuppliers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-400">{pendingSuppliers.length} Supplier(s) Pending Approval</p>
                <p className="text-sm text-amber-600 dark:text-amber-500">Review and approve supplier registrations</p>
              </div>
            </div>
            <button onClick={() => setActiveTab("users")} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition text-sm">
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "overview", label: "Dashboard", icon: Activity },
              { id: "medicines", label: "Medicines", icon: Package },
              { id: "users", label: "Users", icon: Users },
              { id: "reports", label: "Reports", icon: FileText },
              { id: "categories", label: "Categories", icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard/Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      Sales Trend (Last 7 Days)
                    </h3>
                    <span className="text-xs text-gray-400">Daily revenue</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stock Distribution Pie Chart */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Package size={18} className="text-green-500" />
                      Stock by Category
                    </h3>
                    <span className="text-xs text-gray-400">Inventory distribution</span>
                  </div>
                  {stockChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={stockChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                          {stockChartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-gray-500 py-12">No data available</p>}
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Chart */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <DollarSign size={18} className="text-green-500" />
                      Monthly Revenue
                    </h3>
                    <span className="text-xs text-gray-400">Income trend</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution Chart */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Layers size={18} className="text-purple-500" />
                      Medicine Categories
                    </h3>
                    <span className="text-xs text-gray-400">Product count</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart layout="vertical" data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart size={18} className="text-blue-500" />
                    Recent Transactions
                  </h3>
                  <button className="text-blue-600 text-sm hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-left text-sm font-semibold">Invoice</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold">Date</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold">Customer</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold">Amount</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(-5).reverse().map(sale => (
                        <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-3 py-3 text-sm font-mono">{sale.invoiceNo}</td>
                          <td className="px-3 py-3 text-sm">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-sm">{sale.customerName || sale.customer || "Walk-in"}</td>
                          <td className="px-3 py-3 text-sm font-semibold text-green-600">${(sale.total || 0).toFixed(2)}</td>
                          <td className="px-3 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Completed</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Medicines Tab */}
          {activeTab === "medicines" && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button
                  onClick={() => { setEditingItem(null); setForm({ name: "", category: "", batchNumber: "", manufacturer: "", supplier: "", purchasePrice: "", sellingPrice: "", quantity: "", manufactureDate: "", expiryDate: "", discount: "0" }); setShowModal(true); }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 shadow-md"
                >
                  <Plus size={18} /> Add Medicine
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Batch</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Expiry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map(med => (
                      <tr key={med.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                        <td className="px-4 py-3 font-medium">{med.name}</td>
                        <td className="px-4 py-3"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">{med.category}</span></td>
                        <td className="px-4 py-3 text-sm">{med.batchNumber}</td>
                        <td className={`px-4 py-3 font-semibold ${med.quantity < 20 ? "text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-center w-16" : ""}`}>{med.quantity}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">${med.sellingPrice}</td>
                        <td className={`px-4 py-3 text-sm ${new Date(med.expiryDate) < new Date() ? "text-red-600 line-through" : ""}`}>{med.expiryDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(med); setForm(med); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(med.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Pending Suppliers</p>
                  <p className="text-3xl font-bold">{stats.pendingSuppliers}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Active Users</p>
                  <p className="text-3xl font-bold">{users.filter(u => u.status !== "pending").length}</p>
                </div>
              </div>

              {pendingSuppliers.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-3">Pending Approvals</h3>
                  {pendingSuppliers.map(sup => (
                    <div key={sup.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg mb-2">
                      <div><p className="font-semibold">{sup.name}</p><p className="text-sm text-gray-500">{sup.email}</p></div>
                      <button onClick={() => handleApproveSupplier(sup.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><CheckCircle size={16} /> Approve</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : u.role === "Pharmacist" ? "bg-blue-100 text-blue-700" : u.role === "Supplier" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{u.role}</span></td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${u.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{u.status || "approved"}</span></td>
                        <td className="px-4 py-3 text-sm">{u.id ? new Date(u.id).toLocaleDateString() : "N/A"}</td>
                        <td className="px-4 py-3">{u.email !== "admin@pharmacy.com" && <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: "sales", title: "Sales Report", icon: TrendingUp, color: "blue", desc: "All sales transactions" },
                  { id: "inventory", title: "Inventory Report", icon: Package, color: "green", desc: "Current stock status" },
                  { id: "lowstock", title: "Low Stock Report", icon: AlertTriangle, color: "yellow", desc: "Items below 20 units" },
                  { id: "expired", title: "Expired Medicines", icon: XCircle, color: "red", desc: "Expired products list" }
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl transition">
                      <div className={`w-12 h-12 rounded-xl bg-${r.color}-100 dark:bg-${r.color}-900/30 flex items-center justify-center mb-3`}>
                        <Icon className={`w-6 h-6 text-${r.color}-600 dark:text-${r.color}-400`} />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{r.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
                      <button onClick={() => generateReport(r.id)} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <Download size={16} /> Export CSV
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-3">Report Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-sm opacity-80">Total Sales</p><p className="text-2xl font-bold">{stats.totalSales}</p></div>
                  <div><p className="text-sm opacity-80">Revenue</p><p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p></div>
                  <div><p className="text-sm opacity-80">Total Stock</p><p className="text-2xl font-bold">{medicines.reduce((sum, m) => sum + m.quantity, 0)}</p></div>
                  <div><p className="text-sm opacity-80">Avg. Price</p><p className="text-2xl font-bold">${(medicines.reduce((sum, m) => sum + m.sellingPrice, 0) / medicines.length || 0).toFixed(2)}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <Layers size={14} className="text-blue-500" />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingItem ? "✏️ Edit Medicine" : "➕ Add New Medicine"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Medicine Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" />
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Batch Number" value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} className="input" />
                <input placeholder="Manufacturer" value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Supplier" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} className="input" />
                <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Purchase Price" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} className="input" />
                <input type="number" step="0.01" placeholder="Selling Price *" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" placeholder="Manufacture Date" value={form.manufactureDate} onChange={e => setForm({...form, manufactureDate: e.target.value})} className="input" />
                <input type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="input" />
              </div>
              <input type="number" placeholder="Discount (%)" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="input" />
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-5 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md">
                {editingItem ? "Update Medicine" : "Add Medicine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}