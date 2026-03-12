"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import {
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  ArrowRight,
  LogOut,
  Bell,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [notifications, setNotifications] = useState<
    { id: string; message: string }[]
  >([]);

  const [showNotifications, setShowNotifications] = useState(false);

  /* ================= AUDIO INIT ================= */

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  /* ================= AUTH CHECK ================= */

useEffect(() => {
  const token = localStorage.getItem("admin-auth");

  if (!token) {
    router.push("/admin/login");
  }
}, [router]);

  /* ================= ORDER NOTIFICATIONS ================= */



useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch("/api/orders/latest");
      if (!res.ok || res.status === 204) return;
      
      const order = await res.json();
      if (!order || !order.id || !order.createdAt) return;

      // 1. CALCULATE IF THE ORDER IS ACTUALLY NEW
      const orderTime = new Date(order.createdAt).getTime();
      const currentTime = new Date().getTime();
      const secondsAgo = (currentTime - orderTime) / 1000;

      // Only proceed if the order was placed in the last 60 seconds
      // Change '60' to '10' if you want it even stricter
      if (secondsAgo > 60) {
        return; 
      }

      setNotifications((prev) => {
        // 2. CHECK FOR DUPLICATES (Don't ring/show if we already added it)
        const isDuplicate = prev.some((n) => n.id === order.id);
        if (isDuplicate) return prev;

        // 3. PLAY AUDIO (Now only runs for truly fresh, non-duplicate orders)
        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error("Audio error:", err));
        }

        const message = order.is_department_order 
          ? `🏫 SIR ORDER (${order.department}) ➜ ${order.food_name} × ${order.quantity}`
          : `🛎️ New Order: ${order.food_name} × ${order.quantity} (Table ${order.table_no})`;

        return [{ id: order.id, message }, ...prev];
      });

    } catch (err) {
      console.error("Polling error:", err);
    }
  }, 4000); 

  return () => clearInterval(interval);
}, []);

  /* ================= LOGOUT ================= */

/* ================= LOGOUT ================= */

const handleLogout = async () => {
  localStorage.removeItem("admin-auth");

  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include",
  });

  router.push("/admin/login");
};

  return (




    <div className="relative min-h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans">



      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Top Navbar Area */}
        <nav className="flex justify-between items-center mb-16">
          {/* LEFT LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <UtensilsCrossed className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Canteen<span className="text-indigo-500">Pro</span>
            </span>
          </div>

          {/* RIGHT ACTIONS */}
          {/* 🔔 Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <Bell className="w-5 h-5 text-slate-300" />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-4 relative">



            {/* 🔔 Notification Bell */}



            {/* 🔽 Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl z-50">
                <div className="p-3 font-semibold border-b border-white/5">
                  Notifications
                </div>

                {notifications.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 text-sm border-b border-white/5 hover:bg-white/5"
                    >
                      {n.message}
                    </div>
                  ))
                )}

                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="w-full py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}

            {/* 🚪 Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

          </div>
        </nav>


        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Administrator
            </span>
          </h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl">
            Everything you need to manage your canteen operations is right here. Select a module to begin.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Orders Card */}
          <button
            onClick={() => router.push('/admin/orders')}
            className="group relative text-left"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-full bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Orders</h2>
                <p className="text-slate-400 leading-relaxed">
                  Monitor live incoming orders, manage kitchen status, and track delivery progress.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-4 transition-all">
                <span>Manage Orders</span>
                <ArrowRight className="w-5 h-5" />
              </div>
              {/* Abstract decorative shape */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
            </div>
          </button>

          {/* Food Card */}
          <button
            onClick={() => router.push('/admin/foods')}
            className="group relative text-left"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400 to-rose-600 rounded-[2rem] blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-full bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Menu</h2>
                <p className="text-slate-400 leading-relaxed">
                  Update pricing, toggle item availability, and add new seasonal delicacies to the menu.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-4 transition-all">
                <span>Manage Foods</span>
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
            </div>
          </button>

          {/* Analytics Card */}
          <button
            onClick={() => router.push('/admin/analytics')}
            className="group relative text-left"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-[2rem] blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-full bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Analytics</h2>
                <p className="text-slate-400 leading-relaxed">
                  Dive deep into sales reports, revenue trends, and identify your best-selling items.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-4 transition-all">
                <span>View Insights</span>
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
            </div>
          </button>

        </div>

        {/* Quick System Status Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Server: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Database: Connected</span>
            </div>
          </div>
          <div className="text-slate-600 text-xs">
            System Version 2.0.4 • Powered by Supabase
          </div>
        </div>
      </div>
    </div>
  );
}