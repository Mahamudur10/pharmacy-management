"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, UserPlus, Edit, Trash2, CheckCircle, XCircle, 
  Search, Shield, Stethoscope, Truck, ShoppingBag, 
  Mail, Phone, Calendar, X, Eye, UserCheck, AlertCircle
} from "lucide-react";

export default function UsersPage() {
  const { user, approveSupplier } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "Customer" });

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/dashboard");
      return;
    }
    loadUsers();
  }, [user, router]);

  const loadUsers = () => {
    const data = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(data);
  };

  const handleApproveSupplier = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadUsers();
    alert("Supplier approved successfully!");
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === "admin@pharmacy.com") {
      alert("Cannot delete the main Admin account!");
      return;
    }
    if (confirm(`Are you sure you want to delete ${userToDelete?.name}?`)) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadUsers();
      alert("User deleted successfully!");
    }
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setEditForm({ name: userData.name, email: userData.email, role: userData.role });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!editForm.name || !editForm.email) {
      alert("Please fill all fields");
      return;
    }

    const updated = users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role }
        : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadUsers();
    setShowEditModal(false);
    alert("User updated successfully!");
  };

  const handleAddUser = () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      alert("Please fill all fields");
      return;
    }

    const existing = users.find(u => u.email === addForm.email);
    if (existing) {
      alert("User with this email already exists!");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: addForm.name,
      email: addForm.email,
      password: addForm.password,
      role: addForm.role,
      status: "approved",
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updated));
    loadUsers();
    setShowAddModal(false);
    setAddForm({ name: "", email: "", password: "", role: "Customer" });
    alert("User added successfully!");
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "Admin": return <Shield className="w-4 h-4" />;
      case "Pharmacist": return <Stethoscope className="w-4 h-4" />;
      case "Supplier": return <Truck className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Pharmacist": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Supplier": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "Admin").length,
    pharmacists: users.filter(u => u.role === "Pharmacist").length,
    suppliers: users.filter(u => u.role === "Supplier" && u.status === "approved").length,
    customers: users.filter(u => u.role === "Customer").length,
    pending: pendingSuppliers.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" /> User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all system users and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition flex items-center gap-2 shadow-md"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-blue-500">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-purple-500">
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          <p className="text-xs text-gray-500">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{stats.pharmacists}</p>
          <p className="text-xs text-gray-500">Pharmacists</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-orange-500">
          <p className="text-2xl font-bold text-orange-600">{stats.suppliers}</p>
          <p className="text-xs text-gray-500">Suppliers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
          <p className="text-xs text-gray-500">Customers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border-b-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingSuppliers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-400">Pending Supplier Approvals ({pendingSuppliers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSuppliers.map(sup => (
              <div key={sup.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{sup.name}</p>
                  <p className="text-sm text-gray-500">{sup.email}</p>
                  <p className="text-xs text-amber-600 mt-1">⏳ Waiting for approval</p>
                </div>
                <button
                  onClick={() => handleApproveSupplier(sup.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Supplier">Supplier</option>
            <option value="Customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.status === "pending" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        ⏳ Pending
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✅ Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {u.id ? new Date(u.id).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-blue-600 hover:text-blue-800 transition p-1"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      {u.email !== "admin@pharmacy.com" && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-800 transition p-1"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleUpdateUser} className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
                Save Changes
              </button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleAddUser} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition">
                Add User
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}