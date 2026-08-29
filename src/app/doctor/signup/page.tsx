'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, Award, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { NAIROBI_NEIGHBOURHOODS } from '@/lib/constants';

export default function DoctorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    kmpdcLicenseNo: '',
    cadre: 'Medical Practitioner',
    specialty: 'General Practice & Family Medicine',
    neighbourhood: NAIROBI_NEIGHBOURHOODS[0].neighbourhood,
    address: 'Nairobi, Kenya',
    payoutMpesa: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedPhone = formData.phone.startsWith('+254')
        ? formData.phone
        : '+254' + formData.phone.replace(/^0/, '');

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formattedPhone,
          payoutMpesa: formData.payoutMpesa || formattedPhone,
          role: 'DOCTOR',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/doctor');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-700/20">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Join the Daktari Mtaani Doctor Roster
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
          Deliver on-demand teleconsultations and home care. All practitioners undergo KMPDC licensure verification.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-card space-y-6">
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your KMPDC license is pending verification by our clinical ops team. Redirecting you to your doctor console...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Full Name (with title)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Mutua"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  placeholder="07XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Create Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 2. Medical Credentials */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                KMPDC Professional Licensure
              </span>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    KMPDC License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KMPDC/A9921/2026"
                    value={formData.kmpdcLicenseNo}
                    onChange={(e) => setFormData({ ...formData, kmpdcLicenseNo: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cadre / Qualification
                  </label>
                  <select
                    value={formData.cadre}
                    onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Medical Practitioner">Medical Practitioner (MBChB)</option>
                    <option value="Specialist">Specialist / Consultant</option>
                    <option value="Clinical Officer">Clinical Officer (CO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Practice, Pediatrics, Emergency Care"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 3. Operational Pilot Hub & Payout */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Pilot Area & M-Pesa Payouts
              </span>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Pilot Zone
                  </label>
                  <select
                    value={formData.neighbourhood}
                    onChange={(e) => setFormData({ ...formData, neighbourhood: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {NAIROBI_NEIGHBOURHOODS.map((n, i) => (
                      <option key={i} value={n.neighbourhood}>
                        {n.neighbourhood}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    M-Pesa Payout Number
                  </label>
                  <input
                    type="text"
                    placeholder="07XXXXXXXX"
                    value={formData.payoutMpesa}
                    onChange={(e) => setFormData({ ...formData, payoutMpesa: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Brief Bio & Experience
                </label>
                <textarea
                  rows={2}
                  placeholder="Medical background, years of practice, clinic affiliations..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                By applying, you confirm that your KMPDC license is current and you maintain valid Professional Indemnity cover.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{loading ? 'Submitting Application...' : 'Submit Doctor Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/doctor/login" className="text-emerald-700 font-bold hover:underline">
              Sign In Here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
