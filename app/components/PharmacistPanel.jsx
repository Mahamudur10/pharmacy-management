"use client";

import { useState, useEffect } from "react";
import { 
  Package, TrendingUp, AlertTriangle, ShoppingCart, 
  Plus, Minus, X, Search, Printer, CheckCircle,
  DollarSign, Clock, Calendar, Award, Zap,
  BarChart3, Pill, Stethoscope, Heart, Users
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function PharmacistPanel() {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("sell");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [prescriptionNo, setPrescriptionNo] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [updateQuantities, setUpdateQuantities] = useState({});
  const [salesChartData, setSalesChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    setMedicines(storedMeds);
    setSales(storedSales);
    prepareCharts(storedMeds, storedSales);
  };

  const prepareCharts = (meds, salesData) => {
    // Sales trend last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const daySales = salesData.filter(s => 
        new Date(s.date).toLocaleDateString() === dateStr
      ).reduce((sum, s) => sum + (s.total || 0), 0);
      last7Days.push({ date: dateStr.slice(0, 5), sales: daySales });
    }
    setSalesChartData(last7Days);

    // Monthly revenue
    const monthlyData = {};
    salesData.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (sale.total || 0);
    });
    setRevenueChartData(Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue })));

    // Category distribution
    const categoryCount = {};
    meds.forEach(med => {
      categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
    });
    setCategoryChartData(Object.entries(categoryCount).map(([name, count]) => ({ name, count })));
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

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const calculateDiscount = () => cart.reduce((sum, item) => sum + (item.total * (item.discount || 0) / 100), 0);
  const calculateTax = () => (calculateSubtotal() - calculateDiscount()) * 0.05;
  const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTax();

  const processSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Update stock
    const updatedMedicines = medicines.map(med => {
      const soldItem = cart.find(item => item.id === med.id);
      if (soldItem) {
        return { ...med, quantity: med.quantity - soldItem.quantity };
      }
      return med;
    });
    localStorage.setItem("medicines", JSON.stringify(updatedMedicines));

    // Create invoice
    const invoiceData = {
      id: Date.now(),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerName: customerName || "Walk-in Customer",
      prescriptionNo: prescriptionNo || "N/A",
      items: cart,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod: "Cash"
    };

    // Save sale
    const updatedSales = [...sales, invoiceData];
    localStorage.setItem("sales", JSON.stringify(updatedSales));

    setInvoice(invoiceData);
    setCart([]);
    setCustomerName("");
    setPrescriptionNo("");
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
    alert(`✅ Stock updated! Added ${addQty} units.`);
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
  const expiringSoon = medicines.filter(m => {
    const daysLeft = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 60 && daysLeft > 0;
  });

  const stats = {
    totalMedicines: medicines.length,
    lowStock: lowStockMeds.length,
    expiring: expiringSoon.length,
    todaySales: sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + (s.total || 0), 0),
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0),
    cartItems: cart.length
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="w-7 h-7" /> Welcome, Pharmacist!
            </h1>
            <p className="text-emerald-100 mt-1">Manage sales, update stock, and serve customers efficiently.</p>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span className="text-sm font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-emerald-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalMedicines}</p>
              <p className="text-xs text-emerald-600 mt-2">In inventory</p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
              <Pill className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-amber-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Alert</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.lowStock}</p>
              <p className="text-xs text-red-600 mt-2">Need restock!</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">${stats.todaySales.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-2">+12% vs yesterday</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 border-purple-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cart Items</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.cartItems}</p>
              <p className="text-xs text-purple-600 mt-2">Ready to checkout</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
              <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockMeds.length > 0 || expiringSoon.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockMeds.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-400">Low Stock Alert</h3>
              </div>
              <div className="space-y-1">
                {lowStockMeds.slice(0, 3).map(med => (
                  <p key={med.id} className="text-sm text-amber-700 dark:text-amber-300">• {med.name}: Only {med.quantity} left</p>
                ))}
                {lowStockMeds.length > 3 && <p className="text-sm text-amber-600">+{lowStockMeds.length - 3} more items</p>}
              </div>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800 dark:text-red-400">Expiring Soon</h3>
              </div>
              <div className="space-y-1">
                {expiringSoon.slice(0, 3).map(med => {
                  const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return <p key={med.id} className="text-sm text-red-700 dark:text-red-300">• {med.name}: Expires in {daysLeft} days</p>;
                })}
                {expiringSoon.length > 3 && <p className="text-sm text-red-600">+{expiringSoon.length - 3} more items</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex flex-wrap gap-1">
            {[
              { id: "sell", label: "💊 Sell Medicine", icon: ShoppingCart },
              { id: "stock", label: "📦 Update Stock", icon: Package },
              { id: "analytics", label: "📊 Analytics", icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Sell Tab */}
          {activeTab === "sell" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medicine List */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredMedicines.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No medicines found</p>
                  ) : (
                    filteredMedicines.map(med => (
                      <div key={med.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex justify-between items-center hover:shadow-md transition">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{med.name}</p>
                          <p className="text-sm text-gray-500">Category: {med.category}</p>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-emerald-600">${med.sellingPrice}</span>
                            {med.discount > 0 && <span className="ml-2 text-xs text-gray-400 line-through">${med.purchasePrice}</span>}
                          </div>
                          <p className={`text-xs mt-1 ${med.quantity < 20 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                            Stock: {med.quantity} units
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMedicine(med);
                            setQuantity(1);
                          }}
                          disabled={med.quantity === 0}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 shadow-sm"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart size={20} className="text-emerald-500" />
                    Shopping Cart ({cart.length} items)
                  </h3>
                  <span className="text-sm text-gray-400">Ready for checkout</span>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add medicines from the list</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto mb-4">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                              <p className="text-sm text-gray-500">${item.price} each</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                              <X size={18} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)} 
                                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Minus size={14} className="mx-auto" />
                              </button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Plus size={14} className="mx-auto" />
                              </button>
                            </div>
                            <span className="font-semibold text-emerald-600">${item.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {calculateDiscount() > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-${calculateDiscount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax (5%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total:</span>
                        <span className="text-emerald-600">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <input
                          type="text"
                          placeholder="Customer Name (Optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                        />
                        <input
                          type="text"
                          placeholder="Prescription No (Optional)"
                          value={prescriptionNo}
                          onChange={(e) => setPrescriptionNo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                        />
                        <button
                          onClick={processSale}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-md"
                        >
                          Complete Sale
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Stock Tab */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white mb-4">
                <h3 className="font-semibold flex items-center gap-2"><Package size={18} /> Update Medicine Stock</h3>
                <p className="text-sm opacity-80 mt-1">Add new stock quantities for medicines</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Medicine</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Current Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Add Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map(med => (
                      <tr key={med.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 font-medium">{med.name}</td>
                        <td className={`px-4 py-3 font-semibold ${med.quantity < 20 ? "text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full w-16 text-center" : ""}`}>
                          {med.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={updateQuantities[med.id] || 0}
                            onChange={(e) => handleQuantityChange(med.id, e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">{med.expiryDate}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUpdateStock(med.id)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition flex items-center gap-2 text-sm shadow-sm"
                          >
                            <Plus size={16} /> Add Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Total Sales</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Average Sale</p>
                  <p className="text-2xl font-bold">${(stats.totalRevenue / stats.totalSales || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      Sales Trend (Last 7 Days)
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <DollarSign size={18} className="text-green-500" />
                      Monthly Revenue
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Package size={18} className="text-purple-500" />
                  Medicine Categories Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                      {categoryChartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add to Cart</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Medicine</p>
                <p className="font-semibold text-lg text-gray-800 dark:text-white">{selectedMedicine.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-bold text-emerald-600 text-xl">${selectedMedicine.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Available Stock</p>
                  <p className={`font-semibold ${selectedMedicine.quantity < 20 ? "text-red-600" : "text-gray-800"}`}>{selectedMedicine.quantity} units</p>
                </div>
              </div>
              {selectedMedicine.discount > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <p className="text-green-600 text-sm">🎉 {selectedMedicine.discount}% discount applied!</p>
                </div>
              )}
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Minus size={18} className="mx-auto" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedMedicine.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedMedicine.quantity))}
                    className="w-20 text-center px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(selectedMedicine.quantity, quantity + 1))}
                    className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-gray-600 dark:text-gray-400">Total Price</p>
                <p className="text-2xl font-bold text-emerald-600">${(selectedMedicine.sellingPrice * quantity).toFixed(2)}</p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => addToCart(selectedMedicine)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="text-center p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Successful!</h2>
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
                <div><p className="text-gray-500">Prescription:</p><p className="font-semibold">{invoice.prescriptionNo}</p></div>
              </div>
              
              <table className="w-full mb-4">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Medicine</th><th>Qty</th><th>Price</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b dark:border-gray-700">
                      <td className="p-2">{item.name}</td><td className="p-2">{item.quantity}</td><td className="p-2">${item.price}</td><td className="p-2 font-semibold">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="text-right border-t dark:border-gray-700 pt-3">
                <p>Subtotal: ${invoice.subtotal.toFixed(2)}</p>
                {invoice.discount > 0 && <p className="text-green-600">Discount: -${invoice.discount.toFixed(2)}</p>}
                <p>Tax (5%): ${invoice.tax.toFixed(2)}</p>
                <p className="text-xl font-bold mt-2">Total: ${invoice.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`<html><head><title>Invoice</title></head><body>${document.querySelector('.rounded-2xl').innerHTML}</body></html>`);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 border border-gray-300 dark:border-gray-600 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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