'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PatientSignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('0712345678');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !consentGiven) return;
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+254') ? phone : '+254' + phone.replace(/^0/, '');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formattedPhone, role: 'PATIENT', name: name || undefined }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event('daktari_auth_changed'));
        router.push('/patient/request');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/20">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 11c2.5 0 4-1.5 4-4s-1.5-4-4-4-4 1.5-4 4 1.5 4 4 4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 14c-2.2 1.5-4.8 2-8 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Sign Up</h1>
        <p className="text-xs text-slate-500">Create a patient account using your mobile number (OTP sign-in).</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-card space-y-5">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Wanjiku"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-semibold">🇰🇪 +254</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="712345678"
                required
                className="w-full pl-20 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              required
            />
            <label htmlFor="consent" className="text-[11px] leading-tight">
              I consent to the collection and processing of my medical triage data in accordance with the <strong>Kenya Data Protection Act, 2019</strong>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !consentGiven}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? 'Creating account...' : 'Create Patient Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs text-slate-400">
            <p>Already have an account?</p>
            <button
              type="button"
              onClick={() => router.push('/patient/login')}
              className="text-emerald-700 font-bold hover:underline mt-2"
            >
              Sign in with OTP →
            </button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400 space-y-1">
        <p>Need a clinician account?</p>
        <button
          onClick={() => router.push('/doctor/signup')}
          className="text-emerald-700 font-bold hover:underline"
        >
          Doctor / Clinician Sign Up →
        </button>
      </div>
    </div>
  );
}
