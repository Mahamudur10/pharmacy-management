"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  FileText, Download, TrendingUp, Package, AlertTriangle, 
  Calendar, DollarSign, BarChart3, PieChart, Printer,
  CheckCircle, Clock, Users, ShoppingCart, XCircle,
  Eye, Layers, Truck, Stethoscope, Shield, CreditCard
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  useEffect(() => {
    if (!user) router.push("/login");
    loadData();
  }, [user, router]);

  const loadData = () => {
    setSales(JSON.parse(localStorage.getItem("sales") || "[]"));
    setMedicines(JSON.parse(localStorage.getItem("medicines") || "[]"));
  };

  // Filter sales based on period
  const getFilteredSales = () => {
    if (selectedPeriod === "all") return sales;
    
    const now = new Date();
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      if (selectedPeriod === "today") {
        return saleDate.toDateString() === now.toDateString();
      } else if (selectedPeriod === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return saleDate >= weekAgo;
      } else if (selectedPeriod === "month") {
        return saleDate.getMonth() === now.getMonth() && 
               saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    return filtered;
  };

  // Format currency to BDT
  const formatTK = (amount) => {
    return `TK ${(amount || 0).toFixed(2)}`;
  };

  // Generate Sales Report PDF
  const generateSalesReportPDF = () => {
    const filteredSales = getFilteredSales();
    if (filteredSales.length === 0) {
      alert("No sales data available for selected period!");
      return;
    }

    setIsGenerating(true);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Pharmacy Management System", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Sales Report", pageWidth / 2, 32, { align: "center" });
    doc.setTextColor(0, 0, 0);
    
    // Report Info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 55);
    doc.text(`Period: ${selectedPeriod.toUpperCase()}`, 14, 62);
    
    // Summary Stats
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalItems = filteredSales.reduce((sum, s) => sum + (s.items?.length || 0), 0);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 70, 55, 25, "F");
    doc.rect(74, 70, 55, 25, "F");
    doc.rect(134, 70, 55, 25, "F");
    
    doc.setFontSize(9);
    doc.text("Total Sales", 41, 80, { align: "center" });
    doc.setFontSize(14);
    doc.text(totalSales.toString(), 41, 90, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Total Revenue", 101, 80, { align: "center" });
    doc.setFontSize(12);
    doc.text(formatTK(totalRevenue), 101, 90, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Total Items Sold", 161, 80, { align: "center" });
    doc.setFontSize(14);
    doc.text(totalItems.toString(), 161, 90, { align: "center" });
    
    // Sales Table
    const tableData = filteredSales.map(sale => [
      sale.invoiceNo || "N/A",
      new Date(sale.date).toLocaleDateString(),
      sale.customerName || "Walk-in",
      sale.items?.length || 0,
      formatTK(sale.total || 0)
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [["Invoice No", "Date", "Customer", "Items", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("© Pharmacy Management System - All Rights Reserved", pageWidth / 2, finalY, { align: "center" });
    
    doc.save(`sales_report_${selectedPeriod}_${Date.now()}.pdf`);
    setIsGenerating(false);
  };

  // Generate Inventory Report PDF
  const generateInventoryReportPDF = () => {
    if (medicines.length === 0) {
      alert("No inventory data available!");
      return;
    }

    setIsGenerating(true);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Pharmacy Management System", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Inventory Report", pageWidth / 2, 32, { align: "center" });
    doc.setTextColor(0, 0, 0);
    
    // Report Info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 55);
    
    // Summary Stats
    const totalMedicines = medicines.length;
    const totalStock = medicines.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalValue = medicines.reduce((sum, m) => sum + ((m.sellingPrice || 0) * (m.quantity || 0)), 0);
    const lowStock = medicines.filter(m => (m.quantity || 0) < 20).length;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 62, 55, 25, "F");
    doc.rect(74, 62, 55, 25, "F");
    doc.rect(134, 62, 55, 25, "F");
    doc.rect(14, 92, 55, 25, "F");
    
    doc.setFontSize(9);
    doc.text("Total Medicines", 41, 72, { align: "center" });
    doc.setFontSize(14);
    doc.text(totalMedicines.toString(), 41, 82, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Total Stock", 101, 72, { align: "center" });
    doc.setFontSize(14);
    doc.text(totalStock.toString(), 101, 82, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Total Value", 161, 72, { align: "center" });
    doc.setFontSize(12);
    doc.text(formatTK(totalValue), 161, 82, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Low Stock Items", 41, 102, { align: "center" });
    doc.setFontSize(14);
    doc.text(lowStock.toString(), 41, 112, { align: "center" });
    
    // Inventory Table
    const tableData = medicines.map(med => [
      med.name,
      med.category || "N/A",
      med.quantity || 0,
      formatTK(med.sellingPrice || 0),
      med.expiryDate || "N/A"
    ]);
    
    autoTable(doc, {
      startY: 125,
      head: [["Medicine", "Category", "Stock", "Price", "Expiry"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("© Pharmacy Management System - All Rights Reserved", pageWidth / 2, finalY, { align: "center" });
    
    doc.save(`inventory_report_${Date.now()}.pdf`);
    setIsGenerating(false);
  };

  // Generate Low Stock Report PDF
  const generateLowStockReportPDF = () => {
    const lowStockItems = medicines.filter(m => (m.quantity || 0) < 20);
    if (lowStockItems.length === 0) {
      alert("No low stock items found!");
      return;
    }

    setIsGenerating(true);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Pharmacy Management System", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Low Stock Alert Report", pageWidth / 2, 32, { align: "center" });
    doc.setTextColor(0, 0, 0);
    
    // Report Info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 55);
    doc.text(`Total Low Stock Items: ${lowStockItems.length}`, 14, 62);
    
    // Warning Note
    doc.setTextColor(245, 158, 11);
    doc.text("⚠️ These items need immediate restock!", 14, 72);
    doc.setTextColor(0, 0, 0);
    
    // Low Stock Table
    const tableData = lowStockItems.map(med => [
      med.name,
      med.category || "N/A",
      med.quantity || 0,
      formatTK(med.sellingPrice || 0),
      med.expiryDate || "N/A",
      med.supplier || "N/A"
    ]);
    
    autoTable(doc, {
      startY: 80,
      head: [["Medicine", "Category", "Current Stock", "Price", "Expiry", "Supplier"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("© Pharmacy Management System - All Rights Reserved", pageWidth / 2, finalY, { align: "center" });
    
    doc.save(`low_stock_report_${Date.now()}.pdf`);
    setIsGenerating(false);
  };

  const stats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.total || 0), 0),
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => (m.quantity || 0) < 20).length,
    totalStock: medicines.reduce((sum, m) => sum + (m.quantity || 0), 0)
  };

  const reports = [
    { 
      id: "sales", 
      title: "Sales Report", 
      icon: TrendingUp, 
      color: "blue", 
      gradient: "from-blue-500 to-blue-600",
      desc: "Complete sales transaction history",
      action: generateSalesReportPDF
    },
    { 
      id: "inventory", 
      title: "Inventory Report", 
      icon: Package, 
      color: "green", 
      gradient: "from-emerald-500 to-green-600",
      desc: "Current stock status & values",
      action: generateInventoryReportPDF
    },
    { 
      id: "lowstock", 
      title: "Low Stock Report", 
      icon: AlertTriangle, 
      color: "yellow", 
      gradient: "from-amber-500 to-orange-600",
      desc: "Items below 20 units",
      action: generateLowStockReportPDF
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate and download PDF reports</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">TK {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMedicines}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter for Sales Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Sales Period</p>
              <p className="text-xs text-gray-400">Select period for sales report</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["all", "today", "week", "month"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriod === period
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period === "all" ? "All Time" : 
                 period === "today" ? "Today" : 
                 period === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div 
              key={r.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${r.gradient}`}></div>
              <div className="p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${r.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{r.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
                
                {/* Report Preview Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Records:</span>
                    <span className="font-semibold text-gray-700">
                      {r.id === "sales" ? getFilteredSales().length : 
                       r.id === "inventory" ? medicines.length : 
                       medicines.filter(m => (m.quantity || 0) < 20).length}
                    </span>
                  </div>
                  {r.id === "sales" && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Total Value:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatTK(getFilteredSales().reduce((sum, s) => sum + (s.total || 0), 0))}
                      </span>
                    </div>
                  )}
                  {r.id === "inventory" && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Total Stock:</span>
                      <span className="font-semibold text-gray-700">{stats.totalStock} units</span>
                    </div>
                  )}
                  {r.id === "lowstock" && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Critical:</span>
                      <span className="font-semibold text-red-600">
                        {medicines.filter(m => (m.quantity || 0) < 10).length} items (&lt;10)
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={r.action}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 rounded-lg hover:from-gray-900 hover:to-black transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Download size={16} /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Export Note */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Printer size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">PDF Reports</h3>
            <p className="text-xs text-gray-600 mt-1">
              All reports are generated in professional PDF format with company branding, 
              summary statistics, and detailed tables. Perfect for printing and sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}