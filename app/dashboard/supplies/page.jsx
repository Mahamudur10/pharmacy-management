"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Package, Plus, Trash2, X, Search, Filter, 
  Calendar, DollarSign, TrendingUp, Clock, CheckCircle,
  Truck, Eye, Edit, RefreshCw
} from "lucide-react";

export default function SuppliesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [supplies, setSupplies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ 
    medicineName: "", 
    quantity: "", 
    price: "", 
    expiryDate: "" 
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadSupplies();
  }, [user, router]);

  const loadSupplies = () => {
    setIsLoading(true);
    const stored = JSON.parse(localStorage.getItem("suppliedMedicines") || "[]");
    setSupplies(stored);
    setIsLoading(false);
  };

  const addSupply = () => {
    if (!form.medicineName || !form.quantity || !form.price) {
      alert("Please fill all fields");
      return;
    }

    const newSupply = {
      id: Date.now(),
      medicineName: form.medicineName,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      expiryDate: form.expiryDate,
      supplierName: user?.name || "Unknown Supplier",
      suppliedDate: new Date().toISOString(),
      status: "Available"
    };

    const updated = [...supplies, newSupply];
    localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
    setSupplies(updated);

    const newOrder = {
      id: Date.now(),
      orderId: `ORD-${Date.now()}`,
      medicineName: form.medicineName,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      orderDate: new Date().toISOString(),
      expectedDelivery: form.expiryDate,
      status: "Pending",
      supplierName: user?.name || "Unknown Supplier",
      remarks: ""
    };

    const existingOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    localStorage.setItem("supplierOrders", JSON.stringify([...existingOrders, newOrder]));

    setShowForm(false);
    setForm({ medicineName: "", quantity: "", price: "", expiryDate: "" });
    alert("Supply added successfully!");
    loadSupplies();
  };

  const deleteSupply = (id) => {
    if (confirm("Are you sure you want to delete this supply?")) {
      const updated = supplies.filter(s => s.id !== id);
      localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
      setSupplies(updated);
      alert("Supply deleted successfully!");
    }
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.medicineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || supply.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: supplies.length,
    totalItems: supplies.reduce((sum, s) => sum + (s.quantity || 0), 0),
    totalValue: supplies.reduce((sum, s) => sum + ((s.price || 0) * (s.quantity || 0)), 0),
    expiringSoon: supplies.filter(s => {
      const daysLeft = Math.ceil((new Date(s.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 60 && daysLeft > 0;
    }).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading supplies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Supplies</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your supplied medicines</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2 shadow-md"
        >
          <Plus size={18} /> Add New Supply
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Supplies</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-emerald-600">{formatTK(stats.totalValue)}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
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
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredSupplies.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No supplies found</p>
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
                {filteredSupplies.map((supply, idx) => (
                  <tr key={supply.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{supply.medicineName}</td>
                    <td className="px-5 py-3 text-gray-600">{supply.quantity} units</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(supply.price)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">{supply.expiryDate || "N/A"}</span>
                        {supply.expiryDate && new Date(supply.expiryDate) < new Date() && (
                          <span className="text-xs text-red-600">Expired</span>
                        )}
                        {supply.expiryDate && new Date(supply.expiryDate) > new Date() && new Date(supply.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 60)) && (
                          <span className="text-xs text-orange-600">Expiring soon</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{new Date(supply.suppliedDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle size={12} /> {supply.status || "Available"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => deleteSupply(supply.id)}
                        className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-start gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Truck size={18} className="text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Quick Tips</h3>
            <p className="text-xs text-gray-600 mt-1">
              • Add supplies to create orders automatically
              <br />• Check expiry dates before adding supplies
              <br />• Track your order status in "My Orders" tab
            </p>
          </div>
        </div>
      </div>

      {/* Add Supply Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Add New Supply</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol"
                  value={form.medicineName}
                  onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  placeholder="Number of units"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Unit (TK) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={addSupply}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl hover:from-orange-600 hover:to-red-600 transition font-semibold shadow-sm"
              >
                Add Supply
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ medicineName: "", quantity: "", price: "", expiryDate: "" });
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