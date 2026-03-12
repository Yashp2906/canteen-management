"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  User,
  Phone,
  ChevronRight,
  LayoutGrid,
  Coffee,
  CheckCircle2,
  Timer,
  RefreshCw
} from "lucide-react";

/* ================= TYPES ================= */

type Order = {
  _id: string;
  food_name: string;
  quantity: number;
  status: string;
  table_no: number;
  user_name: string;
  user_phone: string;
  is_department_order: boolean;
  department: string | null;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ================= AUTH + FETCH ================= */

useEffect(() => {
  const token = localStorage.getItem("admin-auth");

  if (!token) {
    router.push("/admin/login");
    return;
  }

  fetchOrders();
}, [router]);

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000); // refresh every 4s

    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async () => {

    setIsRefreshing(true);

    const res = await fetch("/api/orders");

    const data = await res.json();

    if (data) setOrders(data);

    setTimeout(() => setIsRefreshing(false), 600);
  };

  /* ================= UPDATE STATUS ================= */

  const updateOrderStatus = async (orderId: string, status: string) => {

    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    fetchOrders();
  };

// Filter out delivered orders so they don't show on the kitchen feed
const activeOrders = orders.filter(order => order.status !== "delivered");

const groupedOrders = activeOrders.reduce((acc, order) => {
  if (!acc[order.table_no]) acc[order.table_no] = [];
  acc[order.table_no].push(order);
  return acc;
}, {} as Record<number, Order[]>);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">Live Kitchen Feed</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Active Orders
            </h1>
          </div>
          
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
        </header>

        {Object.keys(groupedOrders).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#0F172A]/40 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Coffee className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-400">All caught up!</h2>
            <p className="text-slate-500 mt-2">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-10">
            {Object.entries(groupedOrders).map(([tableNo, tableOrders]) => (
              <div
                key={tableNo}
                className="group relative bg-[#0F172A]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-indigo-500/30"
              >
                {/* TABLE HEADER */}
                <div className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-white text-xl">
                      {tableNo}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Table Station</h3>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{tableOrders.length} Pending Items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                    <Timer className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Priority: High</span>
                  </div>
                </div>

                {/* ORDERS LIST */}
                <div className="p-8 space-y-4">
                  {tableOrders.map((order) => (
                    <div
                      key={order._id}
                      className="group/item flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20">
                          {order.quantity}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white tracking-tight leading-tight">
                            {order.food_name}
                          </p>
                          {order.is_department_order && (
  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
    🏫 {order.department} - Sir Group
  </div>
)}

                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-sm text-slate-400">
                              <User className="w-3.5 h-3.5 text-slate-500" /> {order.user_name}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-500" /> {order.user_phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end lg:self-center">
                        {/* Status Chip */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
                          order.status === 'placed' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            order.status === 'placed' ? 'bg-amber-500' :
                            order.status === 'preparing' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`} />
                          {order.status}
                        </div>

                        {/* Custom Select Wrapper */}
                        <div className="relative group/select">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="appearance-none rounded-xl bg-slate-900 border border-white/10 text-white pl-4 pr-10 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-white/20 transition-all"
                          >
                            <option value="placed">Placed</option>
                            <option value="preparing">Preparing</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered ✅</option>
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover/select:text-white transition-colors rotate-90" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}