'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('+254722100200');
  const [password, setPassword] = useState('DoctorPass123!');
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
          role: 'DOCTOR',
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event('daktari_auth_changed'));
        router.push('/doctor');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-700/20">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Console Login</h1>
        <p className="text-xs text-slate-500">
          Sign in to manage patient dispatches, video consultations & M-Pesa payouts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-card space-y-5">
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+254722100200 or dr.kamau@daktari.co.ke"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Pre-configured test doctor: <code>+254722100200</code> / <code>DoctorPass123!</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Doctor Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Not yet registered on Daktari Mtaani?{' '}
            <Link href="/doctor/signup" className="text-emerald-700 font-bold hover:underline">
              Apply as a Doctor →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
