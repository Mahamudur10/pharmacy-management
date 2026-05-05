"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus, Edit, Trash2, Search, X } from "lucide-react";

export default function MedicinesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    
    loadMedicines();
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const updated = medicines.filter(m => m.id !== id);
      localStorage.setItem("medicines", JSON.stringify(updated));
      loadMedicines();
    }
  };

  const handleEdit = (medicine) => {
    setEditingItem(medicine);
    setForm(medicine);
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
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medicine Management</h1>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
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
              <tr key={med.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3">{med.name}</td>
                <td className="px-4 py-3">{med.category}</td>
                <td className="px-4 py-3">{med.batchNumber}</td>
                <td className={`px-4 py-3 ${med.quantity < 20 ? "text-red-600 font-bold" : ""}`}>
                  {med.quantity}
                </td>
                <td className="px-4 py-3">${med.sellingPrice}</td>
                <td className="px-4 py-3">{med.expiryDate}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(med)} className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(med.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? "Edit Medicine" : "Add Medicine"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" />
                <input placeholder="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Batch Number" value={form.batchNumber} onChange={(e) => setForm({...form, batchNumber: e.target.value})} className="input" />
                <input placeholder="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({...form, manufacturer: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Supplier" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} className="input" />
                <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Purchase Price" value={form.purchasePrice} onChange={(e) => setForm({...form, purchasePrice: e.target.value})} className="input" />
                <input type="number" placeholder="Selling Price *" value={form.sellingPrice} onChange={(e) => setForm({...form, sellingPrice: e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" placeholder="Manufacture Date" value={form.manufactureDate} onChange={(e) => setForm({...form, manufactureDate: e.target.value})} className="input" />
                <input type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} className="input" />
              </div>
              <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({...form, discount: e.target.value})} className="input" />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}