"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  ShoppingCart, Search, Plus, Minus, X, Printer, 
  DollarSign, Users, Package, AlertTriangle, CheckCircle,
  Trash2, Eye, CreditCard, Clock, Calendar
} from "lucide-react";

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
    loadData();
  }, [user, router]);

  const loadData = () => {
    setIsLoading(true);
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    setIsLoading(false);
  };

  const addToCart = (med) => {
    const existing = cart.find(i => i.id === med.id);
    if (existing) {
      if (existing.qty + 1 > med.quantity) { 
        alert(`Only ${med.quantity} items available in stock!`); 
        return; 
      }
      setCart(cart.map(i => i.id === med.id ? { 
        ...i, 
        qty: i.qty + 1, 
        total: (i.qty + 1) * i.price 
      } : i));
    } else {
      setCart([...cart, { 
        id: med.id, 
        name: med.name, 
        price: med.sellingPrice, 
        qty: 1, 
        total: med.sellingPrice,
        category: med.category,
        batch: med.batchNumber
      }]);
    }
  };

  const updateQty = (id, change) => {
    const item = cart.find(i => i.id === id);
    const med = medicines.find(m => m.id === id);
    const newQty = item.qty + change;
    if (newQty < 1) { 
      removeFromCart(id); 
      return; 
    }
    if (newQty > med.quantity) { 
      alert(`Only ${med.quantity} items available!`); 
      return; 
    }
    setCart(cart.map(i => i.id === id ? { 
      ...i, 
      qty: newQty, 
      total: newQty * i.price 
    } : i));
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;

  const processSale = () => {
    if (cart.length === 0) { 
      alert("Cart is empty!"); 
      return; 
    }
    
    const updatedMeds = medicines.map(med => {
      const sold = cart.find(i => i.id === med.id);
      return sold ? { ...med, quantity: med.quantity - sold.qty } : med;
    });
    localStorage.setItem("medicines", JSON.stringify(updatedMeds));
    
    const invoiceData = { 
      id: Date.now(), 
      invoiceNo: `INV-${Date.now()}`, 
      date: new Date().toISOString(), 
      customerName: customerName || "Walk-in Customer", 
      items: cart, 
      subtotal: subtotal, 
      tax: tax, 
      total: grandTotal,
      paymentMethod: "Cash"
    };
    
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    localStorage.setItem("sales", JSON.stringify([...sales, invoiceData]));
    
    setInvoice(invoiceData);
    setCart([]);
    setCustomerName("");
    loadData();
  };

  const filteredMeds = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockCount = medicines.filter(m => (m.quantity || 0) < 20).length;
  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl shadow-md">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sell Medicine</h1>
            <p className="text-sm text-gray-500 mt-0.5">Process customer purchases quickly</p>
          </div>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">{lowStockCount} items low in stock</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{medicines.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cart Items</p>
              <p className="text-2xl font-bold text-emerald-600">{cart.length}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cart Total</p>
              <p className="text-2xl font-bold text-emerald-600">{formatTK(subtotal)}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-blue-500" />
              Available Medicines ({filteredMeds.length})
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
            {filteredMeds.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medicines found</p>
              </div>
            ) : (
              filteredMeds.map((m) => (
                <div key={m.id} className="p-4 hover:bg-gray-50 transition group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{m.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{m.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${(m.quantity || 0) < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          Stock: {m.quantity}
                        </span>
                      </div>
                      <p className="text-emerald-600 font-bold mt-2">{formatTK(m.sellingPrice)}</p>
                      {m.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">{formatTK(m.purchasePrice)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(m)}
                      disabled={m.quantity === 0}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-500" />
                Shopping Cart ({cart.length} items)
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add medicines from the list</p>
            </div>
          ) : (
            <>
              <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100">
                {cart.map((i) => (
                  <div key={i.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{i.name}</p>
                        <p className="text-sm text-gray-500">{formatTK(i.price)} each</p>
                      </div>
                      <button onClick={() => removeFromCart(i.id)} className="text-red-500 hover:text-red-700 p-1">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQty(i.id, -1)} 
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-semibold w-8 text-center">{i.qty}</span>
                        <button 
                          onClick={() => updateQty(i.id, 1)} 
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-semibold text-emerald-600">{formatTK(i.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatTK(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (5%):</span>
                    <span>{formatTK(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-emerald-600">{formatTK(grandTotal)}</span>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Customer Name (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 placeholder:text-gray-400"
                    />
                    <button
                      onClick={processSale}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition font-semibold shadow-sm"
                    >
                      Complete Sale
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="text-center p-5 border-b border-gray-100">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
              <p className="text-gray-500">Thank you for your purchase</p>
            </div>
            
            <div className="p-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">🧾 Pharmacy Management System</h3>
                <p className="text-gray-500 text-sm">123 Main Street, City | Tel: +123 456 7890</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div><p className="text-gray-500">Invoice No:</p><p className="font-semibold">{invoice.invoiceNo}</p></div>
                <div><p className="text-gray-500">Date:</p><p className="font-semibold">{new Date(invoice.date).toLocaleString()}</p></div>
                <div><p className="text-gray-500">Customer:</p><p className="font-semibold">{invoice.customerName}</p></div>
                <div><p className="text-gray-500">Payment:</p><p className="font-semibold">Cash</p></div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-3">
                {invoice.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2">
                    <span>{i.name} x {i.qty}</span>
                    <span className="font-semibold">{formatTK(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatTK(invoice.subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax (5%):</span><span>{formatTK(invoice.tax)}</span></div>
                <div className="flex justify-between text-lg font-bold mt-2"><span>Total:</span><span className="text-emerald-600">{formatTK(invoice.total)}</span></div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                  setInvoice(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}