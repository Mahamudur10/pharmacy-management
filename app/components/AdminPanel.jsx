"use client";

import { useState, useEffect } from "react";
import { 
  Package, Users, FileText, AlertTriangle, TrendingUp, 
  Plus, Edit, Trash2, CheckCircle, XCircle, Eye,
  Download, Search, Calendar, Box, UserCheck, Layers
} from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("medicines");
  const [medicines, setMedicines] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Form state for medicine
  const [medicineForm, setMedicineForm] = useState({
    name: "", category: "", batchNumber: "", manufacturer: "",
    supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
    manufactureDate: "", expiryDate: "", discount: "0"
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
    checkAlerts();
  }, []);

  const loadData = () => {
    setMedicines(JSON.parse(localStorage.getItem("medicines") || "[]"));
    setUsers(JSON.parse(localStorage.getItem("users") || "[]"));
    setCategories(JSON.parse(localStorage.getItem("categories") || "[]"));
    setSales(JSON.parse(localStorage.getItem("sales") || "[]"));
  };

  const checkAlerts = () => {
    const meds = JSON.parse(localStorage.getItem("medicines") || "[]");
    const alerts = [];
    
    // Low stock alerts
    meds.forEach(med => {
      if (med.quantity < 20) {
        alerts.push({ type: "low_stock", medicine: med.name, quantity: med.quantity });
      }
      // Expiry alerts (within 60 days)
      const expiryDate = new Date(med.expiryDate);
      const today = new Date();
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 60 && daysLeft > 0) {
        alerts.push({ type: "expiry", medicine: med.name, daysLeft });
      }
    });
    setNotifications(alerts);
  };

  // Medicine CRUD
  const handleAddMedicine = () => {
    if (!medicineForm.name || !medicineForm.category || !medicineForm.sellingPrice) {
      alert("Please fill all required fields");
      return;
    }

    if (editingItem) {
      const updated = medicines.map(m => 
        m.id === editingItem.id ? { ...medicineForm, id: m.id } : m
      );
      localStorage.setItem("medicines", JSON.stringify(updated));
    } else {
      const newMedicine = { ...medicineForm, id: Date.now() };
      const updated = [...medicines, newMedicine];
      localStorage.setItem("medicines", JSON.stringify(updated));
    }
    
    loadData();
    setShowModal(false);
    setEditingItem(null);
    resetForm();
    checkAlerts();
  };

  const handleDeleteMedicine = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      const updated = medicines.filter(m => m.id !== id);
      localStorage.setItem("medicines", JSON.stringify(updated));
      loadData();
    }
  };

  const handleEditMedicine = (medicine) => {
    setEditingItem(medicine);
    setMedicineForm(medicine);
    setShowModal(true);
  };

  const resetForm = () => {
    setMedicineForm({
      name: "", category: "", batchNumber: "", manufacturer: "",
      supplier: "", purchasePrice: "", sellingPrice: "", quantity: "",
      manufactureDate: "", expiryDate: "", discount: "0"
    });
  };

  // User Management
  const handleApproveSupplier = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadData();
  };

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadData();
    }
  };

  // Reports
  const generateReport = (type) => {
    let reportData = [];
    let filename = "";
    
    switch(type) {
      case "sales":
        reportData = sales;
        filename = "sales_report.csv";
        break;
      case "inventory":
        reportData = medicines;
        filename = "inventory_report.csv";
        break;
      case "expired":
        const today = new Date();
        reportData = medicines.filter(m => new Date(m.expiryDate) < today);
        filename = "expired_medicines.csv";
        break;
      case "lowstock":
        reportData = medicines.filter(m => m.quantity < 20);
        filename = "low_stock_report.csv";
        break;
      default:
        return;
    }
    
    // Create CSV
    const headers = Object.keys(reportData[0] || {}).join(",");
    const rows = reportData.map(item => Object.values(item).join(","));
    const csv = [headers, ...rows].join("\n");
    
    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Statistics
  const stats = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => m.quantity < 20).length,
    expired: medicines.filter(m => new Date(m.expiryDate) < new Date()).length,
    totalUsers: users.length,
    pendingSuppliers: users.filter(u => u.role === "Supplier" && u.status === "pending").length,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0)
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-2xl font-bold">{stats.totalMedicines}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expired Medicines</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> Alerts
          </h3>
          <div className="space-y-1">
            {notifications.map((alert, idx) => (
              <p key={idx} className="text-sm text-yellow-700">
                {alert.type === "low_stock" 
                  ? `⚠️ Low stock: ${alert.medicine} (Only ${alert.quantity} left)`
                  : `⚠️ Expiring soon: ${alert.medicine} (${alert.daysLeft} days left)`
                }
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: "medicines", label: "Medicines", icon: Package },
            { id: "users", label: "Users", icon: Users },
            { id: "reports", label: "Reports", icon: FileText },
            { id: "categories", label: "Categories", icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 border-b-2 transition ${
                activeTab === tab.id 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Medicines Tab */}
      {activeTab === "medicines" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Batch</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Selling Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{med.name}</td>
                    <td className="px-4 py-3">{med.category}</td>
                    <td className="px-4 py-3">{med.batchNumber}</td>
                    <td className="px-4 py-3">
                      <span className={med.quantity < 20 ? "text-red-600 font-semibold" : ""}>
                        {med.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">${med.sellingPrice}</td>
                    <td className="px-4 py-3">
                      <span className={new Date(med.expiryDate) < new Date() ? "text-red-600" : ""}>
                        {med.expiryDate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMedicine(med)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <UserCheck size={18} /> User Management
            </h3>
          </div>
          
          {pendingSuppliers.length > 0 && (
            <div className="p-4 bg-yellow-50 border-b">
              <h4 className="font-semibold mb-2">Pending Approvals ({pendingSuppliers.length})</h4>
              {pendingSuppliers.map(supplier => (
                <div key={supplier.id} className="flex justify-between items-center p-2 bg-white rounded mb-2">
                  <div>
                    <p className="font-semibold">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.email}</p>
                  </div>
                  <button
                    onClick={() => handleApproveSupplier(supplier.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {user.status || "approved"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.email !== "admin@pharmacy.com" && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Sales Report
            </h3>
            <button
              onClick={() => generateReport("sales")}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Sales Report (CSV)
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package size={18} /> Inventory Report
            </h3>
            <button
              onClick={() => generateReport("inventory")}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Inventory (CSV)
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <XCircle size={18} /> Expired Medicines
            </h3>
            <button
              onClick={() => generateReport("expired")}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Expired List (CSV)
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Low Stock Report
            </h3>
            <button
              onClick={() => generateReport("lowstock")}
              className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Low Stock (CSV)
            </button>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Manage Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">
                {editingItem ? "Edit Medicine" : "Add New Medicine"}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Medicine Name *"
                  value={medicineForm.name}
                  onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                  className="input"
                />
                <select
                  value={medicineForm.category}
                  onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Batch Number"
                  value={medicineForm.batchNumber}
                  onChange={(e) => setMedicineForm({...medicineForm, batchNumber: e.target.value})}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Manufacturer"
                  value={medicineForm.manufacturer}
                  onChange={(e) => setMedicineForm({...medicineForm, manufacturer: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Supplier"
                  value={medicineForm.supplier}
                  onChange={(e) => setMedicineForm({...medicineForm, supplier: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={medicineForm.quantity}
                  onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Purchase Price"
                  value={medicineForm.purchasePrice}
                  onChange={(e) => setMedicineForm({...medicineForm, purchasePrice: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Selling Price *"
                  value={medicineForm.sellingPrice}
                  onChange={(e) => setMedicineForm({...medicineForm, sellingPrice: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Manufacture Date"
                  value={medicineForm.manufactureDate}
                  onChange={(e) => setMedicineForm({...medicineForm, manufactureDate: e.target.value})}
                  className="input"
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={medicineForm.expiryDate}
                  onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})}
                  className="input"
                />
              </div>
              
              <input
                type="number"
                placeholder="Discount (%)"
                value={medicineForm.discount}
                onChange={(e) => setMedicineForm({...medicineForm, discount: e.target.value})}
                className="input"
              />
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? "Update" : "Add"} Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}