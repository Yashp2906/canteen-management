'use client';

import { useEffect, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { optimizeCloudinary, cloudinaryBlur } from "@/lib/cloudinaryUpload";
import {
  ShoppingBag,
  Plus,
  Minus,
  ChevronRight,
  Utensils,
  Search,
  ShoppingCart,
  History,
  X,
  ClipboardList,
  Clock,
  Trash2,

} from 'lucide-react';


type HomeClientProps = {
  initialFoods: Food[];
};
/* ================= TYPES ================= */

type Food = {
  _id: string;
  name: string;
  price: number;
  image_url: string | null;
  status: 'available' | 'unavailable';
  category_id: string | null;
};


type CartItem = {
  food: Food;
  quantity: number;
};

/* ================= COMPONENT ================= */

export default function HomeClient({ initialFoods }: HomeClientProps) {
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>(initialFoods || []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // States for Order Modal
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);



  /* ================= SESSION INIT ================= */

  useEffect(() => {
    let id = sessionStorage.getItem('canteen_session_id');
    if (!id) {
      id = uuidv4();
      sessionStorage.setItem('canteen_session_id', id);
    }
    setSessionId(id);

    const storedCart = sessionStorage.getItem('canteen_cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  /* ================= LOAD FOODS ================= */

  // useEffect(() => {
  //   fetchFoods();
  //   fetchCategories();

  //   const channel = supabase
  //     .channel('user-foods-realtime')
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'foods' }, fetchFoods)
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchMyOrdersInternal)
  //     .subscribe();

  //   return () => { supabase.removeChannel(channel); };
  // }, []);
/* ================= AUTO REFRESH FOODS ================= */

useEffect(() => {
  // Initial fetch
  fetchFoods();
  fetchCategories();

  // Set up interval to check for status updates (e.g., every 5 seconds)
  const interval = setInterval(() => {
    fetchFoods();
    fetchCategories();
  }, 5000); 

  return () => clearInterval(interval);
}, []);

const fetchFoods = async () => {
  const res = await fetch("/api/foods", { cache: "no-store" });
  const data = await res.json();
  setFoods(data);
};
const fetchCategories = async () => {
  const res = await fetch("/api/categories", { cache: "no-store" });
  const data = await res.json();
  setCategories(data);
};

  /* ================= MY ORDERS LOGIC ================= */

const fetchMyOrdersInternal = async () => {
  const sId = sessionStorage.getItem("canteen_session_id");

  const res = await fetch(`/api/orders?session_id=${sId}`);
  const data = await res.json();

  setMyOrders(data);
};
useEffect(() => {
  if (!showOrdersModal) return;

  const interval = setInterval(() => {
    fetchMyOrdersInternal();
  }, 3000); // refresh every 3 seconds

  return () => clearInterval(interval);
}, [showOrdersModal]);
  const openOrdersModal = () => {
    fetchMyOrdersInternal();
    setShowOrdersModal(true);
  };

const cancelOrder = async (orderId: string) => {
  if (!confirm("Cancel this order?")) return;

  try {
    console.log("Deleting order id:", orderId);

 const res = await fetch(`/api/orders/${orderId}`, {
  method: "DELETE",
});
    const data = await res.json();

    console.log("Delete result:", data);

    fetchMyOrdersInternal();

  } catch (err) {
    console.error("Delete failed:", err);
  }
};





  /* ================= GPS RADIUS CHECK LOGIC (AUTO TRIGGER) ================= */



  /* ================= CART LOGIC ================= */

  const addToCart = (food: Food) => {
    setCart((prev) => [...prev, { food, quantity: 1 }]);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.food._id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  useEffect(() => {
    sessionStorage.setItem('canteen_cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = cart.reduce((sum, i) => sum + i.food.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

const matchesCategory =
    activeCategory === 'all' || 
    (food.category_id && typeof food.category_id === 'object' 
      ? (food.category_id as any)._id === activeCategory 
      : food.category_id === activeCategory);

    return matchesSearch && matchesCategory;
  });


  const getItemInCart = (foodId: string) => cart.find(item => item.food._id === foodId);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans pb-32">

      {/* FLOATING VIEW ORDER BUTTON */}
      <div className="fixed top-24 right-6 z-40">
        <button
          onClick={openOrdersModal}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all shadow-2xl group active:scale-90"
        >
          <History className="w-6 h-6 text-orange-500 group-hover:rotate-[-12deg] transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </button>
      </div>

      {/* Header Section */}
      <header className="sticky top-0 z-30 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Utensils className="text-orange-500 w-5 h-5" />
              Canteen<span className="text-orange-500">Express</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase italic">Fresh. Fast. Tasty.</p>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Hungry for...?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="relative rounded-[2.5rem] h-44 overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-rose-600 flex items-center p-8 shadow-2xl shadow-orange-900/20">
          <div className="relative z-10">

            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Flash Deals</h2>
            <p className="text-orange-100 font-medium opacity-80 text-sm">Delicious meals at campus prices.</p>
          </div>
          <ShoppingCart className="absolute right-[-5%] bottom-[-15%] w-56 h-56 text-white/10 rotate-12" />
        </div>
      </div>
      {/* CATEGORY FILTER */}
      {/* CATEGORY FILTER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-full w-fit pb-2">

            {/* ALL BUTTON */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${activeCategory === 'all'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              All
            </button>

            {/* CATEGORY BUTTONS */}
            {categories?.map((cat) => (
  <button
    key={cat._id}
    onClick={() => setActiveCategory(cat._id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${activeCategory === cat._id
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
              >
                {cat.name}
              </button>
            ))}

          </div>
        </div>
      </div>

      {/* FOOD MENU */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">Today's Selection</h2>
          <div className="h-[2px] flex-1 mx-6 bg-gradient-to-r from-white/10 to-transparent hidden sm:block" />
          <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest">
            {filteredFoods.length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFoods.map((food) => {
            const cartItem = getItemInCart(food._id);

            return (
              <div
                key={food._id}
                className={`group relative rounded-[2.5rem] bg-[#0F172A]/40 border border-white/5 overflow-hidden transition-all duration-500 hover:bg-[#0F172A]/80 hover:border-orange-500/30 ${food.status === 'unavailable' ? 'grayscale opacity-60' : ''
                  }`}
              >
                <div className="relative h-52 overflow-hidden">
                  {food.image_url ? (
                    <Image
                      src={optimizeCloudinary(food.image_url, 500)}
                      alt={food.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      placeholder="blur"
                      blurDataURL={cloudinaryBlur(food.image_url)}
                      priority={filteredFoods.indexOf(food) < 4}
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                      <Utensils className="w-10 h-10 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-5">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mb-1">Price</p>
                    <span className="text-3xl font-black text-white italic tracking-tighter">₹{food.price}</span>
                  </div>

                  <div className="absolute bottom-4 right-5">
                    {food.status === 'unavailable' ? (
                      <div className="bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-slate-400 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                        Sold Out
                      </div>
                    ) : cartItem ? (
                      <div className="flex items-center gap-3 bg-white text-slate-900 p-1.5 rounded-2xl shadow-2xl animate-in zoom-in-90 duration-300">
                        <button onClick={() => updateQty(food._id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-black w-4 text-center text-lg">{cartItem.quantity}</span>
                        <button onClick={() => updateQty(food._id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(food)} className="bg-white hover:bg-orange-500 hover:text-white text-slate-900 px-5 py-2.5 rounded-2xl shadow-xl font-bold flex items-center gap-2 transition-all active:scale-90 group/btn">
                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                        ADD
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-4">
                  <h3 className="font-bold text-xl text-white group-hover:text-orange-400 transition-colors tracking-tight">
                    {food.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">In Kitchen</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- ORDER DETAILS MODAL --- */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowOrdersModal(false)} />

          <div className="relative bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ClipboardList className="text-orange-500" /> My Orders
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live Tracking</p>
              </div>
              <button onClick={() => setShowOrdersModal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No active orders found.</p>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div key={order._id} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex justify-between items-center group relative overflow-hidden">
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center font-bold text-orange-500">
                        {order.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-tight">{order.food_name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Table {order.table_no}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 z-10">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'
                        }`}>
                        {order.status}
                      </div>

                      {/* CANCEL BUTTON: Only visible if status is 'placed' */}
                      {order.status === 'placed' && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="flex items-center gap-1 text-[9px] font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-tighter"
                        >
                          <Trash2 className="w-3 h-3" /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-black/40 text-center border-t border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Cancellations only allowed before preparation.</p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">



          <div className="bg-orange-500 rounded-[2rem] p-4 shadow-2xl shadow-orange-900/40 flex items-center justify-between border border-orange-400/20">
            <div className="flex items-center gap-4 pl-3">
              <div className="relative">
                <div className="bg-white/20 p-2.5 rounded-2xl">
                  <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-lg font-black text-white italic leading-none">₹{cartTotal}</p>
                <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest mt-1">Ready to Order</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="bg-slate-900 text-white hover:bg-black rounded-2xl px-8 py-3.5 flex items-center gap-2 transition-all group active:scale-95"
            >
              <span className="font-black text-sm uppercase tracking-widest">
                Checkout
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="mt-8 relative">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <div className="bg-[#030712]/90 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Canteen<span className="text-orange-500">Express</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-widest">
                  Fresh • Fast • Tasty
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  © {new Date().getFullYear()} College Canteen System
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  All rights reserved
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-slate-400">
                  Developed with <span className="text-red-400">❤️</span> by
                </p>
                <p className="text-lg font-bold text-orange-400 tracking-wide">
                  Yash Parmar
                </p>
              </div>
            </div>
            <div className="mt-10 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em]">
                Built for Smart Canteen Management
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}