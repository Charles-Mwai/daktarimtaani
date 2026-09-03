'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ambulance, ShieldCheck, ArrowRight, Phone, Mail, FileText, MapPin, Building } from 'lucide-react';

export default function AmbulanceSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    contactPhone: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    licenseNo: '',
    serviceArea: 'Nairobi',
    payoutMpesa: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ambulance/provider/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          password: form.password,
          licenseNo: form.licenseNo,
          serviceArea: form.serviceArea,
          payoutMpesa: form.payoutMpesa || form.contactPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-amber-700" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Registration Submitted</h1>
        <p className="text-sm text-slate-600">
          Your ambulance service has been registered. A Daktari Mtaani administrator will verify your
          credentials and activate your account within 24 hours.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 text-left">
          <p className="font-bold mb-1">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Admin reviews your license and service area</li>
            <li>Your units are cleared for dispatch upon verification</li>
            <li>You receive confirmation at your registered email or phone</li>
          </ol>
        </div>
        <button
          onClick={() => router.push('/ambulance/login')}
          className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm"
        >
          Go to Login
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Ambulance className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Register Your Ambulance Service</h1>
        <p className="text-sm text-slate-500">
          Join the Daktari Mtaani dispatch network. Fill in your company details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            <Building className="w-3.5 h-3.5 inline mr-1" />Company / Organisation Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Kenya Red Cross Ambulance Service"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              <Phone className="w-3.5 h-3.5 inline mr-1" />Contact Phone
            </label>
            <input
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="+254711000100"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              <Mail className="w-3.5 h-3.5 inline mr-1" />Email (optional)
            </label>
            <input
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="dispatch@company.co.ke"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              <FileText className="w-3.5 h-3.5 inline mr-1" />Licence / Permit No.
            </label>
            <input
              value={form.licenseNo}
              onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
              placeholder="NTSA/AMB/KE-0042"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Service Area
            </label>
            <input
              value={form.serviceArea}
              onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
              placeholder="Nairobi"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            M-Pesa Payout Number
          </label>
          <input
            value={form.payoutMpesa}
            onChange={(e) => setForm({ ...form, payoutMpesa: e.target.value })}
            placeholder="+254711000100 (defaults to contact phone)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Confirm Password
            </label>
            <input
              required
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repeat password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            Admin verification required
          </div>
          <p>Your registration will be reviewed before you can accept dispatches. Verified providers have their units automatically cleared for dispatch eligibility.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting...' : 'Register Ambulance Service'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => router.push('/ambulance/login')}
            className="text-amber-700 font-bold hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
