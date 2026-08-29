'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Activity } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin@daktari.co.ke');
  const [password, setPassword] = useState('AdminSecure2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          role: 'ADMIN',
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event('daktari_auth_changed'));
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Login connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-xl">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Clinical Operations & Admin
        </h1>
        <p className="text-xs text-slate-500">
          Authorized personnel only. KMPDC verification & dispatch control.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-card space-y-5">
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Email / Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@daktari.co.ke"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Secret Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Pre-configured admin login: <code>admin@daktari.co.ke</code> / <code>AdminSecure2026!</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{loading ? 'Authenticating...' : 'Access Admin Control Center'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </form>
      </div>
    </div>
  );
}
