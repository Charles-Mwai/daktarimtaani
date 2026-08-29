'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function PatientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('0712345678');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+254') ? phone : '+254' + phone.replace(/^0/, '');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formattedPhone,
          role: 'PATIENT',
          otp: otp || '123456',
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event('daktari_auth_changed'));
        router.push('/patient/request');
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/20">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Portal Login</h1>
        <p className="text-xs text-slate-500">
          Instant OTP access for on-demand doctor consultations in Kenya.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-card space-y-5">
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Safaricom / Airtel Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-semibold">
                  🇰🇪 +254
                </span>
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
              <span>{loading ? 'Sending OTP SMS...' : 'Continue with Phone OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full">
                OTP Sent to +254 {phone}
              </span>
              <p className="text-xs text-slate-400 pt-1">
                Enter the 6-digit verification code sent to your phone:
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1 2 3 4 5 6"
                className="w-full py-3 rounded-xl border border-slate-200 text-center text-lg font-mono font-bold tracking-widest text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <p className="text-[10px] text-center text-slate-400 mt-1">
                (Pilot test mode: enter any 6-digit code e.g. <code>123456</code>)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Enter Patient Portal'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 space-y-1">
        <p>Are you a healthcare practitioner?</p>
        <button
          onClick={() => router.push('/doctor/login')}
          className="text-emerald-700 font-bold hover:underline"
        >
          Doctor & Clinician Login →
        </button>
      </div>
    </div>
  );
}
