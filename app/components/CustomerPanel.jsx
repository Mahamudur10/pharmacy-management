"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Search, Plus, Minus, X, Printer, History, Eye } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome {user?.name || "Customer"}! 👋</h2>
        <p className="text-green-100 mt-1">Shop for medicines at best prices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{purchaseHistory.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">
            ${purchaseHistory.reduce((sum, p) => sum + (p.total || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cart Items</p>
          <p className="text-2xl font-bold text-blue-600">{cart.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("shop")}
              className={`py-3 px-4 transition-all duration-200 rounded-t-lg ${
                activeTab === "shop" 
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              🛍️ Shop Medicines
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-4 transition-all duration-200 rounded-t-lg ${
                activeTab === "history" 
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              📜 Purchase History
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "shop" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredMedicines.map(med => (
                    <div key={med.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-gray-500">Stock: {med.quantity} | ${med.sellingPrice}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMedicine(med);
                          setQuantity(1);
                        }}
                        disabled={med.quantity === 0}
                        className="bg-green-600 text-white px-4 py-1 rounded-lg disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-4">🛒 Shopping Cart ({cart.length})</h3>
                
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between">
                            <span className="font-semibold">{item.name}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500">✕</button>
                          </div>
                          <div className="flex justify-between mt-2">
                            <div className="flex gap-2">
                              <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2 border rounded">-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2 border rounded">+</button>
                            </div>
                            <span>${formatPrice(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Subtotal:</span>
                        <span>${formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Tax (5%):</span>
                        <span>${formatPrice(calculateTotal() * 0.05)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-1">
                        <span>Total:</span>
                        <span>${formatPrice(calculateTotal() * 1.05)}</span>
                      </div>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mt-3"
                      >
                        <option>Cash</option>
                        <option>Card</option>
                        <option>Online</option>
                      </select>
                      <button
                        onClick={processPurchase}
                        className="w-full bg-green-600 text-white py-2 rounded-lg mt-3 hover:bg-green-700"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No purchase history yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Items</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payment</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseHistory.map((purchase) => {
                        const totalAmount = purchase.total || 0;
                        const itemCount = purchase.items ? purchase.items.length : 0;
                        const invoiceNumber = purchase.invoiceNo || "N/A";
                        const purchaseDate = purchase.date ? new Date(purchase.date).toLocaleDateString() : "N/A";
                        const payment = purchase.paymentMethod || "Cash";
                        
                        return (
                          <tr key={purchase.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                            <td className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-white">{invoiceNumber}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{purchaseDate}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{itemCount} items</td>
                            <td className="px-4 py-3 font-semibold text-green-600">${formatPrice(totalAmount)}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                {getPaymentMethodIcon(payment)} {payment}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setInvoice(purchase)}
                                className="text-blue-600 hover:text-blue-800 transition p-1"
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

      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add to Cart</h3>
            <p><strong>{selectedMedicine.name}</strong></p>
            <p>Price: ${selectedMedicine.sellingPrice}</p>
            <p>Available: {selectedMedicine.quantity}</p>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedMedicine.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedMedicine.quantity))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => addToCart(selectedMedicine)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">🧾 Pharmacy Management System</h2>
              <p className="text-gray-600">123 Main Street, City | Tel: +123 456 7890</p>
              <hr className="my-3" />
            </div>
            
            <div className="mb-4">
              <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
              <p><strong>Date:</strong> {new Date(invoice.date).toLocaleString()}</p>
              <p><strong>Customer:</strong> {invoice.customerName}</p>
              <p><strong>Payment:</strong> {invoice.paymentMethod}</p>
            </div>
            
            <table className="w-full mb-4">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Medicine</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-t dark:border-gray-700">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${formatPrice(item.price)}</td>
                    <td className="p-2">${formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="text-right border-t pt-3">
              <p>Subtotal: ${formatPrice(invoice.subtotal)}</p>
              <p>Tax (5%): ${formatPrice(invoice.tax)}</p>
              <p className="text-xl font-bold">Total: ${formatPrice(invoice.total)}</p>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>Invoice ${invoice.invoiceNo}</title></head>
                      <body style="font-family: Arial; padding: 20px;">
                        <h2 style="text-align: center;">Pharmacy Management System</h2>
                        <hr/>
                        <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${invoice.customerName}</p>
                        <hr/>
                        <table style="width: 100%; border-collapse: collapse;">
                          <thead><tr><th style="border-bottom:1px solid #ddd;">Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${invoice.items && invoice.items.map(item => `
                              <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${formatPrice(item.price)}</td>
                                <td>$${formatPrice(item.total)}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <hr/>
                        <p><strong>Total: $${formatPrice(invoice.total)}</strong></p>
                        <p style="text-align: center;">Thank you for your purchase!</p>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
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