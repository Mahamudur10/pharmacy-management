"use client";

import { useState, useEffect } from "react";

export default function PharmacistPanel() {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState("sell");
  const [cart, setCart] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateQuantities, setUpdateQuantities] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(storedSales);
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
        price: medicine.sellingPrice,
        quantity: quantity,
        total: medicine.sellingPrice * quantity
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
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const processSale = () => {
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

    const invoiceData = {
      id: Date.now(),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: customerName || "Walk-in Customer",
      items: cart,
      subtotal: calculateTotal(),
      tax: calculateTotal() * 0.05,
      total: calculateTotal() * 1.05,
      paymentMethod: "Cash"
    };

    const updatedSales = [...sales, invoiceData];
    localStorage.setItem("sales", JSON.stringify(updatedSales));

    setInvoice(invoiceData);
    setCart([]);
    setCustomerName("");
    loadData();
  };

  const handleUpdateStock = (medicineId) => {
    const addQty = updateQuantities[medicineId] || 0;
    if (addQty <= 0) {
      alert("Please enter a quantity to add");
      return;
    }
    
    const updated = medicines.map(med => 
      med.id === medicineId 
        ? { ...med, quantity: med.quantity + addQty }
        : med
    );
    localStorage.setItem("medicines", JSON.stringify(updated));
    loadData();
    setUpdateQuantities({ ...updateQuantities, [medicineId]: 0 });
    alert("Stock updated successfully!");
  };

  const handleQuantityChange = (medicineId, value) => {
    setUpdateQuantities({
      ...updateQuantities,
      [medicineId]: parseInt(value) || 0
    });
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMeds = medicines.filter(m => m.quantity < 20);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome Pharmacist!</h2>
        <p className="mt-1">Today's Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Medicines</p>
          <p className="text-2xl font-bold">{medicines.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-600">{lowStockMeds.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Today's Sales</p>
          <p className="text-2xl font-bold text-green-600">
            ${sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString())
              .reduce((sum, s) => sum + s.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMeds.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">⚠️ Low Stock Alert</h3>
          {lowStockMeds.map(med => (
            <p key={med.id} className="text-sm text-yellow-700">
              • {med.name}: Only {med.quantity} left
            </p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("sell")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "sell" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            💊 Sell Medicine
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "stock" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            📦 Update Stock
          </button>
        </div>
      </div>

      {/* Sell Tab */}
      {activeTab === "sell" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medicine List */}
          <div className="bg-white rounded-lg shadow p-4">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            
            <div className="max-h-[500px] overflow-y-auto">
              {filteredMedicines.map(med => (
                <div key={med.id} className="border-b p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-gray-500">Stock: {med.quantity} | Price: ${med.sellingPrice}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMedicine(med);
                      setQuantity(1);
                    }}
                    disabled={med.quantity === 0}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4">Shopping Cart</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="border rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500">✕</button>
                      </div>
                      <div className="flex justify-between mt-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                            className="px-2 border rounded"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                            className="px-2 border rounded"
                          >
                            +
                          </button>
                        </div>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-xl">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <button
                    onClick={processSale}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Complete Sale
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stock Tab */}
      {activeTab === "stock" && (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Medicine</th>
                  <th className="px-4 py-3 text-left">Current Stock</th>
                  <th className="px-4 py-3 text-left">Add Quantity</th>
                  <th className="px-4 py-3 text-left">Expiry Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(med => (
                  <tr key={med.id} className="border-t">
                    <td className="px-4 py-3">{med.name}</td>
                    <td className={`px-4 py-3 ${med.quantity < 20 ? "text-red-600 font-bold" : ""}`}>
                      {med.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={updateQuantities[med.id] || 0}
                        onChange={(e) => handleQuantityChange(med.id, e.target.value)}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{med.expiryDate}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdateStock(med.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        + Add Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Add to Cart</h3>
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
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => addToCart(selectedMedicine)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Pharmacy Management System</h2>
              <hr className="my-3" />
            </div>
            <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
            <p><strong>Date:</strong> {new Date(invoice.date).toLocaleString()}</p>
            <p><strong>Customer:</strong> {invoice.customerName}</p>
            
            <table className="w-full mt-4 mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Medicine</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.price}</td>
                    <td className="p-2">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="text-right">
              <p className="text-xl font-bold">Total: ${invoice.total.toFixed(2)}</p>
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
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${invoice.items.map(item => `
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
                        <p style="text-align: center;">Thank you for your purchase!</p>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                  setInvoice(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
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