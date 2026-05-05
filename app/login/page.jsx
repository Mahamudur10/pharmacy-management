"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Pill, Stethoscope, Heart, Shield, ShoppingBag, Truck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { role: "Admin", icon: Shield, color: "purple", desc: "Full system control" },
    { role: "Pharmacist", icon: Stethoscope, color: "blue", desc: "Manage medicines & sales" },
    { role: "Supplier", icon: Truck, color: "orange", desc: "Supply medicines" },
    { role: "Customer", icon: ShoppingBag, color: "green", desc: "Purchase medicines" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Image & Info */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white hidden md:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Pill className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold">PharmacyMS</span>
              </div>
              
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome Back! 👋</h1>
                <p className="text-white/80 text-lg">Login to access your pharmacy dashboard and manage your activities.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">System Roles:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <r.icon className="w-4 h-4" />
                        <span className="font-semibold">{r.role}</span>
                      </div>
                      <p className="text-xs text-white/70">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-center text-white/60 text-sm mt-8">
              <p>Secure & Reliable Pharmacy Management System</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="md:w-1/2 p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="md:hidden flex justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3 rounded-2xl">
                  <Pill className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Login</h2>
              <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <div className="w-1 h-full bg-red-500 rounded"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="admin@pharmacy.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 mt-6"
              >
                {loading ? "Logging in..." : "Login →"}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create Account
              </Link>
            </p>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 mb-3">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-semibold text-gray-700">Admin</p>
                  <p className="text-gray-500 text-xs">admin@pharmacy.com</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-semibold text-gray-700">Pharmacist</p>
                  <p className="text-gray-500 text-xs">pharmacist@pharmacy.com</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-semibold text-gray-700">Customer</p>
                  <p className="text-gray-500 text-xs">customer@pharmacy.com</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-semibold text-gray-700">Password</p>
                  <p className="text-gray-500 text-xs">•••••••</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}