"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Layers, Plus, Trash2, Tag, FolderOpen, 
  AlertCircle, CheckCircle, X, Zap
} from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/dashboard");
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = () => {
    const data = JSON.parse(localStorage.getItem("categories") || "[]");
    setCategories(data);
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      setErrorMsg("Please enter a category name");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    // Check for duplicate
    if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      setErrorMsg("Category already exists!");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setIsSubmitting(true);
    
    const updated = [...categories, newCategory.trim()];
    localStorage.setItem("categories", JSON.stringify(updated));
    setCategories(updated);
    setNewCategory("");
    setSuccessMsg("Category added successfully!");
    
    setTimeout(() => {
      setSuccessMsg("");
      setIsSubmitting(false);
    }, 3000);
  };

  const deleteCategory = (index, categoryName) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      const updated = categories.filter((_, i) => i !== index);
      localStorage.setItem("categories", JSON.stringify(updated));
      setCategories(updated);
      setSuccessMsg("Category deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addCategory();
    }
  };

  const stats = {
    total: categories.length,
    active: categories.filter(c => c).length
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-md">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize your medicines by categories</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Categories</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FolderOpen className="w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Active Categories</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Tag className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Pain Relief, Antibiotic, Vitamin..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 Press Enter to quickly add category
              </p>
            </div>
            <div className="sm:mt-6">
              <button
                onClick={addCategory}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Plus size={18} /> Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Tag size={18} className="text-purple-500" />
              All Categories ({categories.length})
            </h2>
            {categories.length > 0 && (
              <span className="text-xs text-gray-400">Click on delete to remove</span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No categories yet</h3>
              <p className="text-sm text-gray-400 mt-1">Add your first category to organize medicines</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="group relative bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-xl p-3 transition-all duration-200 border border-gray-100 hover:border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                        <Tag size={14} className="text-purple-600" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm truncate max-w-[100px]">
                        {cat}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCategory(idx, cat)}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Zap size={18} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Quick Tips</h3>
            <p className="text-xs text-gray-600 mt-1">
              Categories help organize your medicines. Examples: Pain Relief, Antibiotic, Vitamin, First Aid, Gastric Care
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}