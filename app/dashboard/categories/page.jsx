"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Layers, Plus, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!user || user.role !== "Admin") router.push("/dashboard");
    const data = JSON.parse(localStorage.getItem("categories") || "[]");
    setCategories(data);
  }, [user, router]);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, newCategory];
    localStorage.setItem("categories", JSON.stringify(updated));
    setCategories(updated);
    setNewCategory("");
  };

  const deleteCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    localStorage.setItem("categories", JSON.stringify(updated));
    setCategories(updated);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 input"
          />
          <button onClick={addCategory} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">{cat}</span>
              <button onClick={() => deleteCategory(idx)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}