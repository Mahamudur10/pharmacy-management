"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  User, Mail, Shield, Calendar, Edit2, Save, X, 
  Camera, Phone, MapPin, Award, Clock, CheckCircle,
  Truck, Stethoscope, ShoppingBag, Heart, Star,
  TrendingUp, Package, DollarSign, Eye, ThumbsUp
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
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
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
      
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map(u => 
        u.email === user.email ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      if (updateUser) updateUser(updatedUser);
      
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
      case "Admin": return "from-purple-500 to-pink-500";
      case "Pharmacist": return "from-blue-500 to-cyan-500";
      case "Supplier": return "from-orange-500 to-red-500";
      default: return "from-green-500 to-emerald-500";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-700";
      case "Pharmacist": return "bg-blue-100 text-blue-700";
      case "Supplier": return "bg-orange-100 text-orange-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "Admin": return <Shield className="w-5 h-5" />;
      case "Pharmacist": return <Stethoscope className="w-5 h-5" />;
      case "Supplier": return <Truck className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const stats = {
    totalOrders: JSON.parse(localStorage.getItem("customerPurchases") || "[]").filter(
      p => p.customerName === user?.name
    ).length,
    totalSpent: JSON.parse(localStorage.getItem("customerPurchases") || "[]").filter(
      p => p.customerName === user?.name
    ).reduce((sum, p) => sum + (p.total || 0), 0),
    memberSince: user?.id ? new Date(user.id).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            {getRoleIcon(user?.role)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-white/80 mt-1">Manage your personal information</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className={`h-32 bg-gradient-to-r ${getRoleColor(user?.role)} relative`}>
          <button className="absolute bottom-3 right-3 bg-black/50 p-2 rounded-lg hover:bg-black/70 transition">
            <Camera size={16} className="text-white" />
          </button>
        </div>
        
        {/* Avatar Section */}
        <div className="relative px-6">
          <div className="absolute -top-12 left-6 group">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg group-hover:scale-105 transition">
              <div className={`w-full h-full rounded-full bg-gradient-to-r ${getRoleColor(user?.role)} flex items-center justify-center text-3xl font-bold text-white shadow-inner`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button className="absolute bottom-1 right-1 bg-blue-500 p-1.5 rounded-full hover:bg-blue-600 transition shadow-md">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div className="flex justify-end pt-2 pb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isEditing 
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-sm"
              }`}
            >
              {isEditing ? <X size={16} /> : <Edit2 size={16} />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <p className="text-gray-800">{user?.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+880 1XXX XXXXXX"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.phone || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getRoleBadgeColor(user?.role)}`}>
                      {getRoleIcon(user?.role)}
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    {isEditing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        rows="2"
                        placeholder="Your address"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.address || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Bio / About</p>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows="3"
                        placeholder="Tell something about yourself"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    ) : (
                      <div>
                        <p className="text-gray-800">
                          {formData.bio || "No bio added yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Member Since</p>
                    <p className="text-gray-800 font-medium">{stats.memberSince}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Account Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle size={14} /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards (Customer only) */}
          {user?.role === "Customer" && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Purchase Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                    </div>
                    <Package className="w-8 h-8 text-white/80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Total Spent</p>
                      <p className="text-2xl font-bold mt-1">{formatTK(stats.totalSpent)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-white/80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Avg. Order</p>
                      <p className="text-2xl font-bold mt-1">{formatTK(stats.totalSpent / (stats.totalOrders || 1))}</p>
                    </div>
                    <Star className="w-8 h-8 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button (Edit Mode) */}
          {isEditing && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition font-medium disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}