"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  ShoppingCart, Search, Plus, Minus, X, Printer, History, Eye, 
  DollarSign, Package, CreditCard, CheckCircle, Calendar, Clock,
  Star, Heart, TrendingUp, Award, Truck, Shield, Users
} from "lucide-react";

export default function CustomerPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("shop");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [invoice, setInvoice] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = () => {
    setIsLoading(true);
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    
    const storedHistory = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    const userHistory = storedHistory.filter(p => p.customerName === user?.name);
    setPurchaseHistory(userHistory);
    setIsLoading(false);
  };

  const addToCart = (medicine) => {
    if (quantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} items available!`);
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity + quantity > medicine.quantity) {
        alert(`Cannot add more than ${medicine.quantity} total!`);
        return;
      }
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + quantity, total: item.price * (item.quantity + quantity) }
          : item
      ));
    } else {
      setCart([...cart, {
        id: medicine.id,
        name: medicine.name,
        category: medicine.category,
        price: medicine.sellingPrice,
        quantity: quantity,
        total: medicine.sellingPrice * quantity,
        discount: medicine.discount || 0
      }]);
    }
    
    setSelectedMedicine(null);
    setQuantity(1);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id, newQuantity) => {
    const medicine = medicines.find(m => m.id === id);
    if (newQuantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} available!`);
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.total || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  const processPurchase = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const updatedMedicines = medicines.map(med => {
      const soldItem = cart.find(item => item.id === med.id);
      if (soldItem) {
        return { ...med, quantity: med.quantity - soldItem.quantity };
      }
      return med;
    });
    localStorage.setItem("medicines", JSON.stringify(updatedMedicines));
    setMedicines(updatedMedicines);

    const cartTotal = calculateTotal();
    const tax = cartTotal * 0.05;
    const grandTotal = cartTotal + tax;

    const invoiceData = {
      id: Date.now(),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: user?.name || "Customer",
      customerEmail: user?.email || "",
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal: cartTotal,
      tax: tax,
      total: grandTotal,
      paymentMethod: paymentMethod,
      status: "Completed"
    };

    const updatedHistory = [...purchaseHistory, invoiceData];
    localStorage.setItem("customerPurchases", JSON.stringify(updatedHistory));
    setPurchaseHistory(updatedHistory);

    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    localStorage.setItem("sales", JSON.stringify([...sales, invoiceData]));

    setInvoice(invoiceData);
    setCart([]);
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case "Cash": return "💵";
      case "Card": return "💳";
      case "Online": return "📱";
      default: return "💰";
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "0.00";
    }
    return price.toFixed(2);
  };

  const formatTK = (amount) => `TK ${(amount || 0).toFixed(2)}`;

  const stats = {
    totalPurchases: purchaseHistory.length,
    totalSpent: purchaseHistory.reduce((sum, p) => sum + (p.total || 0), 0),
    cartItems: cart.length,
    avgOrder: purchaseHistory.length > 0 ? purchaseHistory.reduce((sum, p) => sum + (p.total || 0), 0) / purchaseHistory.length : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-7 h-7" /> Welcome, {user?.name || "Customer"}!
            </h1>
            <p className="text-emerald-100 mt-1">Shop for medicines at best prices</p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPurchases}</p>
              <p className="text-xs text-emerald-600 mt-2">Lifetime orders</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition">
              <Package className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-600">{formatTK(stats.totalSpent)}</p>
              <p className="text-xs text-emerald-600 mt-2">All time</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition">
              <DollarSign className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cart Items</p>
              <p className="text-2xl font-bold text-blue-600">{stats.cartItems}</p>
              <p className="text-xs text-blue-600 mt-2">Ready to checkout</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition">
              <ShoppingCart className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-1">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "shop" 
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShoppingCart size={18} /> Shop Medicines
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "history" 
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History size={18} /> Purchase History
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Shop Tab */}
          {activeTab === "shop" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medicine List */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredMedicines.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No medicines found</p>
                  ) : (
                    filteredMedicines.map((med) => (
                      <div key={med.id} className="bg-white rounded-lg p-3 flex justify-between items-center hover:shadow-md transition group">
                        <div>
                          <p className="font-semibold text-gray-800">{med.name}</p>
                          <p className="text-sm text-gray-500">Category: {med.category}</p>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-emerald-600">{formatTK(med.sellingPrice)}</span>
                            {med.discount > 0 && <span className="ml-2 text-xs text-gray-400 line-through">{formatTK(med.purchasePrice)}</span>}
                          </div>
                          <p className={`text-xs mt-1 ${(med.quantity || 0) < 20 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                            Stock: {med.quantity} units
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMedicine(med);
                            setQuantity(1);
                          }}
                          disabled={med.quantity === 0}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} className="text-emerald-500" />
                  Shopping Cart ({cart.length} items)
                </h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add medicines from the list</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto mb-4">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-500">{formatTK(item.price)} each</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                              <X size={18} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-semibold text-emerald-600">{formatTK(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>{formatTK(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax (5%):</span>
                        <span>{formatTK(calculateTotal() * 0.05)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total:</span>
                        <span className="text-emerald-600">{formatTK(calculateTotal() * 1.05)}</span>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700"
                        >
                          <option value="Cash">💵 Cash</option>
                          <option value="Card">💳 Card</option>
                          <option value="Online">📱 Online Payment</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={processPurchase}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-sm"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* History Tab - Fixed Version */}
          {activeTab === "history" && (
            <div>
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No purchase history yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseHistory.map((purchase, idx) => {
                        const totalAmount = purchase.total || 0;
                        const itemCount = purchase.items ? purchase.items.length : 0;
                        const invoiceNumber = purchase.invoiceNo || "N/A";
                        const purchaseDate = purchase.date ? new Date(purchase.date).toLocaleDateString() : "N/A";
                        const payment = purchase.paymentMethod || "Cash";
                        
                        return (
                          <tr key={purchase.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-mono text-sm text-gray-800">{invoiceNumber}</td>
                            <td className="px-5 py-3 text-gray-600">{purchaseDate}</td>
                            <td className="px-5 py-3 text-gray-600">{itemCount} items</td>
                            <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(totalAmount)}</td>
                            <td className="px-5 py-3 text-gray-600">
                              <span className="flex items-center gap-1">
                                {getPaymentMethodIcon(payment)} {payment}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => setInvoice(purchase)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Invoice"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantity Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Add to Cart</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Medicine</p>
                <p className="font-semibold text-lg text-gray-800">{selectedMedicine.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Price</p>
                  <p className="font-bold text-emerald-600 text-xl">{formatTK(selectedMedicine.sellingPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Available Stock</p>
                  <p className={`font-semibold ${(selectedMedicine.quantity || 0) < 20 ? "text-red-600" : "text-gray-800"}`}>{selectedMedicine.quantity} units</p>
                </div>
              </div>
              {selectedMedicine.discount > 0 && (
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <p className="text-emerald-600 text-sm">🎉 {selectedMedicine.discount}% discount applied!</p>
                </div>
              )}
              <div>
                <label className="block text-gray-600 text-sm mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedMedicine.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedMedicine.quantity))}
                    className="w-20 text-center px-2 py-2 border border-gray-300 rounded-lg"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(selectedMedicine.quantity, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">Total Price</p>
                <p className="text-2xl font-bold text-emerald-600">{formatTK(selectedMedicine.sellingPrice * quantity)}</p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => addToCart(selectedMedicine)}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
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
              
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div><p className="text-gray-500">Invoice No:</p><p className="font-semibold">{invoice.invoiceNo}</p></div>
                <div><p className="text-gray-500">Date:</p><p className="font-semibold">{new Date(invoice.date).toLocaleString()}</p></div>
                <div><p className="text-gray-500">Customer:</p><p className="font-semibold">{invoice.customerName}</p></div>
                <div><p className="text-gray-500">Payment:</p><p className="font-semibold">{invoice.paymentMethod}</p></div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-3">
                {invoice.items && invoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-semibold">{formatTK(item.price * item.quantity)}</span>
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
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>Invoice ${invoice.invoiceNo}</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { text-align: center; }
                        .header { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
                      </style>
                      </head>
                      <body>
                        <div class="header">
                          <h2>🧾 Pharmacy Management System</h2>
                          <p>123 Main Street, City | Tel: +123 456 7890</p>
                        </div>
                        <hr/>
                        <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${invoice.customerName}</p>
                        <hr/>
                        <table>
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${invoice.items && invoice.items.map(item => `
                              <tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatTK(item.price)}</td><td>${formatTK(item.price * item.quantity)}</td></tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <div class="total">
                          <p>Subtotal: ${formatTK(invoice.subtotal)}</p>
                          <p>Tax (5%): ${formatTK(invoice.tax)}</p>
                          <p><strong>Total: ${formatTK(invoice.total)}</strong></p>
                        </div>
                        <p style="text-align: center; margin-top: 30px;">Thank you for your purchase! 🏥</p>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
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