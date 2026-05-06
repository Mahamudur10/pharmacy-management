"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Package, Plus, Edit, Trash2, Search, X, 
  Layers, AlertTriangle, Box, DollarSign, CheckCircle
} from "lucide-react";

export default function MedicinesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    name: "", category: "", batchNumber: "", manufacturer: "",
    supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
    manufactureDate: "", expiryDate: "", discount: "0"
  });

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/dashboard");
    }
    loadMedicines();
  }, [user, router]);

  const loadMedicines = () => {
    const data = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(data);
  };

  // ডায়নামিক স্ট্যাটস ক্যালকুলেশন
  const stats = {
    total: medicines.length,
    totalStock: medicines.reduce((sum, m) => sum + (parseInt(m.quantity) || 0), 0),
    lowStock: medicines.filter(m => (parseInt(m.quantity) || 0) < 20).length,
    categories: [...new Set(medicines.map(m => m.category).filter(Boolean))].length
  };

  const handleSubmit = async () => {
    // ভ্যালিডেশন
    if (!form.name.trim()) {
      alert("Please enter medicine name");
      return;
    }
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) {
      alert("Please enter valid selling price");
      return;
    }
    if (!form.quantity || parseInt(form.quantity) < 0) {
      alert("Please enter valid quantity");
      return;
    }

    setIsSubmitting(true);

    const medicineData = {
      ...form,
      name: form.name.trim(),
      category: form.category || "Uncategorized",
      batchNumber: form.batchNumber || "N/A",
      manufacturer: form.manufacturer || "N/A",
      supplier: form.supplier || "N/A",
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice),
      quantity: parseInt(form.quantity) || 0,
      manufactureDate: form.manufactureDate || "",
      expiryDate: form.expiryDate || "",
      discount: parseInt(form.discount) || 0
    };

    try {
      if (editingItem) {
        const updated = medicines.map(m => 
          m.id === editingItem.id ? { ...medicineData, id: m.id } : m
        );
        localStorage.setItem("medicines", JSON.stringify(updated));
        setSuccessMsg("Medicine updated successfully!");
      } else {
        const newMedicine = { ...medicineData, id: Date.now() };
        localStorage.setItem("medicines", JSON.stringify([...medicines, newMedicine]));
        setSuccessMsg("Medicine added successfully!");
      }
      
      loadMedicines();
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const updated = medicines.filter(m => m.id !== id);
      localStorage.setItem("medicines", JSON.stringify(updated));
      loadMedicines();
      setSuccessMsg("Medicine deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (medicine) => {
    setEditingItem(medicine);
    setForm({
      name: medicine.name || "",
      category: medicine.category || "",
      batchNumber: medicine.batchNumber || "",
      manufacturer: medicine.manufacturer || "",
      supplier: medicine.supplier || "",
      purchasePrice: medicine.purchasePrice || "",
      sellingPrice: medicine.sellingPrice || "",
      quantity: medicine.quantity || "",
      manufactureDate: medicine.manufactureDate || "",
      expiryDate: medicine.expiryDate || "",
      discount: medicine.discount || "0"
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      name: "", category: "", batchNumber: "", manufacturer: "",
      supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
      manufactureDate: "", expiryDate: "", discount: "0"
    });
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Medicine Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your pharmacy inventory</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 shadow-md"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Stats Cards - ডায়নামিক */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStock}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Box className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock (&lt;20)</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by medicine name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((med) => (
                <tr 
                  key={med.id} 
                  className="border-b border-gray-100 hover:bg-blue-50/40 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{med.name}</span>
                   </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {med.category || "N/A"}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 text-sm font-mono">{med.batchNumber || "N/A"}</span>
                   </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      (med.quantity || 0) < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {(med.quantity || 0) < 20 && <AlertTriangle size={12} />}
                      {med.quantity || 0}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-emerald-600">TK {parseFloat(med.sellingPrice || 0).toFixed(2)}</span>
                      {med.discount > 0 && (
                        <span className="ml-2 text-xs text-gray-400 line-through">TK {parseFloat(med.purchasePrice || 0).toFixed(2)}</span>
                      )}
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${new Date(med.expiryDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {med.expiryDate || "N/A"}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(med)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(med.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                   </td>
                 </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No medicines found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new medicine</p>
                   </td>
                 </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "✏️ Edit Medicine" : "➕ Add New Medicine"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Medicine Name *" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  placeholder="Category" 
                  value={form.category} 
                  onChange={(e) => setForm({...form, category: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Batch Number" 
                  value={form.batchNumber} 
                  onChange={(e) => setForm({...form, batchNumber: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  placeholder="Manufacturer" 
                  value={form.manufacturer} 
                  onChange={(e) => setForm({...form, manufacturer: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Supplier" 
                  value={form.supplier} 
                  onChange={(e) => setForm({...form, supplier: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="number" 
                  placeholder="Quantity *" 
                  value={form.quantity} 
                  onChange={(e) => setForm({...form, quantity: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Purchase Price" 
                  value={form.purchasePrice} 
                  onChange={(e) => setForm({...form, purchasePrice: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Selling Price *" 
                  value={form.sellingPrice} 
                  onChange={(e) => setForm({...form, sellingPrice: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="date" 
                  placeholder="Manufacture Date" 
                  value={form.manufactureDate} 
                  onChange={(e) => setForm({...form, manufactureDate: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="date" 
                  placeholder="Expiry Date" 
                  value={form.expiryDate} 
                  onChange={(e) => setForm({...form, expiryDate: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <input 
                type="number" 
                placeholder="Discount (%)" 
                value={form.discount} 
                onChange={(e) => setForm({...form, discount: e.target.value})} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-2">* Required fields</p>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : (editingItem ? "Update Medicine" : "Add Medicine")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}