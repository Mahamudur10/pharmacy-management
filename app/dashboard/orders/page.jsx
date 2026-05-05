"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Truck, Package, CheckCircle } from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) router.push("/login");
    setOrders(JSON.parse(localStorage.getItem("supplierOrders") || "[]"));
  }, [user, router]);

  const updateStatus = (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem("supplierOrders", JSON.stringify(updated));
    setOrders(updated);
  };

  const getStatusColor = (s) => {
    if(s === "Pending") return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    if(s === "Shipped") return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
    return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Truck className="w-7 h-7" /> My Orders
      </h1>
      
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Medicine</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3 font-mono text-sm">{o.orderId}</td>
                  <td className="px-4 py-3">{o.medicineName}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3">${o.price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "Pending" && (
                      <button 
                        onClick={() => updateStatus(o.id, "Shipped")} 
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                      >
                        Ship Order
                      </button>
                    )}
                    {o.status === "Shipped" && (
                      <button 
                        onClick={() => updateStatus(o.id, "Delivered")} 
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {o.status === "Delivered" && (
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}