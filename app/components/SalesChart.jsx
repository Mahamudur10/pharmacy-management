"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Sales Trend Line Chart
export function SalesTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
          labelStyle={{ color: "#f9fafb" }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stock Distribution Pie Chart
export function StockPieChart({ data }) {
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Monthly Revenue Bar Chart
export function RevenueBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
          formatter={(value) => [`$${value}`, "Revenue"]}
        />
        <Legend />
        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Low Stock Alert Chart
export function LowStockChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis type="number" stroke="#6b7280" />
        <YAxis type="category" dataKey="name" width={100} stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
        />
        <Bar dataKey="quantity" fill="#ef4444" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}