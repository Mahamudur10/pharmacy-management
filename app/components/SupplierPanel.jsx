"use client";

import { useState, useEffect } from "react";

export default function SupplierPanel() {
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [supplyForm, setSupplyForm] = useState({
    medicineName: "",
    quantity: "",
    price: "",
    expiryDate: "",
    notes: ""
  });
  const [suppliedMedicines, setSuppliedMedicines] = useState([]);
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
    // Load supplier orders
    const storedOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    setSupplierOrders(storedOrders);
    
    // Load all medicines
    const storedMeds = JSON.parse(localStorage.getItem("medicines") || "[]");
    setMedicines(storedMeds);
    
    // Load supplied medicines list
    const storedSupplied = JSON.parse(localStorage.getItem("suppliedMedicines") || "[]");
    setSuppliedMedicines(storedSupplied);
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = supplierOrders.map(order =>
      order.id === orderId ? { ...order, status: newStatus, deliveryDate: new Date().toISOString() } : order
    );
    localStorage.setItem("supplierOrders", JSON.stringify(updatedOrders));
    setSupplierOrders(updatedOrders);
    alert(`Order status updated to ${newStatus}`);
  };

  // Add new supply
  const addSupply = () => {
    if (!supplyForm.medicineName || !supplyForm.quantity || !supplyForm.price) {
      alert("Please fill all required fields");
      return;
    }

    const newSupply = {
      id: Date.now(),
      medicineName: supplyForm.medicineName,
      quantity: parseInt(supplyForm.quantity),
      price: parseFloat(supplyForm.price),
      expiryDate: supplyForm.expiryDate,
      notes: supplyForm.notes,
      supplierName: user?.name || "Unknown Supplier",
      suppliedDate: new Date().toISOString(),
      status: "Available"
    };

    const updated = [...suppliedMedicines, newSupply];
    localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
    setSuppliedMedicines(updated);

    // Create a new order for pharmacy
    const newOrder = {
      id: Date.now(),
      orderId: `ORD-${Date.now()}`,
      medicineName: supplyForm.medicineName,
      quantity: parseInt(supplyForm.quantity),
      price: parseFloat(supplyForm.price),
      orderDate: new Date().toISOString(),
      expectedDelivery: supplyForm.expiryDate,
      status: "Pending",
      supplierName: user?.name || "Unknown Supplier",
      remarks: supplyForm.notes
    };

    const existingOrders = JSON.parse(localStorage.getItem("supplierOrders") || "[]");
    localStorage.setItem("supplierOrders", JSON.stringify([...existingOrders, newOrder]));
    setSupplierOrders([...supplierOrders, newOrder]);

    setShowSupplyForm(false);
    setSupplyForm({ medicineName: "", quantity: "", price: "", expiryDate: "", notes: "" });
    alert("Supply added successfully! Order has been created.");
  };

  // Delete supply
  const deleteSupply = (id) => {
    if (confirm("Are you sure you want to remove this supply?")) {
      const updated = suppliedMedicines.filter(s => s.id !== id);
      localStorage.setItem("suppliedMedicines", JSON.stringify(updated));
      setSuppliedMedicines(updated);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Shipped": return "text-blue-600 bg-blue-100";
      case "Delivered": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const pendingOrders = supplierOrders.filter(o => o.status === "Pending");
  const shippedOrders = supplierOrders.filter(o => o.status === "Shipped");
  const deliveredOrders = supplierOrders.filter(o => o.status === "Delivered");

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome {user?.name || "Supplier"}!</h2>
        <p className="mt-1">Manage your supplies and track orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{supplierOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Shipped Orders</p>
          <p className="text-2xl font-bold text-blue-600">{shippedOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Delivered Orders</p>
          <p className="text-2xl font-bold text-green-600">{deliveredOrders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "orders" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500"
            }`}
          >
            📋 My Orders
          </button>
          <button
            onClick={() => setActiveTab("supplies")}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === "supplies" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500"
            }`}
          >
            📦 My Supplies
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg shadow">
          {supplierOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No orders yet</p>
              <p className="text-sm mt-2">Add supplies to create orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Medicine</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Order Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierOrders.map(order => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{order.orderId}</td>
                      <td className="px-4 py-3">{order.medicineName}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3">${order.price}</td>
                      <td className="px-4 py-3">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {order.status === "Pending" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "Shipped")}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Ship Order
                            </button>
                          )}
                          {order.status === "Shipped" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "Delivered")}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.status === "Delivered" && (
                            <span className="text-green-600 text-sm">✓ Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Supplies Tab */}
      {activeTab === "supplies" && (
        <div className="space-y-4">
          {/* Add Supply Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowSupplyForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              + Add New Supply
            </button>
          </div>

          {/* Supplies List */}
          <div className="bg-white rounded-lg shadow">
            {suppliedMedicines.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No supplies added yet</p>
                <p className="text-sm mt-2">Click "Add New Supply" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Medicine</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Price/Unit</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Supplied Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliedMedicines.map(supply => (
                      <tr key={supply.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">{supply.medicineName}</td>
                        <td className="px-4 py-3">{supply.quantity}</td>
                        <td className="px-4 py-3">${supply.price}</td>
                        <td className="px-4 py-3">{supply.expiryDate || "N/A"}</td>
                        <td className="px-4 py-3">{new Date(supply.suppliedDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-600">
                            {supply.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteSupply(supply.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showSupplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Supply</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={supplyForm.medicineName}
                  onChange={(e) => setSupplyForm({...supplyForm, medicineName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Paracetamol"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Quantity *</label>
                <input
                  type="number"
                  value={supplyForm.quantity}
                  onChange={(e) => setSupplyForm({...supplyForm, quantity: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Number of units"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Price per Unit ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={supplyForm.price}
                  onChange={(e) => setSupplyForm({...supplyForm, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={supplyForm.expiryDate}
                  onChange={(e) => setSupplyForm({...supplyForm, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  value={supplyForm.notes}
                  onChange={(e) => setSupplyForm({...supplyForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Additional information..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={addSupply}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Add Supply
              </button>
              <button
                onClick={() => {
                  setShowSupplyForm(false);
                  setSupplyForm({ medicineName: "", quantity: "", price: "", expiryDate: "", notes: "" });
                }}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}