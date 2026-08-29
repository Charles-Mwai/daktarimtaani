'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Stethoscope, ShieldCheck, RefreshCw, Radio } from 'lucide-react';

export default function RoleBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const [onlineCount, setOnlineCount] = useState(2);

  const fetchOnlineStatus = async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.doctors) {
        setOnlineCount(data.doctors.filter((d: any) => d.isOnline && d.verificationStatus === 'VERIFIED').length);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchOnlineStatus();
    const interval = setInterval(fetchOnlineStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const activePortal = pathname.startsWith('/doctor')
    ? 'doctor'
    : pathname.startsWith('/admin')
    ? 'admin'
    : 'patient';

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
            Daktari Mtaani Pilot
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline">
            Active Fleet: <strong className="text-white">{onlineCount} Doctors</strong> Online
          </span>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1">Switch Portal:</span>

          <button
            onClick={() => router.push('/')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              activePortal === 'patient'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>

          <button
            onClick={() => router.push('/doctor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              activePortal === 'doctor'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Console</span>
          </button>

          <button
            onClick={() => router.push('/admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              activePortal === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin & Ops</span>
          </button>
        </div>
      </div>
    </div>
  );
}
