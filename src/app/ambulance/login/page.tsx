'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ambulance, LogIn, Phone } from 'lucide-react';

export default function AmbulanceLoginPage() {
  const router = useRouter();
  const [contactPhone, setContactPhone] = useState('+254711000100');
  const [password, setPassword] = useState('AmbuPass2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/ambulance/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPhone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials.');
        return;
      }

      window.dispatchEvent(new Event('daktari_auth_changed'));
      router.push('/ambulance');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Ambulance className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ambulance Operator Portal</h1>
        <p className="text-sm text-slate-500">Sign in to manage your fleet and accept dispatches.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            <Phone className="w-3.5 h-3.5 inline mr-1" />Contact Phone
          </label>
          <input
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+254711000100"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500">
          New provider?{' '}
          <button
            type="button"
            onClick={() => router.push('/ambulance/signup')}
            className="text-amber-700 font-bold hover:underline"
          >
            Register your service
          </button>
        </p>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
          <p className="font-semibold text-slate-700">Demo credentials</p>
          <p>Phone: <span className="font-mono">+254711000100</span></p>
          <p>Password: <span className="font-mono">AmbuPass2026!</span></p>
        </div>
      </form>
    </div>
  );
}
