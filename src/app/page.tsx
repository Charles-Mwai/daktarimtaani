'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Home,
  Clock,
  ArrowRight,
  Award,
  Lock,
  Smartphone,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { PRICING } from '@/lib/constants';
import { formatKES } from '@/lib/utils';
import { loadState, saveState } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [onlineCount, setOnlineCount] = useState(2);

  useEffect(() => {
    const state = loadState();
    setOnlineCount(
      state.doctors.filter(d => d.isOnline && d.verificationStatus === 'verified').length
    );
  }, []);

  const startService = (service: 'teleconsult' | 'home_visit' | 'ambulance') => {
    const state = loadState();
    state.activeRole = 'patient';
    saveState(state);
    router.push(`/patient/request?service=${service}`);
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-10">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1a3a2a] text-white">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
          }}
        />
        {/* Glows */}
        <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-72 sm:h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-52 h-52 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-5 py-10 sm:px-10 sm:py-14 md:px-16 md:py-20">
          {/* Live pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-600/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Nairobi Pilot Live &middot; {onlineCount} Verified Doctors Online</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
            Daktari <span className="text-emerald-400">kwa simu</span>.
            <br />
            <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-white/70">
              Doctor to your door.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-5 max-w-lg">
            Skip the long queues. Speak to a licensed KMPDC doctor by video in minutes,
            or have one come straight to you — anywhere in Nairobi.
          </p>

          {/* Location badge */}
          <div className="flex items-center gap-1.5 text-emerald-400/80 text-xs font-medium mb-7">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Ruaka · Westlands · Kilimani · Rosslyn &amp; all of Nairobi</span>
          </div>

          {/* CTA buttons — full-width on mobile, auto on sm+ */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => startService('teleconsult')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-[#1a3a2a] px-6 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-50 shadow-lg shadow-black/20 transition-all active:scale-95 min-h-[52px]"
            >
              <Video className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Video Consult Now</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>

            <button
              onClick={() => startService('home_visit')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 min-h-[52px]"
            >
              <Home className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Send a Doctor Home</span>
            </button>

            <button
              onClick={() => startService('ambulance')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-amber-900/30 min-h-[52px]"
            >
              <span className="text-lg leading-none">🚑</span>
              <span>Request Ambulance</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">As easy as ordering a ride</h2>
          <p className="text-sm text-slate-500">No app. No registration. Just healthcare.</p>
        </div>

        {/* On mobile: horizontal scroll with snap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              step: '1',
              emoji: '📍',
              title: 'Tell us where you are',
              desc: 'Pick your neighbourhood and describe your symptoms — takes 60 seconds.',
              color: 'bg-amber-50 border-amber-100',
            },
            {
              step: '2',
              emoji: '💳',
              title: 'Pay via M-Pesa',
              desc: 'Confirm with M-Pesa STK push. Funds held in escrow until care is delivered.',
              color: 'bg-emerald-50 border-emerald-100',
            },
            {
              step: '3',
              emoji: '👨‍⚕️',
              title: 'Doctor connects or arrives',
              desc: 'Your matched KMPDC doctor joins by video call or heads to your door.',
              color: 'bg-teal-50 border-teal-100',
            },
          ].map(({ step, emoji, title, desc, color }) => (
            <div key={step} className={`rounded-2xl border p-4 sm:p-5 flex sm:flex-col gap-4 sm:gap-3 items-start ${color}`}>
              <div className="flex items-center gap-3 sm:gap-3 sm:flex-row shrink-0">
                <span className="text-2xl">{emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">Step {step}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-widest text-slate-400">Step {step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICE CARDS ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Choose your care</h2>
          <p className="text-sm text-slate-500">Flat pricing. M-Pesa escrow on every booking.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Teleconsult */}
          <button
            onClick={() => startService('teleconsult')}
            className="group text-left h-full flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
            <div className="flex-1 flex flex-col p-5 sm:p-6 gap-4">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">{formatKES(PRICING.teleconsult.basePriceKES)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">flat fee</div>
                </div>
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Video Consult</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />{PRICING.teleconsult.targetSLA}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Face-to-face with a licensed doctor from your phone. No download, no waiting room.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {[
                  'Encrypted HD video & voice',
                  'Digital prescription included',
                  'Pay only when doctor connects',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:gap-2.5 transition-all">
                <span>Start consult</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Home Visit */}
          <button
            onClick={() => startService('home_visit')}
            className="group text-left h-full flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            <div className="h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
            <div className="flex-1 flex flex-col p-5 sm:p-6 gap-4">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">{formatKES(PRICING.home_visit.basePriceKES)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">flat fee</div>
                </div>
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">Doctor Home Visit</h3>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />{PRICING.home_visit.targetSLA}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A real doctor or clinical officer comes to you — home, office, or wherever you need.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {[
                  'BP, glucose & pulse ox vitals',
                  'Live GPS tracking to your door',
                  'Dressings, injections & pediatric care',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-1 flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:gap-2.5 transition-all">
                <span>Request home visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Ambulance — spans full width on sm (2-col grid), natural on md (3-col) */}
          <button
            onClick={() => startService('ambulance')}
            className="group text-left h-full flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] sm:col-span-2 md:col-span-1"
          >
            <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="flex-1 flex flex-col p-5 sm:p-6 gap-4">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl shrink-0">
                  🚑
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">{formatKES(PRICING.ambulance.basePriceKES)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">transfer fee</div>
                </div>
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">Ambulance Dispatch</h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />{PRICING.ambulance.targetSLA}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verified ambulance with live route tracking — emergencies, maternity, or hospital transfers.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {[
                  'Live pickup & drop-off tracking',
                  'Coordinated hospital transfer',
                  'Maternity & urgent referrals',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-1 flex items-center gap-1.5 text-xs font-bold text-amber-700 group-hover:gap-2.5 transition-all">
                <span>Request ambulance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────── */}
      <section className="bg-[#1a3a2a] rounded-2xl sm:rounded-3xl px-5 py-7 sm:px-10 sm:py-10 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">2 min</div>
            <div className="text-xs sm:text-sm font-semibold">Doctor match</div>
            <div className="hidden sm:block text-xs text-white/50">Fastest in Nairobi</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs sm:text-sm font-semibold">KMPDC licensed</div>
            <div className="hidden sm:block text-xs text-white/50">Live register check</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">🔒</div>
            <div className="text-xs sm:text-sm font-semibold">M-Pesa escrow</div>
            <div className="hidden sm:block text-xs text-white/50">Pay after care</div>
          </div>
        </div>
      </section>

      {/* ─── REGULATORY ──────────────────────────────────────── */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm px-5 py-6 sm:px-8 sm:py-8 space-y-5">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Built on Kenya&apos;s legal health framework
          </h3>
          <p className="text-xs text-slate-400">
            Every part of the platform complies with Kenyan digital health regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Award,
              title: 'KMPDC Licensure',
              desc: 'Every doctor holds an active annual licence verified against the Medical Practitioners & Dentists Council register.',
              color: 'bg-emerald-50 text-emerald-700',
            },
            {
              icon: Lock,
              title: 'Data Protection Act 2019',
              desc: 'ODPC-compliant encryption at rest, in transit, and role-based audit logging on all medical records.',
              color: 'bg-teal-50 text-teal-700',
            },
            {
              icon: Smartphone,
              title: 'M-Pesa STK Escrow',
              desc: 'Automated B2C payout splits — practitioners are only paid after care is confirmed.',
              color: 'bg-amber-50 text-amber-700',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-2.5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 mb-0.5">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
