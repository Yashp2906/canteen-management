'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

export default function AdminRegister() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // New state to check status on load
  const [isAdminExists, setIsAdminExists] = useState(false); // New state to block UI
  const [error, setError] = useState<string | null>(null);

  // 🛡️ CHECK ON PAGE LOAD: See if admin is already registered
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.from('admins').select('id').limit(1);
        if (data && data.length > 0) {
          setIsAdminExists(true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      } finally {
        setChecking(false);
      }
    };
    checkAdminStatus();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // 🔒 STEP 1: Double-check logic (Security)
      const { data: existingAdmins } = await supabase.from('admins').select('id').limit(1);
      if (existingAdmins && existingAdmins.length > 0) {
        setError('Security Alert: Registration is permanently locked.');
        setIsAdminExists(true);
        setLoading(false);
        return;
      }

      // 🔐 STEP 2: Create Supabase Auth User
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Failed to create admin user.');
        setLoading(false);
        return;
      }

      // 🧾 STEP 3: Insert into admins table
      const { error: insertError } = await supabase.from('admins').insert([
        {
          id: data.user.id,
          email: email,
        },
      ]);

      if (insertError) {
        setError('Database error. Admin record could not be created.');
        setLoading(false);
        return;
      }

      alert('Admin registered successfully!');
      router.push('/admin/login');
    } catch (err) {
      setError('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 🚦 SCREEN: Loading state while checking DB
  if (checking) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden flex items-center justify-center px-6">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md group">
        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-blue-500/30 rounded-[2.5rem] blur opacity-40" />

        <div className="relative rounded-[2.5rem] bg-[#0F172A]/80 border border-white/10 p-10 backdrop-blur-3xl shadow-2xl">
          
          {/* 🚫 BLOCKED UI: If Admin Already Exists */}
          {isAdminExists ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-rose-500/30">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Registration Locked</h1>
              <p className="text-slate-400 mb-8">
                A canteen administrator has already been registered. For security, only one account is permitted.
              </p>
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            /* ✅ REGISTRATION FORM: Only shows if table is empty */
            <form onSubmit={handleRegister}>
              <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                  <UserPlus className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">System Setup</h1>
                <p className="text-slate-400 text-center mt-2 text-sm">
                  Register the primary canteen admin
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-10 w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 py-4 text-white font-bold hover:opacity-90 transition-opacity"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Initialize Admin</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}