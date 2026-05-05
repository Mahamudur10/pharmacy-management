"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Users, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function UsersPage() {
  const { user, approveSupplier } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "Admin") router.push("/dashboard");
    loadUsers();
  }, [user, router]);

  const loadUsers = () => {
    const data = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(data);
  };

  const handleApprove = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updated));
    loadUsers();
  };

  const handleDelete = (userId) => {
    if (confirm("Delete this user?")) {
      const updated = users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(updated));
      loadUsers();
    }
  };

  const pendingSuppliers = users.filter(u => u.role === "Supplier" && u.status === "pending");

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      </div>

      {pendingSuppliers.length > 0 && (
        <div className="card mb-6 border-yellow-500 border-l-4">
          <h2 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3">Pending Approvals ({pendingSuppliers.length})</h2>
          {pendingSuppliers.map(sup => (
            <div key={sup.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
              <div><p className="font-semibold">{sup.name}</p><p className="text-sm text-gray-500">{sup.email}</p></div>
              <button onClick={() => handleApprove(sup.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1">
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t dark:border-gray-700">
                <td className="px-4 py-3">{u.name}</td><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${u.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{u.status || "approved"}</span></td>
                <td className="px-4 py-3">{u.email !== "admin@pharmacy.com" && <button onClick={() => handleDelete(u.id)} className="text-red-600"><Trash2 size={18} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}