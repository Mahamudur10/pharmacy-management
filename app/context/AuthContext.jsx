"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user:", e);
          localStorage.removeItem("user");
        }
      }
    }

    // Initialize database if empty
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.length === 0) {
      const defaultUsers = [
        { id: 1, name: "Admin User", email: "admin@pharmacy.com", password: "admin123", role: "Admin", status: "approved" },
        { id: 2, name: "Pharmacist User", email: "pharmacist@pharmacy.com", password: "pharm123", role: "Pharmacist", status: "approved" },
        { id: 3, name: "Customer User", email: "customer@pharmacy.com", password: "customer123", role: "Customer", status: "approved" }
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      
      const medicines = [
        { id: 1, name: "Paracetamol", category: "Pain Relief", batchNumber: "BCH001", manufacturer: "Square Pharma", supplier: "MediSource", purchasePrice: 5, sellingPrice: 10, quantity: 100, manufactureDate: "2024-01-01", expiryDate: "2025-12-31", discount: 0 },
        { id: 2, name: "Omeprazole", category: "Gastric", batchNumber: "BCH002", manufacturer: "Healthcare Ltd", supplier: "MediSource", purchasePrice: 8, sellingPrice: 15, quantity: 50, manufactureDate: "2024-02-01", expiryDate: "2025-11-30", discount: 5 },
        { id: 3, name: "Amoxicillin", category: "Antibiotic", batchNumber: "BCH003", manufacturer: "Drug International", supplier: "PharmaLink", purchasePrice: 12, sellingPrice: 25, quantity: 30, manufactureDate: "2024-03-01", expiryDate: "2025-10-31", discount: 0 }
      ];
      localStorage.setItem("medicines", JSON.stringify(medicines));
      localStorage.setItem("sales", JSON.stringify([]));
      localStorage.setItem("categories", JSON.stringify(["Pain Relief", "Gastric", "Antibiotic", "Vitamin", "First Aid"]));
      localStorage.setItem("supplierOrders", JSON.stringify([]));
    }
  }, []);

  const signup = async (name, email, password, role) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existing = users.find((u) => u.email === email);
    if (existing) throw new Error("Email already exists");

    const newUser = { 
      id: Date.now(), 
      name, 
      email, 
      password, 
      role, 
      status: role === "Supplier" ? "pending" : "approved" 
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    if (newUser.status === "approved") {
      const { password, ...userWithoutPass } = newUser;
      localStorage.setItem("user", JSON.stringify(userWithoutPass));
      setUser(userWithoutPass);
      return true;
    }
    return false;
  };

  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    
    if (!found) throw new Error("Invalid email or password");
    if (found.status === "pending") throw new Error("Account pending admin approval");

    const { password: _, ...userWithoutPass } = found;
    localStorage.setItem("user", JSON.stringify(userWithoutPass));
    setUser(userWithoutPass);
    return userWithoutPass;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const approveSupplier = (userId) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, status: "approved" } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem("users") || "[]");
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, approveSupplier, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}