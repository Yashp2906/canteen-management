'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { TrendingUp, Package, IndianRupee, Trash2, ArrowUpRight, BarChart3 } from 'lucide-react';


export default function AnalyticsPage() {
  const router = useRouter();
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [itemWiseSales, setItemWiseSales] = useState<
  { food_name: string; quantity: number; revenue: number }[]
>([]);

  // FIX: Added state for time to prevent hydration error
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push('/admin/login');
      await fetchTodaySales();
      await fetchItemWiseSales();

      setLoading(false);
    };
    init();

    // FIX: Set time only on client side
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [router]);

  const fetchTodaySales = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('orders')
      .select('price, quantity')
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString());

    let items = 0;
    let revenue = 0;

    data?.forEach((o) => {
      items += o.quantity;
      revenue += o.price * o.quantity;
    });

    setTotalItemsSold(items);
    setTotalRevenue(revenue);
  };

  const fetchItemWiseSales = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('food_name, quantity, price')
    .eq('status', 'delivered')
    .gte('created_at', today.toISOString());

  if (error) {
    console.error(error);
    return;
  }

  const map: Record<
    string,
    { food_name: string; quantity: number; revenue: number }
  > = {};

  data?.forEach((o) => {
    if (!map[o.food_name]) {
      map[o.food_name] = {
        food_name: o.food_name,
        quantity: 0,
        revenue: 0,
      };
    }

    map[o.food_name].quantity += o.quantity;
    map[o.food_name].revenue += o.price * o.quantity;
  });

  setItemWiseSales(Object.values(map));
};


  const clearTodayDeliveredOrders = async () => {
    if (!confirm('Clear today’s delivered orders? This action cannot be undone.')) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await supabase
      .from('orders')
      .delete()
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString());

    fetchTodaySales();
    setItemWiseSales([]);

  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 selection:bg-indigo-500/30 font-sans selection:text-indigo-200">
      {/* Background Orbs - Softer, more professional blur */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase">Executive Dashboard</span>
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Canteen <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Insights</span>
            </h1>
            <p className="text-slate-400 mt-3 text-lg max-w-md">
              Monitoring real-time sales and performance metrics for your canteen operations.
            </p>
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            {/* FIXED: Using the time state here instead of new Date() directly */}
            <p className="text-sm font-medium text-slate-300">
              {currentTime ? `${currentTime} Today` : 'Loading...'}
            </p>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Items Sold */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Live</span>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-widest">Items Sold</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white mt-2 tabular-nums">{totalItemsSold}</span>
                  <span className="text-slate-500 text-lg">units</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[70%] rounded-full"></div>
                </div>
                <p className="mt-3 text-xs text-slate-500 italic">Volume of service for the current session</p>
              </div>
            </div>
          </div>

          {/* Card: Revenue */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-fuchsia-500/10 rounded-2xl text-fuchsia-400">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-fuchsia-400 text-sm font-medium bg-fuchsia-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span>Growth</span>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-widest">Gross Revenue</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white mt-2 tabular-nums">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 text-slate-500">
                <p className="text-xs italic leading-relaxed">Generated from {totalItemsSold} completed transactions today.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ITEM WISE SALES */}
<div className="mt-16">
  <h2 className="text-2xl font-bold text-white mb-6">
    📦 Item-wise Sales Today
  </h2>

  {itemWiseSales.length === 0 ? (
    <p className="text-slate-500">No items sold yet.</p>
  ) : (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-slate-300 text-sm uppercase">
          <tr>
            <th className="px-6 py-4">Food Item</th>
            <th className="px-6 py-4">Quantity Sold</th>
            <th className="px-6 py-4">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {itemWiseSales.map((item) => (
            <tr
              key={item.food_name}
              className="border-t border-white/5 hover:bg-white/5 transition"
            >
              <td className="px-6 py-4 font-medium text-white">
                {item.food_name}
              </td>
              <td className="px-6 py-4 text-slate-300">
                {item.quantity}
              </td>
              <td className="px-6 py-4 font-semibold text-emerald-400">
                ₹{item.revenue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


        {/* Footer Actions */}
        <div className="mt-16 flex flex-col items-center">
          {totalItemsSold > 0 ? (
            <button
              onClick={clearTodayDeliveredOrders}
              className="group flex items-center gap-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-8 py-4 rounded-2xl transition-all duration-300"
            >
              <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <span className="text-slate-300 group-hover:text-red-400 font-medium">Archive Today's Session</span>
            </button>
          ) : (
            <div className="text-center p-12 border-2 border-dashed border-white/5 rounded-3xl w-full">
              <p className="text-slate-500 font-medium">No sales data available for today yet.</p>
            </div>
          )}
          
          <p className="mt-6 text-slate-600 text-xs">
            Admin Security: Only authorized accounts can access this data.
          </p>
        </div>
      </div>
    </div>
  );
}