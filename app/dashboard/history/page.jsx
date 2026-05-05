"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { History, Eye, Printer } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (!user) router.push("/login");
    const data = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    setPurchases(data.filter(p => p.customerName === user.name));
  }, [user, router]);

  return (
    <div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><History /> Purchase History</h1>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr><th>Invoice</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Action</th></tr></thead>
        <tbody>{purchases.map(p => <tr key={p.id} className="border-t"><td className="py-3 font-mono text-sm">{p.invoiceNo}</td><td>{new Date(p.date).toLocaleDateString()}</td><td>{p.items.reduce((s,i)=>s+i.qty,0)}</td><td className="font-semibold text-green-600">${p.total.toFixed(2)}</td><td>{p.paymentMethod}</td><td><button onClick={()=>setSelectedInvoice(p)} className="text-blue-600"><Eye size={18}/></button></td></tr>)}</tbody></table></div>
      {selectedInvoice && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"><h2 className="text-xl font-bold">Invoice</h2><hr/><p>Invoice: {selectedInvoice.invoiceNo}</p><p>Date: {new Date(selectedInvoice.date).toLocaleString()}</p><hr/>{selectedInvoice.items.map((i,idx)=><div key={idx} className="flex justify-between text-sm"><span>{i.name} x{i.qty}</span><span>${(i.price*i.qty).toFixed(2)}</span></div>)}<hr/><p className="font-bold">Total: ${selectedInvoice.total.toFixed(2)}</p><div className="flex gap-2 mt-4"><button onClick={()=>{ window.print(); }} className="btn-primary flex-1"><Printer size={16}/> Print</button><button onClick={()=>setSelectedInvoice(null)} className="btn-danger flex-1">Close</button></div></div></div>}
    </div>
  );
}