"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Users, UserPlus, Edit, Trash2, CheckCircle, XCircle, 
  Search, Shield, Stethoscope, Truck, ShoppingBag, 
  Mail, Phone, Calendar, X, Eye, UserCheck, AlertCircle,
  Filter, Clock, Award, BadgeCheck, MoreHorizontal
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
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleApproveSupplier = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadUsers();
    showSuccess("Supplier approved successfully!");
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === "admin@pharmacy.com") {
      alert("Cannot delete the main Admin account!");
      return;
    }
    if (confirm(`Are you sure you want to delete "${userToDelete?.name}"?`)) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadUsers();
      showSuccess("User deleted successfully!");
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
    showSuccess("User updated successfully!");
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

    setIsLoading(true);
    
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
    setIsLoading(false);
    showSuccess("User added successfully!");
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
      case "Admin": return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200";
      case "Pharmacist": return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200";
      case "Supplier": return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-200";
      default: return "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200";
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return {
        icon: <Clock size={12} />,
        text: "Pending",
        class: "bg-amber-100 text-amber-700 border-amber-200"
      };
    }
    return {
      icon: <BadgeCheck size={12} />,
      text: "Active",
      class: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
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
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage all system users and their roles</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition flex items-center gap-2 shadow-md"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-purple-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          <p className="text-xs text-gray-500 mt-1">Admins</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-blue-600">{stats.pharmacists}</p>
          <p className="text-xs text-gray-500 mt-1">Pharmacists</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-orange-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-orange-600">{stats.suppliers}</p>
          <p className="text-xs text-gray-500 mt-1">Suppliers</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-green-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
          <p className="text-xs text-gray-500 mt-1">Customers</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border-l-4 border-amber-500 shadow-sm hover:shadow-md transition">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingSuppliers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-amber-800">Pending Supplier Approvals ({pendingSuppliers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSuppliers.map(sup => (
              <div key={sup.id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                <div>
                  <p className="font-semibold text-gray-800">{sup.name}</p>
                  <p className="text-sm text-gray-500">{sup.email}</p>
                  <p className="text-xs text-amber-600 mt-1">⏳ Waiting for approval</p>
                </div>
                <button
                  onClick={() => handleApproveSupplier(sup.id)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Supplier">Supplier</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const statusBadge = getStatusBadge(u.status);
                return (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getRoleColor(u.role)} border shadow-sm`}>
                          {getRoleIcon(u.role)}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{u.email}</span>
                     </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)} border`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                     </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.class} border`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                     </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.id ? new Date(u.id).toLocaleDateString() : "N/A"}</span>
                     </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        {u.email !== "admin@pharmacy.com" && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                     </td>
                   </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new user</p>
                   </td>
                 </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">✏️ Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={handleUpdateUser} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">
                Save Changes
              </button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">➕ Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-2">* Required fields</p>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={handleAddUser} disabled={isLoading} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition font-medium disabled:opacity-50">
                {isLoading ? "Adding..." : "Add User"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}