'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
  setError(null);

  try {
   const res = await fetch("/api/admin/login", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

    const data = await res.json();

   if (!res.ok) {
  setError(data.message || "Invalid credentials");
  setLoading(false);
  return;
}

// store login state
localStorage.setItem("admin-auth", "true");

router.push("/admin/dashboard");

    
  } catch (err) {
    setError("Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden flex items-center justify-center px-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md group">
        {/* Animated Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

        <form
          onSubmit={handleLogin}
          className="relative rounded-[2.5rem] bg-[#0F172A]/80 border border-white/10 p-10 backdrop-blur-3xl shadow-2xl"
        >
          {/* Logo/Icon Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight text-center">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-center mt-2">
              Secure access to Canteen Admin
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 text-sm flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-5">
            <div className="group/input relative">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  placeholder="name@canteen.com"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-12 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="group/input relative">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-12 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-10 w-full group/btn relative flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-[#030712] font-bold text-lg hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500">
              New admin?{' '}
              <a
                href="/admin/register"
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                Create an account
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Floating System Info (Decorative) */}
      <div className="absolute bottom-8 text-slate-600 text-xs tracking-widest uppercase flex items-center gap-4">
        <span>Encrypted</span>
        <div className="w-1 h-1 bg-slate-800 rounded-full" />
        <span>V2.0 Protocol</span>
        <div className="w-1 h-1 bg-slate-800 rounded-full" />
        <span>Secure Session</span>
      </div>
    </div>
  );
}