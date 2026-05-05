"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus, AlertTriangle } from "lucide-react";

export default function StockPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!user) router.push("/login");
    loadMeds();
  }, [user, router]);

  const loadMeds = () => setMedicines(JSON.parse(localStorage.getItem("medicines") || "[]"));

  const updateStock = (id) => {
    const addQty = quantities[id] || 0;
    if (addQty <= 0) { alert("Enter quantity"); return; }
    const updated = medicines.map(m => m.id === id ? { ...m, quantity: m.quantity + addQty } : m);
    localStorage.setItem("medicines", JSON.stringify(updated));
    loadMeds();
    setQuantities({ ...quantities, [id]: 0 });
    alert("Stock updated");
  };

  return (
    <div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package /> Update Stock</h1>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr><th>Medicine</th><th>Current</th><th>Add</th><th>Expiry</th><th>Action</th></tr></thead>
        <tbody>{medicines.map(m => <tr key={m.id} className="border-t"><td className="py-3">{m.name}</td><td className={`py-3 ${m.quantity<20?"text-red-600 font-bold":""}`}>{m.quantity}</td>
        <td className="py-3"><input type="number" min="0" value={quantities[m.id]||0} onChange={e => setQuantities({...quantities,[m.id]:parseInt(e.target.value)||0})} className="w-24 input py-1"/></td>
        <td className="py-3">{m.expiryDate}</td><td className="py-3"><button onClick={()=>updateStock(m.id)} className="btn-primary px-3 py-1"><Plus size={16}/> Add</button></td></tr>)}</tbody></table></div>
    </div>
  );
}