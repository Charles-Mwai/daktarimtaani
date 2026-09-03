'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  Home,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Award,
  Lock,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { PRICING } from '@/lib/constants';
import { formatKES } from '@/lib/utils';
import { loadState, saveState } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [onlineCount, setOnlineCount] = useState(2);

  useEffect(() => {
    const state = loadState();
    setOnlineCount(state.doctors.filter(d => d.isOnline && d.verificationStatus === 'verified').length);
  }, []);

  const startService = (service: 'teleconsult' | 'home_visit' | 'ambulance') => {
    const state = loadState();
    state.activeRole = 'patient';
    saveState(state);
    router.push(`/patient/request?service=${service}`);
  };

  return (
    <div className="space-y-9 sm:space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 sm:p-8 md:p-14 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Nairobi Pilot Live • {onlineCount} Verified Doctors Online</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            A Doctor, <br className="hidden sm:inline" />
            <span className="text-emerald-300">Requested Like a Ride.</span>
          </h1>

          <p className="text-base md:text-lg text-emerald-100/90 leading-relaxed font-normal">
            Skip the clinic queues. Connect instantly with licensed KMPDC doctors by video in under 5 minutes, or have a medical officer dispatched to your doorstep.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => startService('teleconsult')}
              className="w-full sm:w-auto justify-center flex items-center gap-2 bg-white text-emerald-900 px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-50 shadow-lg shadow-emerald-950/20 transition active:scale-95"
            >
              <Video className="w-4 h-4 text-emerald-600" />
              <span>Start Instant Teleconsult</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => startService('home_visit')}
              className="w-full sm:w-auto justify-center flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/30 px-6 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-md transition active:scale-95"
            >
              <Home className="w-4 h-4 text-emerald-300" />
              <span>Request Home Visit Doctor</span>
            </button>

            <button
              onClick={() => startService('ambulance')}
              className="w-full sm:w-auto justify-center flex items-center gap-2 bg-amber-500/90 hover:bg-amber-400 text-slate-950 border border-amber-300/40 px-6 py-3.5 rounded-2xl font-bold text-sm transition active:scale-95"
            >
              <span className="text-lg leading-none">🚑</span>
              <span>Request Ambulance</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Two Request Types Cards */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Choose Your Care Option</h2>
          <p className="text-xs text-slate-500">Transparent flat pricing with M-Pesa escrow protection</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
          {/* Teleconsult Card */}
          <div
            onClick={() => startService('teleconsult')}
            className="group cursor-pointer h-full flex flex-col bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 hover:border-emerald-500/60 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
                <Video className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatKES(PRICING.teleconsult.basePriceKES)}
                </span>
                <span className="text-xs text-slate-400 block font-medium">Flat fee per consult</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  Teleconsultation Call
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {PRICING.teleconsult.targetSLA}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {PRICING.teleconsult.description}
              </p>
            </div>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Encrypted in-browser HD video & audio call (No app download required)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Official digital prescription & clinical referral note included</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pay only upon doctor connection via M-Pesa</span>
              </li>
            </ul>

            <div className="mt-auto pt-6 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
              <span>Request Teleconsult Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </div>
          </div>

          {/* Home Visit Card */}
          <div
            onClick={() => startService('home_visit')}
            className="group cursor-pointer h-full flex flex-col bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 hover:border-emerald-500/60 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-105 transition">
                <Home className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatKES(PRICING.home_visit.basePriceKES)}
                </span>
                <span className="text-xs text-slate-400 block font-medium">Flat fee per dispatch</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  Home Visit Dispatch
                </h3>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {PRICING.home_visit.targetSLA}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {PRICING.home_visit.description}
              </p>
            </div>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Physical clinical examination & basic vitals (BP, glucose, pulse ox)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live turn-by-turn doctor GPS tracking to your location</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>On-site wound dressing, injection, or urgent pediatric assessment</span>
              </li>
            </ul>

            <div className="mt-auto pt-6 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
              <span>Request Home Visit Doctor</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </div>
          </div>

          {/* Ambulance Card */}
          <div
            onClick={() => startService('ambulance')}
            className="group cursor-pointer h-full flex flex-col bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-100 hover:border-amber-500/60 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition">
                <span className="text-2xl">🚑</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatKES(PRICING.ambulance.basePriceKES)}
                </span>
                <span className="text-xs text-slate-400 block font-medium">Emergency transfer fee</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition">
                  Ambulance Transfer
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {PRICING.ambulance.targetSLA}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {PRICING.ambulance.description}
              </p>
            </div>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Live ambulance dispatch with pickup and drop-off route tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Care teams coordinate transfer to clinic, referral hospital, or home</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Suitable for urgent patient transfer, maternity support, or referrals</span>
              </li>
            </ul>

            <div className="mt-auto pt-6 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition">
              <span>Request Ambulance</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory & Safety Foundation */}
      <section className="bg-white rounded-3xl p-5 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Kenya Regulatory Foundation</h3>
          <p className="text-xs text-slate-500">Built to comply strictly with national digital health standards</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">KMPDC Licensure</h4>
            <p className="text-xs text-slate-600">
              100% of platform doctors hold active annual licenses verified against the council register.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Data Protection Act 2019</h4>
            <p className="text-xs text-slate-600">
              ODPC-compliant encryption at rest and role-based medical access audit logging.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">M-Pesa STK Escrow</h4>
            <p className="text-xs text-slate-600">
              Fast, trusted payments with automated B2C payout splits for healthcare practitioners.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
