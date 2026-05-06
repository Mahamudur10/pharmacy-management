"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Package, Plus, AlertTriangle, Search, Filter, 
  TrendingUp, Clock, Calendar, CheckCircle, XCircle,
  RefreshCw, Download, Printer
} from "lucide-react";

export default function StockPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpiry, setFilterExpiry] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
    loadMeds();
  }, [user, router]);

  const loadMeds = () => {
    setIsLoading(true);
    const stored = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(stored);
    setIsLoading(false);
  };

  const updateStock = (id) => {
    const addQty = quantities[id] || 0;
    if (addQty <= 0) { 
      alert("Please enter a quantity to add"); 
      return; 
    }
    const updated = medicines.map(m => 
      m.id === id ? { ...m, quantity: m.quantity + addQty } : m
    );
    localStorage.setItem("medicines", JSON.stringify(updated));
    loadMeds();
    setQuantities({ ...quantities, [id]: 0 });
    alert("Stock updated successfully!");
  };

  const handleQuantityChange = (id, value) => {
    setQuantities({
      ...quantities,
      [id]: parseInt(value) || 0
    });
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    let matchesExpiry = true;
    if (filterExpiry === "expired") matchesExpiry = daysLeft < 0;
    else if (filterExpiry === "expiring_soon") matchesExpiry = daysLeft <= 60 && daysLeft > 0;
    else if (filterExpiry === "good") matchesExpiry = daysLeft > 60;
    
    return matchesSearch && matchesExpiry;
  });

  const stats = {
    total: medicines.length,
    lowStock: medicines.filter(m => (m.quantity || 0) < 20).length,
    expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
    expiringSoon: medicines.filter(m => {
      const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 60 && daysLeft > 0;
    }).length,
    totalStock: medicines.reduce((sum, m) => sum + (m.quantity || 0), 0),
    totalValue: medicines.reduce((sum, m) => sum + ((m.sellingPrice || 0) * (m.quantity || 0)), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading stock data...</p>
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
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Update medicine stock quantities</p>
          </div>
        </div>
        <button
          onClick={loadMeds}
          className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
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
              <p className="text-gray-500 text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStock}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-emerald-600">{formatTK(stats.totalValue)}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {(stats.lowStock > 0 || stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.lowStock > 0 && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">{stats.lowStock} items low in stock</span>
              </div>
            </div>
          )}
          {stats.expiringSoon > 0 && (
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700">{stats.expiringSoon} items expiring within 60 days</span>
              </div>
            </div>
          )}
          {stats.expired > 0 && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{stats.expired} items have expired</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterExpiry}
              onChange={(e) => setFilterExpiry(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Medicines</option>
              <option value="expiring_soon">Expiring Soon (≤60 days)</option>
              <option value="expired">Expired</option>
              <option value="good">Good Stock (&gt;60 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Add Quantity</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((m) => {
                const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                let expiryStatus = "";
                let expiryColor = "text-gray-500";
                if (daysLeft < 0) { expiryStatus = "Expired"; expiryColor = "text-red-600"; }
                else if (daysLeft <= 60) { expiryStatus = `${daysLeft} days left`; expiryColor = "text-orange-600"; }
                else { expiryStatus = "Good"; expiryColor = "text-green-600"; }
                
                return (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-5 py-3 text-gray-600">{m.category || "N/A"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${(m.quantity || 0) < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {(m.quantity || 0)} units
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min="0"
                        value={quantities[m.id] || 0}
                        onChange={(e) => handleQuantityChange(m.id, e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(m.sellingPrice)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className={`text-sm ${expiryColor}`}>{m.expiryDate || "N/A"}</span>
                        <span className={`text-xs ${expiryColor}`}>{expiryStatus}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => updateStock(m.id)}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 mx-auto shadow-sm"
                      >
                        <Plus size={14} /> Add Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No medicines found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Quick Tips</h3>
            <p className="text-xs text-gray-600 mt-1">
              • Items with less than 20 units are marked as low stock
              <br />• Check expiry dates regularly to avoid waste
              <br />• Add stock in batches to maintain inventory levels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}