"use client";

import { useState, useEffect } from "react";
import { 
  Package, Users, FileText, AlertTriangle, TrendingUp, 
  Plus, Edit, Trash2, Search, X, Download, 
  DollarSign, Box, Layers, UserCheck, Calendar,
  ShoppingCart, Truck, Activity, Clock, XCircle,
  Award
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const [form, setForm] = useState({
    name: "", category: "", batchNumber: "", manufacturer: "",
    supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
    manufactureDate: "", expiryDate: "", discount: "0"
  });

  const [salesChartData, setSalesChartData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [topSellingData, setTopSellingData] = useState([]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  useEffect(() => {
    loadAllData();
  }, []);

  // লোকাল স্টোরেজ থেকে ডাটা লোড করো (Sidebar এর সাথে মিলানোর জন্য)
  const loadAllData = () => {
    setIsLoading(true);

    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    const storedCats = JSON.parse(localStorage.getItem("categories") || "[]");

    setMedicines(storedMeds);
    setUsers(storedUsers);
    setSales(storedSales);
    setCategories(storedCats);

    prepareCharts(storedMeds, storedSales);
    setIsLoading(false);
  };

  const prepareCharts = (meds, salesData) => {
    let daysToShow = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 90;
    const trendData = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const daySales = salesData.filter(s =>
        new Date(s.date).toLocaleDateString() === dateStr
      ).reduce((sum, s) => sum + (s.total || 0), 0);
      trendData.push({ date: dateStr.slice(0, 5), sales: daySales });
    }
    setSalesChartData(trendData);

    const categoryStock = {};
    meds.forEach(med => {
      if (med.category) {
        categoryStock[med.category] = (categoryStock[med.category] || 0) + (med.quantity || 0);
      }
    });
    setStockChartData(Object.entries(categoryStock).map(([name, value], idx) => ({ id: idx, name, value })));

    const monthlyData = {};
    salesData.forEach(sale => {
      if (sale.date) {
        const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + (sale.total || 0);
      }
    });
    setRevenueChartData(Object.entries(monthlyData).map(([month, revenue], idx) => ({ id: idx, month, revenue })));

    const medicineSales = {};
    salesData.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          medicineSales[item.name] = (medicineSales[item.name] || 0) + (item.quantity || 0);
        });
      }
    });
    const top5 = Object.entries(medicineSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity], idx) => ({ id: idx, name, quantity }));
    setTopSellingData(top5);

    const categoryCount = {};
    meds.forEach(med => {
      if (med.category) {
        categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
      }
    });
    setCategoryChartData(Object.entries(categoryCount).map(([name, count], idx) => ({ id: idx, name, count })));
  };

  useEffect(() => {
    if (medicines.length > 0 || sales.length > 0) {
      prepareCharts(medicines, sales);
    }
  }, [medicines, sales, selectedPeriod]);

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
      alert("Medicine updated successfully!");
    } else {
      const newMedicine = { ...form, id: Date.now() };
      localStorage.setItem("medicines", JSON.stringify([...medicines, newMedicine]));
      alert("Medicine added successfully!");
    }

    loadAllData();
    setShowModal(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const updated = medicines.filter(m => m.id !== id);
      localStorage.setItem("medicines", JSON.stringify(updated));
      loadAllData();
      alert("Medicine deleted successfully!");
    }
  };

  const handleApproveSupplier = (userId) => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadAllData();
    alert("Supplier approved successfully!");
  };

  const handleDeleteUser = (userId) => {
    if (confirm("Delete this user?")) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadAllData();
      alert("User deleted successfully!");
    }
  };

  const generatePDFReport = (type, title) => {
    let data = [];
    if (type === "sales") data = sales;
    else if (type === "inventory") data = medicines;
    else if (type === "lowstock") data = medicines.filter(m => (m.quantity || 0) < 20);
    else if (type === "expired") data = medicines.filter(m => new Date(m.expiryDate) < new Date());

    if (data.length === 0) {
      alert("No data available");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Pharmacy Management System", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(title, pageWidth / 2, 32, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 55);
    doc.text(`Total Records: ${data.length}`, 14, 62);

    if (type === "sales") {
      const totalRevenue = data.reduce((sum, s) => sum + (s.total || 0), 0);
      doc.text(`Total Revenue: TK ${totalRevenue.toFixed(2)}`, 14, 69);
    }

    const headers = Object.keys(data[0]).filter(k => k !== "id" && k !== "_id" && k !== "__v");
    const body = data.map(item => headers.map(h => {
      let val = item[h];
      if (h === "total" || h === "sellingPrice" || h === "purchasePrice") val = `TK ${val}`;
      if (h === "date") val = new Date(val).toLocaleDateString();
      return val || "N/A";
    }));

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 75,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 10, right: 10 },
    });

    doc.save(`${type}_report.pdf`);
  };

  const resetForm = () => {
    setForm({
      name: "", category: "", batchNumber: "", manufacturer: "",
      supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
      manufactureDate: "", expiryDate: "", discount: "0"
    });
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => (m.quantity || 0) < 20).length,
    expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0),
    totalUsers: users.length,
    pendingSuppliers: users.filter(u => u.role === "Supplier" && u.status === "pending").length,
    totalStock: medicines.reduce((sum, m) => sum + (m.quantity || 0), 0),
    avgOrderValue: sales.length > 0 ? sales.reduce((sum, s) => sum + (s.total || 0), 0) / sales.length : 0
  };

  const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-1">
            <button
              key="tab-overview"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Activity size={18} /> Dashboard
            </button>
            <button
              key="tab-medicines"
              onClick={() => setActiveTab("medicines")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${activeTab === "medicines"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Package size={18} /> Medicines
            </button>
            <button
              key="tab-users"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${activeTab === "users"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Users size={18} /> Users
            </button>
            <button
              key="tab-reports"
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${activeTab === "reports"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <FileText size={18} /> Reports
            </button>
            <button
              key="tab-categories"
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${activeTab === "categories"
                  ? "text-pink-600 border-b-2 border-pink-600 bg-pink-50"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Layers size={18} /> Categories
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
                    <p className="text-white/80 mt-1">Here's your pharmacy at a glance</p>
                  </div>
                  <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards - Sidebar এর সংখ্যার সাথে মিলবে */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Medicines</p>
                      <p className="text-3xl font-bold mt-1">{stats.totalMedicines}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Package className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Users className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold mt-1">TK {stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <DollarSign className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Pending Approvals</p>
                      <p className="text-3xl font-bold mt-1">{stats.pendingSuppliers}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <UserCheck className="w-7 h-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Period Selector */}
              <div className="flex justify-end">
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  {["week", "month", "quarter"].map((period, idx) => (
                    <button
                      key={`period-${idx}`}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedPeriod === period
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                      {period === "week" ? "Last 7 Days" : period === "month" ? "Last 30 Days" : "Last 90 Days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" /> Sales Trend
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-green-500" /> Stock Distribution
                  </h3>
                  <div className="h-72">
                    {stockChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stockChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                            {stockChartData.map((entry, idx) => (
                              <Cell key={`stock-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-gray-500 py-12">No data available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-500" /> Monthly Revenue
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-amber-500" /> Top Selling
                  </h3>
                  <div className="h-72">
                    {topSellingData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topSellingData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                          <XAxis type="number" stroke="#94a3b8" />
                          <YAxis type="category" dataKey="name" width={80} stroke="#94a3b8" />
                          <Tooltip />
                          <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-gray-500 py-12">No sales data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" /> Recent Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(-5).reverse().map((sale, idx) => (
                        <tr key={`sale-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-sm font-mono">{sale.invoiceNo || "N/A"}</td>
                          <td className="px-4 py-3 text-sm">{sale.date ? new Date(sale.date).toLocaleDateString() : "N/A"}</td>
                          <td className="px-4 py-3 text-sm">{sale.customerName || sale.customer || "Walk-in"}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">TK {(sale.total || 0).toFixed(2)}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Completed</span></td>
                        </tr>
                      ))}
                      {sales.length === 0 && (
                        <tr key="empty-sales">
                          <td colSpan="5" className="text-center py-8 text-gray-500">No transactions yet</td>
                        </tr>
                      )}
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
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat, idx) => <option key={`cat-opt-${idx}`} value={cat}>{cat}</option>)}
                </select>
                <button
                  onClick={() => { setEditingItem(null); resetForm(); setShowModal(true); }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 shadow-md"
                >
                  <Plus size={18} /> Add Medicine
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Batch</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Stock</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Expiry</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.map((med) => (
                        <tr key={med.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition">
                          <td className="px-5 py-3 font-medium">{med.name}</td>
                          <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{med.category || "N/A"}</span></td>
                          <td className="px-5 py-3 text-gray-600 text-sm font-mono">{med.batchNumber || "N/A"}</td>
                          <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(med.quantity || 0) < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{med.quantity || 0}</span></td>
                          <td className="px-5 py-3"><span className="font-semibold text-green-600">TK {med.sellingPrice}</span>{med.discount > 0 && <span className="ml-1 text-xs text-gray-400 line-through">TK {med.purchasePrice}</span>}</td>
                          <td className="px-5 py-3"><span className={`text-sm ${new Date(med.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>{med.expiryDate || "N/A"}</span></td>
                          <td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => { setEditingItem(med); setForm(med); setShowModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"><Edit size={16} /></button><button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><Trash2 size={16} /></button></div></td>
                        </tr>
                      ))}
                      {filteredMedicines.length === 0 && (
                        <tr key="empty-medicines">
                          <td colSpan="7" className="text-center py-12"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No medicines found</p></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white"><p className="text-sm">Total Users</p><p className="text-2xl font-bold">{stats.totalUsers}</p></div>
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white"><p className="text-sm">Pending Suppliers</p><p className="text-2xl font-bold">{stats.pendingSuppliers}</p></div>
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white"><p className="text-sm">Active Users</p><p className="text-2xl font-bold">{users.filter(u => u.status !== "pending").length}</p></div>
              </div>

              {pendingSuppliers.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-800 mb-3">Pending Approvals</h3>
                  {pendingSuppliers.map((sup) => (
                    <div key={sup.id} className="flex justify-between items-center p-3 bg-white rounded-lg mb-2 shadow-sm">
                      <div><p className="font-semibold">{sup.name}</p><p className="text-sm text-gray-500">{sup.email}</p></div>
                      <button onClick={() => handleApproveSupplier(sup.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><CheckCircle size={16} /> Approve</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Joined</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-medium">{u.name}</td>
                        <td className="px-5 py-3">{u.email}</td>
                        <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : u.role === "Pharmacist" ? "bg-blue-100 text-blue-700" : u.role === "Supplier" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{u.role}</span></td>
                        <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs ${u.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{u.status === "approved" ? "Active" : "Pending"}</span></td>
                        <td className="px-5 py-3 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.id ? new Date(u.id).toLocaleDateString() : "N/A"}</td>
                        <td className="px-5 py-3 text-center">{u.email !== "admin@pharmacy.com" && <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18} /></button>}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr key="empty-users">
                        <td colSpan="6" className="text-center py-12"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No users found</p></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "sales", title: "Sales Report", icon: TrendingUp, color: "blue", desc: "All sales transactions", type: "sales" },
                { id: "inventory", title: "Inventory Report", icon: Package, color: "green", desc: "Current stock status", type: "inventory" },
                { id: "lowstock", title: "Low Stock Report", icon: AlertTriangle, color: "yellow", desc: "Items below 20 units", type: "lowstock" },
                { id: "expired", title: "Expired Medicines", icon: XCircle, color: "red", desc: "Expired products list", type: "expired" }
              ].map((r, idx) => {
                const Icon = r.icon;
                return (
                  <div key={r.id || idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition">
                    <div className={`w-12 h-12 rounded-xl bg-${r.color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 text-${r.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{r.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
                    <button onClick={() => generatePDFReport(r.type, r.title)} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat, idx) => (
                <div key={`cat-item-${idx}`} className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <Layers size={14} className="text-blue-500" />
                  <span>{cat}</span>
                </div>
              ))}
              {categories.length === 0 && <p className="text-gray-500 text-center py-8">No categories added yet</p>}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingItem ? "Edit Medicine" : "Add New Medicine"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Medicine Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
                <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Batch Number" value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} className="input" />
                <input placeholder="Manufacturer" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input" />
                <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Purchase Price" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} className="input" />
                <input type="number" step="0.01" placeholder="Selling Price *" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" placeholder="Manufacture Date" value={form.manufactureDate} onChange={e => setForm({ ...form, manufactureDate: e.target.value })} className="input" />
                <input type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="input" />
              </div>
              <input type="number" placeholder="Discount (%)" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="input" />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">{editingItem ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}