"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Pill, UserPlus, Shield, Stethoscope, Truck, ShoppingBag, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await signup(name, email, password, role);
      if (result === false && role === "Supplier") {
        setSuccess("Registration successful! Please wait for admin approval.");
        setTimeout(() => router.push("/login"), 3000);
      } else if (result !== false) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "Admin", icon: Shield, color: "purple", desc: "Full system control", restricted: true },
    { id: "Pharmacist", icon: Stethoscope, color: "blue", desc: "Manage medicines & sales" },
    { id: "Supplier", icon: Truck, color: "orange", desc: "Supply medicines (needs approval)" },
    { id: "Customer", icon: ShoppingBag, color: "green", desc: "Purchase medicines" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Info */}
          <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-teal-700 p-8 text-white hidden md:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Pill className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold">PharmacyMS</span>
              </div>
              
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Join Us! 🚀</h1>
                <p className="text-white/80 text-lg">Create your account and start managing pharmacy operations.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Benefits:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Easy medicine management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Real-time stock tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Automated invoicing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Sales reports & analytics</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-white/60 text-sm mt-8">
              <p>Already have an account? <Link href="/login" className="text-white underline">Login here</Link></p>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="md:w-1/2 p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="md:hidden flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-600 to-teal-600 p-3 rounded-2xl">
                  <Pill className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-500 mt-2">Register to get started</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <div className="w-1 h-full bg-red-500 rounded"></div>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    placeholder="john@example.com"
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
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Register as</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.filter(r => !r.restricted).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        role === r.id 
                          ? `border-${r.color}-500 bg-${r.color}-50` 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <r.icon className={`w-5 h-5 ${role === r.id ? `text-${r.color}-600` : "text-gray-500"}`} />
                        <div className="text-left">
                          <p className={`font-semibold text-sm ${role === r.id ? `text-${r.color}-600` : "text-gray-700"}`}>
                            {r.id}
                          </p>
                          <p className="text-xs text-gray-400">{r.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {role === "Supplier" && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Supplier accounts require admin approval
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition font-semibold mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {loading ? "Creating account..." : "Sign Up →"}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-6 md:hidden">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}