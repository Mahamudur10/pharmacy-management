"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { FileText, Download, TrendingUp, Package, AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (!user) router.push("/login");
    setSales(JSON.parse(localStorage.getItem("sales") || "[]"));
    setMedicines(JSON.parse(localStorage.getItem("medicines") || "[]"));
  }, [user, router]);

  const generateReport = (type) => {
    let data = [], filename = "";
    switch(type) {
      case "sales": data = sales; filename = "sales_report.csv"; break;
      case "inventory": data = medicines; filename = "inventory_report.csv"; break;
      case "lowstock": data = medicines.filter(m => m.quantity < 20); filename = "low_stock.csv"; break;
      default: return;
    }
    if(data.length === 0) { alert("No data available"); return; }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => Object.values(item).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { id: "sales", title: "Sales Report", icon: TrendingUp, color: "blue", desc: "Download all sales transactions" },
    { id: "inventory", title: "Inventory Report", icon: Package, color: "green", desc: "Current stock status" },
    { id: "lowstock", title: "Low Stock Report", icon: AlertTriangle, color: "yellow", desc: "Items below 20 units" }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6"><FileText className="w-8 h-8 text-blue-600" /><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => { const Icon = r.icon; return (
          <div key={r.id} className="card hover:shadow-lg transition">
            <div className={`w-12 h-12 rounded-full bg-${r.color}-100 dark:bg-${r.color}-900/30 flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 text-${r.color}-600 dark:text-${r.color}-400`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{r.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{r.desc}</p>
            <button onClick={() => generateReport(r.id)} className="w-full btn-primary flex items-center justify-center gap-2"><Download size={16} /> Download CSV</button>
          </div>
        )})}
      </div>
    </div>
  );
}