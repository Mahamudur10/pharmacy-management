"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPanel from "../components/AdminPanel";
import PharmacistPanel from "../components/PharmacistPanel";
import SupplierPanel from "../components/SupplierPanel";
import CustomerPanel from "../components/CustomerPanel";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isClient || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderPanel = () => {
    switch(user.role) {
      case "Admin":
        return <AdminPanel />;
      case "Pharmacist":
        return <PharmacistPanel />;
      case "Supplier":
        return <SupplierPanel />;
      case "Customer":
        return <CustomerPanel />;
      default:
        return <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="text-yellow-800">Unknown Role</p>
        </div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pharmacy Management System</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        {renderPanel()}
      </main>
    </div>
  );
}