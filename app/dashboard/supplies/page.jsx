"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Package, Plus, Trash2 } from "lucide-react";

export default function SuppliesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [supplies, setSupplies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ medicineName: "", quantity: "", price: "", expiryDate: "" });

  useEffect(() => {
    if (!user) router.push("/login");
    setSupplies(JSON.parse(localStorage.getItem("suppliedMedicines") || "[]"));
  }, [user, router]);

  const addSupply = () => {
    if (!form.medicineName || !form.quantity || !form.price) { alert("Fill all fields"); return; }
    const newSupply = { id: Date.now(), medicineName: form.medicineName, quantity: parseInt(form.quantity), price: parseFloat(form.price), expiryDate: form.expiryDate, supplierName: user.name, suppliedDate: new Date().toISOString() };
    const updated = [...supplies, newSupply];
    localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
    setSupplies(updated);
    const order = { id: Date.now(), orderId: `ORD-${Date.now()}`, medicineName: form.medicineName, quantity: parseInt(form.quantity), price: parseFloat(form.price), orderDate: new Date().toISOString(), status: "Pending", supplierName: user.name };
    const orders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    localStorage.setItem("supplierOrders", JSON.stringify([...orders, order]));
    setShowForm(false);
    setForm({ medicineName: "", quantity: "", price: "", expiryDate: "" });
    alert("Supply added!");
  };

  const deleteSupply = (id) => {
    if(confirm("Delete?")) { const updated = supplies.filter(s => s.id !== id); localStorage.setItem("suppliedMedicines", JSON.stringify(updated)); setSupplies(updated); }
  };

  return (
    <div className="animate-fade-in"><div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Package /> My Supplies</h1><button onClick={()=>setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add Supply</button></div>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Expiry</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>{supplies.map(s => <tr key={s.id} className="border-t"><td className="py-3">{s.medicineName}</td><td>{s.quantity}</td><td>${s.price}</td><td>{s.expiryDate}</td><td>{new Date(s.suppliedDate).toLocaleDateString()}</td><td><button onClick={()=>deleteSupply(s.id)} className="text-red-600"><Trash2 size={18}/></button></td></tr>)}</tbody>}</table></div>
      {showForm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96"><h3 className="text-xl font-bold mb-4">Add Supply</h3><input placeholder="Medicine Name" className="input mb-2" onChange={e=>setForm({...form, medicineName:e.target.value})}/><input placeholder="Quantity" type="number" className="input mb-2" onChange={e=>setForm({...form, quantity:e.target.value})}/><input placeholder="Price" type="number" className="input mb-2" onChange={e=>setForm({...form, price:e.target.value})}/><input type="date" className="input mb-4" onChange={e=>setForm({...form, expiryDate:e.target.value})}/><div className="flex gap-2"><button onClick={addSupply} className="btn-primary flex-1">Save</button><button onClick={()=>setShowForm(false)} className="btn-danger flex-1">Cancel</button></div></div></div>}
    </div>
  );
}