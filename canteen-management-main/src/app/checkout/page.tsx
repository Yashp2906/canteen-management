'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Armchair, 
  Receipt, 
  ArrowLeft, 
  CheckCircle, 
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Home
} from 'lucide-react';

type CartItem = {
  food: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isDepartmentOrder, setIsDepartmentOrder] = useState(false);
const [department, setDepartment] = useState('');



  useEffect(() => {
    const storedCart = localStorage.getItem('canteen_cart');
    const storedSession = localStorage.getItem('canteen_session_id');

    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (parsedCart.length === 0 && !isSuccess) router.push('/');
      setCart(parsedCart);
    } else if (!isSuccess) {
      router.push('/');
    }
    if (storedSession) setSessionId(storedSession);
  }, [router, isSuccess]);

  const cartTotal = cart.reduce((sum, i) => sum + i.food.price * i.quantity, 0);

const placeOrder = async () => {

  if (!userName || !userPhone || !tableNo) {
    alert('Please fill all details');
    return;
  }

  if (isDepartmentOrder && !department) {
    alert('Select department for group order');
    return;
  }

  if (userPhone.length !== 10) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  setLoading(true);


    const payload = cart.map((item) => ({
      food_id: item.food.id,
      food_name: item.food.name,
      price: item.food.price,
      quantity: item.quantity,
      table_no: Number(tableNo),
      user_name: userName,
      user_phone: userPhone,
      session_id: sessionId,
      is_department_order: isDepartmentOrder,
  department: isDepartmentOrder ? department : null,
      status: 'placed'
    }));

    const { error } = await supabase.from('orders').insert(payload);

    if (error) {
      alert('Order failed: ' + error.message);
      setLoading(false);
    } else {
      localStorage.removeItem('canteen_cart');
      setCart([]);
      setIsSuccess(true); // Switch to success UI
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 bg-[#0F172A] border border-white/5 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic mb-2 tracking-tighter uppercase">Order Placed!</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Your delicious meal is now in the kitchen's queue. Grab your seat!
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
          >
            <Home className="w-4 h-4" /> Go Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-emerald-500/30">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Menu</span>
        </button>

        <header className="mb-10 text-center">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/20">
            <Receipt className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Checkout</h1>
          <p className="text-slate-400 mt-2">Finish your order and we'll start cooking!</p>
        </header>

        <div className="space-y-6">
          <section className="bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-6 shadow-xl">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="w-3 h-3" /> Dining Information
            </h2>
            
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  placeholder="Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  placeholder="Mobile Number"
                  maxLength={10}
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="relative group">
  <Armchair className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
  
  <select
    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all cursor-pointer"
    value={tableNo}
    onChange={(e) => setTableNo(e.target.value)}
  >
    <option value="" className="bg-slate-900">Select Table Number</option>
    {Array.from({ length: 14 }, (_, i) => (
      <option key={i + 1} value={i + 1} className="bg-slate-900">
        Table {i + 1}
      </option>
    ))}
  </select>

  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none rotate-90" />
                
              </div>

<div className="flex items-center gap-3 mt-4">
  <input
    type="checkbox"
    checked={isDepartmentOrder}
    onChange={(e) => setIsDepartmentOrder(e.target.checked)}
    className="w-4 h-4 accent-emerald-500"
  />
  <label className="text-sm text-slate-400">
    Department Group Order (For Sir)
  </label>
</div>

{isDepartmentOrder && (
  <div className="relative group mt-4">
    <select
      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all cursor-pointer"
      value={department}
      onChange={(e) => setDepartment(e.target.value)}
    >
      <option value="" className="bg-slate-900">Select Department</option>
      <option value="CSE" className="bg-slate-900">CSE</option>
      <option value="EC" className="bg-slate-900">EC</option>
      <option value="MECHANICAL" className="bg-slate-900">MECHANICAL</option>
      <option value="ELECTRICAL" className="bg-slate-900">ELECTRICAL</option>
      <option value="CIVIL" className="bg-slate-900">CIVIL</option>
    </select>

    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none rotate-90" />
  </div>
)}



               
            </div>
          </section>

          <section className="bg-[#0F172A]/80 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShoppingBag className="w-24 h-24 text-white" />
            </div>

            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShoppingBag className="w-3 h-3" /> Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.food.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 w-6 h-6 flex items-center justify-center rounded-md">
                        {item.quantity}
                    </span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.food.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight italic">₹{item.food.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Grand Total</span>
                <span className="text-2xl font-black text-white italic">₹{cartTotal}</span>
              </div>
            </div>
          </section>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-[1.5rem] bg-emerald-500 py-5 text-[#030712] font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></span>
                </span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  CONFIRM ORDER
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
          
          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-4">
            Payment will be collected at the counter after delivery
          </p>
        </div>
      </div>
    </div>
  );
}