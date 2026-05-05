"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, Package, XCircle } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) router.push("/login");
    loadNotifications();
  }, [user, router]);

  const loadNotifications = () => {
    const medicines = JSON.parse(localStorage.getItem("medicines") || "[]");
    const alerts = [];
    medicines.forEach(med => {
      if (med.quantity < 20) alerts.push({ id: Date.now()+med.id, type: "low_stock", title: "Low Stock", message: `${med.name}: Only ${med.quantity} left`, icon: AlertTriangle, color: "yellow" });
      const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date())/(1000*60*60*24));
      if (daysLeft <= 60 && daysLeft > 0) alerts.push({ id: Date.now()+med.id+100, type: "expiry", title: "Expiring Soon", message: `${med.name} expires in ${daysLeft} days`, icon: Package, color: "red" });
    });
    setNotifications(alerts);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6"><Bell className="w-8 h-8 text-blue-600" /><h1 className="text-2xl font-bold">Notifications</h1></div>
      {notifications.length === 0 ? <div className="card text-center py-12"><Bell className="w-16 h-16 text-gray-400 mx-auto mb-4"/><p>No notifications</p></div> : 
        <div className="space-y-3">{notifications.map(n => { const Icon = n.icon; return (
          <div key={n.id} className={`card border-l-4 border-${n.color}-500`}>
            <div className="flex gap-3"><Icon className={`w-5 h-5 text-${n.color}-600`}/><div><h3 className="font-semibold">{n.title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p></div></div>
          </div>
        )})}</div>}
    </div>
  );
}