"use client";

import { useState, useEffect } from "react";
import { 
  Package, TrendingUp, AlertTriangle, ShoppingCart, 
  Plus, Minus, X, Search, Printer, CheckCircle,
  DollarSign, Clock, Calendar, Award, Zap,
  BarChart3, Pill, Stethoscope, Heart, Users,
  Truck, Eye, Star, Phone, Mail, MapPin,
  ClipboardList, Box, RefreshCw, Filter, Download
} from "lucide-react";

export default function SupplierPanel() {
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [supplyForm, setSupplyForm] = useState({
    medicineName: "",
    quantity: "",
    price: "",
    expiryDate: "",
    notes: ""
  });
  const [suppliedMedicines, setSuppliedMedicines] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const loadData = () => {
    setIsLoading(true);
    const storedOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    setSupplierOrders(storedOrders);
    
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    
    const storedSupplied = JSON.parse(localStorage.getItem("suppliedMedicines") || "[]");
    setSuppliedMedicines(storedSupplied);
    setIsLoading(false);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = supplierOrders.map(order =>
      order.id === orderId ? { ...order, status: newStatus, deliveryDate: new Date().toISOString() } : order
    );
    localStorage.setItem("supplierOrders", JSON.stringify(updatedOrders));
    setSupplierOrders(updatedOrders);
    alert(`Order status updated to ${newStatus}`);
  };

  const addSupply = () => {
    if (!supplyForm.medicineName || !supplyForm.quantity || !supplyForm.price) {
      alert("Please fill all required fields");
      return;
    }

    const newSupply = {
      id: Date.now(),
      medicineName: supplyForm.medicineName,
      quantity: parseInt(supplyForm.quantity),
      price: parseFloat(supplyForm.price),
      expiryDate: supplyForm.expiryDate,
      notes: supplyForm.notes,
      supplierName: user?.name || "Unknown Supplier",
      suppliedDate: new Date().toISOString(),
      status: "Available"
    };

    const updated = [...suppliedMedicines, newSupply];
    localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
    setSuppliedMedicines(updated);

    const newOrder = {
      id: Date.now(),
      orderId: `ORD-${Date.now()}`,
      medicineName: supplyForm.medicineName,
      quantity: parseInt(supplyForm.quantity),
      price: parseFloat(supplyForm.price),
      orderDate: new Date().toISOString(),
      expectedDelivery: supplyForm.expiryDate,
      status: "Pending",
      supplierName: user?.name || "Unknown Supplier",
      remarks: supplyForm.notes
    };

    const existingOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    localStorage.setItem("supplierOrders", JSON.stringify([...existingOrders, newOrder]));
    setSupplierOrders([...supplierOrders, newOrder]);

    setShowSupplyForm(false);
    setSupplyForm({ medicineName: "", quantity: "", price: "", expiryDate: "", notes: "" });
    alert("Supply added successfully! Order has been created.");
  };

  const deleteSupply = (id) => {
    if (confirm("Are you sure you want to remove this supply?")) {
      const updated = suppliedMedicines.filter(s => s.id !== id);
      localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
      setSuppliedMedicines(updated);
    }
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
      case "Pending": return <Clock size={12} className="inline mr-1" />;
      case "Shipped": return <Truck size={12} className="inline mr-1" />;
      case "Delivered": return <CheckCircle size={12} className="inline mr-1" />;
      default: return null;
    }
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  const filteredOrders = supplierOrders.filter(order => {
    const matchesSearch = order.medicineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: supplierOrders.length,
    pending: supplierOrders.filter(o => o.status === "Pending").length,
    shipped: supplierOrders.filter(o => o.status === "Shipped").length,
    delivered: supplierOrders.filter(o => o.status === "Delivered").length,
    totalSupplies: suppliedMedicines.length,
    totalValue: suppliedMedicines.reduce((sum, s) => sum + (s.price * s.quantity), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="w-7 h-7" /> Welcome, {user?.name || "Supplier"}!
            </h1>
            <p className="text-purple-100 mt-1">Manage your supplies and track orders efficiently.</p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
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
            <div className="bg-purple-100 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Supplies</p>
              <p className="text-2xl font-bold">{stats.totalSupplies}</p>
            </div>
            <Package className="w-8 h-8 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Supply Value</p>
              <p className="text-2xl font-bold">{formatTK(stats.totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "orders" 
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClipboardList size={18} /> My Orders
            </button>
            <button
              onClick={() => setActiveTab("supplies")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "supplies" 
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={18} /> My Supplies
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="all">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Add supplies to create orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
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
                            <td className="px-5 py-3 text-gray-600">{order.quantity}</td>
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
                                    onClick={() => updateOrderStatus(order.id, "Shipped")}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm"
                                  >
                                    <Truck size={14} className="inline mr-1" /> Ship
                                  </button>
                                )}
                                {order.status === "Shipped" && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "Delivered")}
                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition shadow-sm"
                                  >
                                    <CheckCircle size={14} className="inline mr-1" /> Deliver
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
            </div>
          )}

          {/* Supplies Tab */}
          {activeTab === "supplies" && (
            <div className="space-y-4">
              {/* Add Supply Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSupplyForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2 shadow-md"
                >
                  <Plus size={18} /> Add New Supply
                </button>
              </div>

              {/* Supplies List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {suppliedMedicines.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No supplies added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add New Supply" to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price/Unit</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplied Date</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliedMedicines.map((supply, idx) => (
                          <tr key={supply.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-semibold text-gray-800">{supply.medicineName}</td>
                            <td className="px-5 py-3 text-gray-600">{supply.quantity} units</td>
                            <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(supply.price)}</td>
                            <td className="px-5 py-3 text-gray-600">{supply.expiryDate || "N/A"}</td>
                            <td className="px-5 py-3 text-gray-600">{new Date(supply.suppliedDate).toLocaleDateString()}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                <CheckCircle size={12} /> {supply.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => deleteSupply(supply.id)}
                                className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Supply Modal */}
      {showSupplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Add New Supply</h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={supplyForm.medicineName}
                  onChange={(e) => setSupplyForm({...supplyForm, medicineName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-400"
                  placeholder="e.g., Paracetamol"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={supplyForm.quantity}
                  onChange={(e) => setSupplyForm({...supplyForm, quantity: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-400"
                  placeholder="Number of units"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Unit (TK) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={supplyForm.price}
                  onChange={(e) => setSupplyForm({...supplyForm, price: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-400"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={supplyForm.expiryDate}
                  onChange={(e) => setSupplyForm({...supplyForm, expiryDate: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={supplyForm.notes}
                  onChange={(e) => setSupplyForm({...supplyForm, notes: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-400"
                  placeholder="Additional information..."
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={addSupply}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-sm"
              >
                Add Supply
              </button>
              <button
                onClick={() => {
                  setShowSupplyForm(false);
                  setSupplyForm({ medicineName: "", quantity: "", price: "", expiryDate: "", notes: "" });
                }}
                className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}