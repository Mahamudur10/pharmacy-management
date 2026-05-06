"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  User, Mail, Shield, Calendar, Edit2, Save, X, 
  Camera, Phone, MapPin, Award, Clock, CheckCircle
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: ""
  });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Load user data from localStorage or API
    loadUserData();
  }, [user, router]);

  const loadUserData = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData({
      name: storedUser.name || user?.name || "",
      email: storedUser.email || user?.email || "",
      phone: storedUser.phone || "",
      address: storedUser.address || "",
      bio: storedUser.bio || ""
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Get token
      const token = localStorage.getItem("token");
      
      // Update in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...storedUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update in users array (for persistence)
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map(u => 
        u.email === user.email ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setIsEditing(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setIsLoading(false);
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

  const getRoleIcon = (role) => {
    switch(role) {
      case "Admin": return <Shield className="w-5 h-5" />;
      case "Pharmacist": return <Award className="w-5 h-5" />;
      case "Supplier": return <Truck className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const stats = {
    totalOrders: JSON.parse(localStorage.getItem("customerPurchases") || "[]").filter(
      p => p.customerName === user?.name
    ).length,
    totalSpent: JSON.parse(localStorage.getItem("customerPurchases") || "[]").filter(
      p => p.customerName === user?.name
    ).reduce((sum, p) => sum + (p.total || 0), 0),
    memberSince: user?.id ? new Date(user.id).toLocaleDateString() : "N/A"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            {getRoleIcon(user?.role)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-1">Manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        {/* Avatar Section */}
        <div className="relative px-6">
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
              <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold ${getRoleColor(user?.role)}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? <X size={16} /> : <Edit2 size={16} />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-1 border rounded-lg dark:bg-gray-700"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-1 border rounded-lg dark:bg-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{user?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+880 1XXX XXXXXX"
                      className="w-full px-3 py-1 border rounded-lg dark:bg-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{formData.phone || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Shield className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Role</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRoleColor(user?.role)}`}>
                    {getRoleIcon(user?.role)} {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Address</p>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="2"
                      placeholder="Your address"
                      className="w-full px-3 py-1 border rounded-lg dark:bg-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{formData.address || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Award className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Bio / About</p>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows="2"
                      placeholder="Tell something about yourself"
                      className="w-full px-3 py-1 border rounded-lg dark:bg-gray-700"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{formData.bio || "No bio added yet"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-gray-800 dark:text-white">{stats.memberSince}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Account Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    <CheckCircle size={12} /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards (Customer only) */}
          {user?.role === "Customer" && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Purchase Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">${stats.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button (Edit Mode) */}
          {isEditing && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}