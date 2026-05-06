"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  History, Eye, Printer, Package, DollarSign, 
  Calendar, Clock, CheckCircle, Search, Filter,
  Download, TrendingUp, Award, Truck, Shield,
  ShoppingCart
} from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
    loadHistory();
  }, [user, router]);

  const loadHistory = () => {
    setIsLoading(true);
    const data = JSON.parse(localStorage.getItem("customerPurchases") || "[]");
    const userPurchases = data.filter(p => p.customerName === user?.name);
    setPurchases(userPurchases);
    setIsLoading(false);
  };

  const formatTK = (amount) => {
    const num = amount || 0;
    return `TK ${num.toFixed(2)}`;
  };

  const filteredPurchases = purchases.filter(p => 
    p.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: purchases.length,
    totalSpent: purchases.reduce((sum, p) => sum + (p.total || 0), 0),
    totalItems: purchases.reduce((sum, p) => sum + (p.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Purchase History</h1>
            <p className="text-sm text-gray-500 mt-0.5">View all your past orders</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-600">{formatTK(stats.totalSpent)}</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Items Purchased</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {purchases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Purchase History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No purchase history yet</p>
            <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders</p>
            <button
              onClick={() => router.push("/dashboard/shop")}
              className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No matching invoices found</p>
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
                {filteredPurchases.map((purchase, idx) => {
                  const itemCount = purchase.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
                  const invoiceNumber = purchase.invoiceNo || "N/A";
                  const purchaseDate = purchase.date ? new Date(purchase.date).toLocaleDateString() : "N/A";
                  const payment = purchase.paymentMethod || "Cash";
                  
                  return (
                    <tr key={purchase.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-sm text-gray-800">{invoiceNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{purchaseDate}</td>
                      <td className="px-5 py-3 text-gray-600">{itemCount} items</td>
                      <td className="px-5 py-3 font-semibold text-emerald-600">{formatTK(purchase.total)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {payment}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => setSelectedInvoice(purchase)}
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

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="text-center p-5 border-b border-gray-100">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
            </div>
            
            <div className="p-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">🧾 Pharmacy Management System</h3>
                <p className="text-gray-500 text-sm">123 Main Street, City | Tel: +123 456 7890</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice No:</p>
                  <p className="font-semibold">{selectedInvoice.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date:</p>
                  <p className="font-semibold">{new Date(selectedInvoice.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer:</p>
                  <p className="font-semibold">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment:</p>
                  <p className="font-semibold">{selectedInvoice.paymentMethod}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-3">
                {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2">
                    <span>{item.name} x {item.qty}</span>
                    <span className="font-semibold">{formatTK(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatTK(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>Invoice ${selectedInvoice.invoiceNo}</title>
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
                        <p><strong>Invoice No:</strong> ${selectedInvoice.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(selectedInvoice.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${selectedInvoice.customerName}</p>
                        <hr/>
                        <table>
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                          <tbody>
                            ${selectedInvoice.items.map(item => `
                              <tr>
                                <td>${item.name}</td>
                                <td>${item.qty}</td>
                                <td>${formatTK(item.price)}</td>
                                <td>${formatTK(item.price * item.qty)}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                        <div class="total">
                          <p><strong>Total: ${formatTK(selectedInvoice.total)}</strong></p>
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
                onClick={() => setSelectedInvoice(null)}
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