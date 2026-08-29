'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  Activity,
  FileText,
  BarChart3,
  Users,
  LogOut,
  User,
  LogIn,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchSession = async () => {
    try {
      // Determine which role cookie to read based on current portal path
      const role = pathname.startsWith('/doctor')
        ? 'DOCTOR'
        : pathname.startsWith('/admin')
        ? 'ADMIN'
        : 'PATIENT';
      const res = await fetch(`/api/auth/me?role=${role}`);
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchSession();
    window.addEventListener('daktari_auth_changed', fetchSession);
    return () => window.removeEventListener('daktari_auth_changed', fetchSession);
  }, [pathname]);

  const handleLogout = async () => {
    const role = pathname.startsWith('/doctor')
      ? 'DOCTOR'
      : pathname.startsWith('/admin')
      ? 'ADMIN'
      : 'PATIENT';
    await fetch(`/api/auth/logout?role=${role}`, { method: 'POST' });
    setCurrentUser(null);
    window.dispatchEvent(new Event('daktari_auth_changed'));
    if (pathname.startsWith('/doctor')) {
      router.push('/doctor/login');
    } else if (pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/');
    }
  };

  const isDoctorPortal = pathname.startsWith('/doctor');
  const isAdminPortal = pathname.startsWith('/admin');

  return (
    <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand according to portal */}
          <div className="flex items-center gap-3">
            {isDoctorPortal ? (
              <button
                onClick={() => router.push('/doctor')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Daktari Mtaani</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Doctor Console
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Practitioner Dashboard</p>
                </div>
              </button>
            ) : isAdminPortal ? (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Daktari Mtaani</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Ops Center
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Clinical Operations & SLA Monitor</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Daktari Mtaani</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pilot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">A Doctor, On Demand</p>
                </div>
              </button>
            )}
          </div>

          {/* Navigation Links strictly isolated per portal */}
          <nav className="hidden md:flex items-center gap-1">
            {!isDoctorPortal && !isAdminPortal && (
              <>
                <button
                  onClick={() => router.push('/patient/request')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/patient/request')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  Request a Doctor
                </button>
                <button
                  onClick={() => router.push('/patient/records')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/patient/records')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  My Medical Records
                </button>
              </>
            )}

            {isDoctorPortal && (
              <>
                <button
                  onClick={() => router.push('/doctor')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/doctor'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Dispatch Console
                </button>
                <button
                  onClick={() => router.push('/doctor/history')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/doctor/history')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  History
                </button>
                <button
                  onClick={() => router.push('/doctor/earnings')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/doctor/earnings')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Earnings & Payouts
                </button>
              </>
            )}

            {isAdminPortal && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/admin'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Dispatch Ops
                </button>
                <button
                  onClick={() => router.push('/admin/doctors')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/admin/doctors')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  KMPDC Licensure Review
                </button>
                <button
                  onClick={() => router.push('/admin/metrics')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.includes('/admin/metrics')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Investor Traction
                </button>
              </>
            )}
          </nav>

          {/* Compact mobile nav: simple icon buttons for quick access */}
          <nav className="flex md:hidden items-center gap-2">
            {!isDoctorPortal && !isAdminPortal ? (
              <>
                <button
                  onClick={() => router.push('/patient/request')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-emerald-50/30 hover:bg-emerald-50"
                  aria-label="Request a doctor"
                >
                  <HeartPulse className="w-5 h-5 text-emerald-600" />
                </button>
                <button
                  onClick={() => router.push('/patient/records')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-50/40 hover:bg-slate-100"
                  aria-label="My records"
                >
                  <FileText className="w-5 h-5 text-slate-700" />
                </button>
              </>
            ) : isDoctorPortal ? (
              <>
                <button
                  onClick={() => router.push('/doctor')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-emerald-50/30 hover:bg-emerald-50"
                  aria-label="Doctor console"
                >
                  <Activity className="w-5 h-5 text-emerald-600" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-50/30 hover:bg-slate-100"
                  aria-label="Admin console"
                >
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                </button>
              </>
            )}
          </nav>

          {/* Right Action / Authentication state */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {!isDoctorPortal && !isAdminPortal ? (
                  <>
                    <button
                      onClick={() => router.push('/patient/login')}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Patient Sign In</span>
                    </button>
                    <button
                      onClick={() => router.push('/patient/signup')}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
                    >
                      <span>Sign Up</span>
                    </button>
                  </>
                ) : isDoctorPortal ? (
                  <button
                    onClick={() => router.push('/doctor/login')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Doctor Sign In</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/admin/login')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Admin Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
