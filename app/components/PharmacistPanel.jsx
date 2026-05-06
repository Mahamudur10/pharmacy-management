"use client";

import { useState, useEffect } from "react";
import { 
  Package, TrendingUp, AlertTriangle, ShoppingCart, 
  Plus, Minus, X, Search, Printer, CheckCircle,
  DollarSign, Clock, Calendar, Award, Zap,
  BarChart3, Pill, Stethoscope, Heart, Users,
  Eye, Star, Truck, Phone, Mail, MapPin
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
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
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    const storedSales = JSON.parse(localStorage.getItem("sales") || "[]");
    setMedicines(storedMeds);
    setSales(storedSales);
    prepareCharts(storedMeds, storedSales);
    setIsLoading(false);
  };

  const prepareCharts = (meds, salesData) => {
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

    const monthlyData = {};
    salesData.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (sale.total || 0);
    });
    setRevenueChartData(Object.entries(monthlyData).map(([month, revenue], idx) => ({ id: idx, month, revenue })));

    const categoryCount = {};
    meds.forEach(med => {
      if (med.category) {
        categoryCount[med.category] = (categoryCount[med.category] || 0) + 1;
      }
    });
    setCategoryChartData(Object.entries(categoryCount).map(([name, count], idx) => ({ id: idx, name, count })));
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

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.total || 0), 0);
  const calculateDiscount = () => cart.reduce((sum, item) => sum + (item.total * (item.discount || 0) / 100), 0);
  const calculateTax = () => (calculateSubtotal() - calculateDiscount()) * 0.05;
  const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTax();

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
      prescriptionNo: prescriptionNo || "N/A",
      items: cart,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod: "Cash"
    };

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
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMeds = medicines.filter(m => (m.quantity || 0) < 20);
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

  const formatTK = (amount) => {
    return `TK ${(amount || 0).toFixed(2)}`;
  };

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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalMedicines}</p>
              <p className="text-xs text-emerald-600 mt-2">In inventory</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition">
              <Pill className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Low Stock Alert</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
              <p className="text-xs text-red-600 mt-2">Need restock!</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{formatTK(stats.todaySales)}</p>
              <p className="text-xs text-green-600 mt-2">+12% vs yesterday</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition">
              <DollarSign className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cart Items</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.cartItems}</p>
              <p className="text-xs text-purple-600 mt-2">Ready to checkout</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition">
              <ShoppingCart className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockMeds.length > 0 || expiringSoon.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockMeds.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
              </div>
              <div className="space-y-1">
                {lowStockMeds.slice(0, 3).map((med, idx) => (
                  <p key={idx} className="text-sm text-amber-700">• {med.name}: Only {med.quantity} left</p>
                ))}
                {lowStockMeds.length > 3 && <p className="text-sm text-amber-600">+{lowStockMeds.length - 3} more items</p>}
              </div>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Expiring Soon</h3>
              </div>
              <div className="space-y-1">
                {expiringSoon.slice(0, 3).map((med, idx) => {
                  const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return <p key={idx} className="text-sm text-red-700">• {med.name}: Expires in {daysLeft} days</p>;
                })}
                {expiringSoon.length > 3 && <p className="text-sm text-red-600">+{expiringSoon.length - 3} more items</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-1">
            <button
              onClick={() => setActiveTab("sell")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "sell" 
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShoppingCart size={18} /> Sell Medicine
            </button>
            <button
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "stock" 
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={18} /> Update Stock
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 py-3 px-5 font-medium transition-all duration-200 rounded-t-lg ${
                activeTab === "analytics" 
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 size={18} /> Analytics
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Sell Tab */}
          {activeTab === "sell" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medicine List */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {filteredMedicines.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No medicines found</p>
                  ) : (
                    filteredMedicines.map((med, idx) => (
                      <div key={med.id || idx} className="bg-white rounded-lg p-3 flex justify-between items-center hover:shadow-md transition group">
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
                      {cart.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white rounded-lg p-3 shadow-sm">
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
                                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                              >
                                <Minus size={14} className="mx-auto" />
                              </button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)} 
                                className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                              >
                                <Plus size={14} className="mx-auto" />
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
                        <span>{formatTK(calculateSubtotal())}</span>
                      </div>
                      {calculateDiscount() > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>-{formatTK(calculateDiscount())}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax (5%):</span>
                        <span>{formatTK(calculateTax())}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span>Total:</span>
                        <span className="text-emerald-600">{formatTK(calculateTotal())}</span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <input
                          type="text"
                          placeholder="Customer Name (Optional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Prescription No (Optional)"
                          value={prescriptionNo}
                          onChange={(e) => setPrescriptionNo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <button
                          onClick={processSale}
                          className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-sm"
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
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2"><Package size={18} /> Update Medicine Stock</h3>
                <p className="text-sm text-blue-600 mt-1">Add new stock quantities for medicines</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Add Quantity</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => (
                      <tr key={med.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-medium text-gray-800">{med.name}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${(med.quantity || 0) < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {med.quantity} units
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            min="0"
                            value={updateQuantities[med.id] || 0}
                            onChange={(e) => handleQuantityChange(med.id, e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{med.expiryDate || "N/A"}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleUpdateStock(med.id)}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition text-sm shadow-sm"
                          >
                            <Plus size={14} className="inline mr-1" /> Add Stock
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <p className="text-blue-100 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white">
                  <p className="text-emerald-100 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatTK(stats.totalRevenue)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <p className="text-purple-100 text-sm">Average Sale</p>
                  <p className="text-2xl font-bold">{formatTK(stats.totalRevenue / stats.totalSales || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" /> Sales Trend (Last 7 Days)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-500" /> Monthly Revenue
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={18} className="text-purple-500" /> Medicine Categories Distribution
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="count">
                        {categoryChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
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
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Minus size={18} className="mx-auto" />
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
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Plus size={18} className="mx-auto" />
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
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition"
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
                <div><p className="text-gray-500">Prescription:</p><p className="font-semibold">{invoice.prescriptionNo}</p></div>
              </div>
              
              <table className="w-full mb-4">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left text-xs font-semibold text-gray-600">Medicine</th>
                    <th className="p-3 text-center text-xs font-semibold text-gray-600">Qty</th>
                    <th className="p-3 text-right text-xs font-semibold text-gray-600">Price</th>
                    <th className="p-3 text-right text-xs font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-3 text-sm">{item.name}</td>
                      <td className="p-3 text-center text-sm">{item.quantity}</td>
                      <td className="p-3 text-right text-sm">{formatTK(item.price)}</td>
                      <td className="p-3 text-right text-sm font-semibold">{formatTK(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
               </table>
              
              <div className="text-right border-t border-gray-100 pt-3">
                <p className="text-sm">Subtotal: {formatTK(invoice.subtotal)}</p>
                {invoice.discount > 0 && <p className="text-sm text-emerald-600">Discount: -{formatTK(invoice.discount)}</p>}
                <p className="text-sm">Tax (5%): {formatTK(invoice.tax)}</p>
                <p className="text-xl font-bold mt-2">Total: {formatTK(invoice.total)}</p>
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
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
                      </style>
                      </head>
                      <body>
                        <h2>🧾 Pharmacy Management System</h2>
                        <p style="text-align: center;">123 Main Street, City | Tel: +123 456 7890</p>
                        <hr/>
                        <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${invoice.customerName}</p>
                        <hr/>
                        <table>
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${invoice.items.map(item => `
                              <tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatTK(item.price)}</td><td>${formatTK(item.total)}</td></tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <div class="total">
                          <p>Subtotal: ${formatTK(invoice.subtotal)}</p>
                          ${invoice.discount > 0 ? `<p>Discount: -${formatTK(invoice.discount)}</p>` : ''}
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
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 transition"
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