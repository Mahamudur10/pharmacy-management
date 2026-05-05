"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, Search, Plus, Minus, X, CreditCard } from "lucide-react";

export default function ShopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!user) router.push("/login");
    setMedicines(JSON.parse(localStorage.getItem("medicines") || "[]"));
  }, [user, router]);

  const addToCart = (med) => {
    const existing = cart.find(i => i.id === med.id);
    if (existing) {
      if (existing.qty + 1 > med.quantity) { alert("Not enough stock"); return; }
      setCart(cart.map(i => i.id === med.id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price } : i));
    } else {
      setCart([...cart, { id: med.id, name: med.name, price: med.sellingPrice, qty: 1, total: med.sellingPrice }]);
    }
  };

  const updateQty = (id, change) => {
    const item = cart.find(i => i.id === id);
    const med = medicines.find(m => m.id === id);
    const newQty = item.qty + change;
    if (newQty < 1) { removeFromCart(id); return; }
    if (newQty > med.quantity) { alert("Not enough stock"); return; }
    setCart(cart.map(i => i.id === id ? { ...i, qty: newQty, total: newQty * i.price } : i));
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const total = cart.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = total;

  const checkout = () => {
    if (cart.length === 0) { alert("Cart empty"); return; }
    const updatedMeds = medicines.map(med => {
      const sold = cart.find(i => i.id === med.id);
      return sold ? { ...med, quantity: med.quantity - sold.qty } : med;
    });
    localStorage.setItem("medicines", JSON.stringify(updatedMeds));
    const invoiceData = { id: Date.now(), invoiceNo: `INV-${Date.now()}`, date: new Date().toISOString(), customerName: user.name, items: cart, total: grandTotal, paymentMethod };
    const purchases = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    localStorage.setItem("customerPurchases", JSON.stringify([...purchases, invoiceData]));
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    localStorage.setItem("sales", JSON.stringify([...sales, invoiceData]));
    setInvoice(invoiceData);
    setCart([]);
    setMedicines(updatedMeds);
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingCart /> Shop Medicines</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><input type="text" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="input mb-4"/>
          <div className="max-h-[500px] overflow-y-auto space-y-2">{filteredMeds.map(m => <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg"><div><p className="font-semibold">{m.name}</p><p className="text-sm">${m.sellingPrice} | Stock: {m.quantity}</p></div><button onClick={()=>addToCart(m)} disabled={m.quantity===0} className="btn-primary px-3 py-1">Add</button></div>)}</div>
        </div>
        <div className="card"><h3 className="font-bold text-lg mb-4">Cart ({cart.length})</h3>
          {cart.length===0 ? <p className="text-center py-8 text-gray-500">Empty</p> : <div className="space-y-3 max-h-[300px] overflow-y-auto">{cart.map(i => <div key={i.id} className="flex justify-between items-center p-2 border rounded"><div><p className="font-semibold">{i.name}</p><p>${i.price} each</p></div><div className="flex items-center gap-2"><button onClick={()=>updateQty(i.id,-1)} className="p-1 border rounded">-</button><span>{i.qty}</span><button onClick={()=>updateQty(i.id,1)} className="p-1 border rounded">+</button><button onClick={()=>removeFromCart(i.id)} className="text-red-500"><X size={18}/></button></div></div>)}</div>}
          <div className="border-t pt-3"><div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${grandTotal.toFixed(2)}</span></div>
          <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="input mt-3"><option>Cash</option><option>Card</option><option>Online</option></select>
          <button onClick={checkout} className="btn-success w-full mt-3">Checkout</button></div>
        </div>
      </div>
      {invoice && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"><h2 className="text-xl font-bold">Invoice</h2><hr/><p>Invoice: {invoice.invoiceNo}</p><p>Date: {new Date(invoice.date).toLocaleString()}</p><p>Customer: {invoice.customerName}</p><p>Payment: {invoice.paymentMethod}</p><hr/>{invoice.items.map((i,idx)=><div key={idx} className="flex justify-between text-sm"><span>{i.name} x{i.qty}</span><span>${(i.price*i.qty).toFixed(2)}</span></div>)}<hr/><p className="font-bold">Total: ${invoice.total.toFixed(2)}</p><button onClick={()=>{ window.print(); setInvoice(null); }} className="btn-primary w-full mt-3">Print</button><button onClick={()=>setInvoice(null)} className="btn-danger w-full mt-2">Close</button></div></div>}
    </div>
  );
}