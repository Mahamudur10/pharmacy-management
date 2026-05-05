"use client";

import { useState, useEffect } from "react";

export default function CustomerPanel() {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("shop");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [invoice, setInvoice] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const loadData = () => {
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    
    const storedHistory = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    setPurchaseHistory(storedHistory);
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

  const updateQuantity = (id, newQuantity) => {
    const medicine = medicines.find(m => m.id === id);
    if (newQuantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} available!`);
      return;
    }
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    return cart.reduce((sum, item) => sum + (item.total * item.discount / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
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

    const invoiceData = {
      id: Date.now(),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: user?.name || "Customer",
      customerEmail: user?.email || "",
      items: cart,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
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
    loadData();
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case "Cash": return "💵";
      case "Card": return "💳";
      case "Online": return "📱";
      default: return "💰";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome {user?.name || "Customer"}! 👋</h2>
        <p className="mt-1">Shop for medicines at best prices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Purchases</p>
          <p className="text-2xl font-bold">{purchaseHistory.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">
            ${purchaseHistory.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Cart Items</p>
          <p className="text-2xl font-bold text-blue-600">{cart.length}</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("shop")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "shop" ? "border-green-500 text-green-600" : "border-transparent text-gray-500"
            }`}
          >
            🛍️ Shop Medicines
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "history" ? "border-green-500 text-green-600" : "border-transparent text-gray-500"
            }`}
          >
            📜 Purchase History
          </button>
        </div>
      </div>

      {activeTab === "shop" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search medicines by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {filteredMedicines.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No medicines found</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredMedicines.map((med) => (
                    <div key={med.id} className="border rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{med.name}</h3>
                          <p className="text-sm text-gray-500">Category: {med.category}</p>
                          <p className="text-sm text-gray-500">Batch: {med.batchNumber}</p>
                          <div className="mt-2">
                            <span className="text-xl font-bold text-green-600">${med.sellingPrice}</span>
                            {med.discount > 0 && (
                              <span className="ml-2 text-sm text-gray-500 line-through">${med.purchasePrice}</span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${med.quantity < 20 ? "text-red-500" : "text-gray-500"}`}>
                            {med.quantity < 20 ? `⚠️ Only ${med.quantity} left` : `In Stock: ${med.quantity}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMedicine(med);
                            setQuantity(1);
                          }}
                          disabled={med.quantity === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🛒 Shopping Cart ({cart.length} items)
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-2">Add some medicines to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[350px] overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-500">${item.price} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="Card">💳 Card</option>
                      <option value="Online">📱 Online Payment</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={processPurchase}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold mt-4"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow">
          {purchaseHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No purchase history yet</p>
              <p className="text-sm mt-2">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Invoice No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map((purchase) => (
                    <tr key={purchase.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{purchase.invoiceNo}</td>
                      <td className="px-4 py-3">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{purchase.items.reduce((sum, i) => sum + i.quantity, 0)} items</td>
                      <td className="px-4 py-3 font-semibold text-green-600">${purchase.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(purchase.paymentMethod)} {purchase.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setInvoice(purchase)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add to Cart</h3>
            <div className="space-y-3">
              <p><strong>{selectedMedicine.name}</strong></p>
              <p>Price: <span className="text-green-600 font-bold">${selectedMedicine.sellingPrice}</span></p>
              <p>Available: {selectedMedicine.quantity}</p>
              {selectedMedicine.discount > 0 && (
                <p className="text-green-600">Discount: {selectedMedicine.discount}%</p>
              )}
              <div>
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
              <div className="flex gap-2 pt-4">
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
        </div>
      )}

      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">🧾 Pharmacy Management System</h2>
              <p className="text-gray-600">123 Main Street, City</p>
              <p className="text-gray-600">Tel: +123 456 7890</p>
              <hr className="my-3" />
            </div>
            
            <div className="mb-4">
              <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
              <p><strong>Date:</strong> {new Date(invoice.date).toLocaleString()}</p>
              <p><strong>Customer:</strong> {invoice.customerName}</p>
              <p><strong>Email:</strong> {invoice.customerEmail}</p>
              <p><strong>Payment Method:</strong> {getPaymentMethodIcon(invoice.paymentMethod)} {invoice.paymentMethod}</p>
            </div>
            
            <table className="w-full mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Medicine</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Discount</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.price}</td>
                    <td className="p-2">{item.discount}%</td>
                    <td className="p-2">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="text-right border-t pt-3">
              <p>Subtotal: ${invoice.subtotal.toFixed(2)}</p>
              <p>Discount: -${invoice.discount.toFixed(2)}</p>
              <p className="text-xl font-bold mt-2">Total: ${invoice.total.toFixed(2)}</p>
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
                        <p style="text-align: center;">123 Main Street, City | Tel: +123 456 7890</p>
                        <hr/>
                        <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${invoice.customerName}</p>
                        <p><strong>Payment:</strong> ${invoice.paymentMethod}</p>
                        <hr/>
                        <table style="width: 100%; border-collapse: collapse;">
                          <thead><tr><th style="border-bottom: 1px solid #ddd;">Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${invoice.items.map((item) => `
                              <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price}</td>
                                <td>$${item.total.toFixed(2)}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <hr/>
                        <p><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
                        <p style="text-align: center; margin-top: 30px;">Thank you for your purchase! 🏥</p>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
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