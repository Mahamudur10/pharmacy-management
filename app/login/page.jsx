"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { 
  Pill, Mail, Lock, ArrowRight, 
  Shield, Stethoscope, Truck, ShoppingBag,
  Sparkles, Heart, Activity, Eye, EyeOff,
  Fingerprint, AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const demoAccounts = [
    { role: "Admin", email: "admin@pharmacy.com", password: "admin123", icon: Shield, color: "purple" },
    { role: "Pharmacist", email: "pharmacist@pharmacy.com", password: "pharm123", icon: Stethoscope, color: "blue" },
    { role: "Supplier", email: "supplier@pharmacy.com", password: "supplier123", icon: Truck, color: "orange" },
    { role: "Customer", email: "customer@pharmacy.com", password: "customer123", icon: ShoppingBag, color: "green" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
        </div>

        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Brand Section */}
            <div className="lg:w-2/5 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 lg:p-10 text-white">
              <div className="flex items-center gap-3 mb-12">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2.5 rounded-2xl shadow-lg">
                  <Pill className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight">PharmaMed</span>
                  <p className="text-xs text-white/50">Complete Pharmacy Solution</p>
                </div>
              </div>
              
              <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome Back! 👋
                </h1>
                <p className="text-white/70 text-lg leading-relaxed">
                  Login to your account and manage your pharmacy operations seamlessly.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Real-time Analytics</p>
                    <p className="text-xs text-white/50">Track sales & inventory</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                    <Heart className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Patient Care</p>
                    <p className="text-xs text-white/50">Manage prescriptions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Smart Reports</p>
                    <p className="text-xs text-white/50">Export & analyze data</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <Fingerprint className="w-4 h-4 text-white/40" />
                  <p className="text-xs text-white/30 text-center">
                    🔒 Secure & Encrypted | 24/7 Support
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-3/5 p-8 lg:p-12 bg-white dark:bg-gray-900">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="lg:hidden flex justify-center mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                      <Pill className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Sign In</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your credentials to access dashboard</p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                    <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 transition text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 transition text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 mt-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Sign In <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials - শুধু তথ্য দেখানোর জন্য (ক্লিক করা যাবে না) */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 text-xs">Demo Credentials</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {demoAccounts.map((demo) => {
                      const Icon = demo.icon;
                      return (
                        <div
                          key={demo.role}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700 cursor-default"
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Icon className={`w-3 h-3 text-${demo.color}-500`} />
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{demo.role}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">{demo.email}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-[10px] text-gray-400 mt-3">
                    Use these credentials to login manually
                  </p>
                </div>

                <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}