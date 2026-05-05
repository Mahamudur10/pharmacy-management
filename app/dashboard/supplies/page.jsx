"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus, Trash2, X } from "lucide-react";

export default function SuppliesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [supplies, setSupplies] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
    const stored = JSON.parse(localStorage.getItem("suppliedMedicines") || "[]");
    setSupplies(stored);
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

    // Create order for pharmacy
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
  };

  const deleteSupply = (id) => {
    if (confirm("Are you sure you want to delete this supply?")) {
      const updated = supplies.filter(s => s.id !== id);
      localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
      setSupplies(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Supplies</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2 shadow-md"
        >
          <Plus size={18} /> Add Supply
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Supplies</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{supplies.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {supplies.reduce((sum, s) => sum + (s.quantity || 0), 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-green-600">
            ${supplies.reduce((sum, s) => sum + ((s.price || 0) * (s.quantity || 0)), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {supplies.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No supplies added yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Supply" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Medicine</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Price/Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Supplied Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply) => (
                  <tr key={supply.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{supply.medicineName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{supply.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">${(supply.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{supply.expiryDate || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(supply.suppliedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {supply.status || "Available"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteSupply(supply.id)}
                        className="text-red-600 hover:text-red-800 transition p-1"
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

      {/* Add Supply Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Supply</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol"
                  value={form.medicineName}
                  onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                <input
                  type="number"
                  placeholder="Number of units"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price per Unit ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={addSupply}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition font-semibold"
              >
                Add Supply
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ medicineName: "", quantity: "", price: "", expiryDate: "" });
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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