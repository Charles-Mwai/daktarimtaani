'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ambulance, Activity, CheckCircle2, Clock, MapPin, Phone,
  RefreshCw, ShieldCheck, Truck, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { formatKES } from '@/lib/utils';

const POLL_MS = 5000;

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecs(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const isUrgent = secs <= 30;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
      isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-amber-100 text-amber-800'
    }`}>
      <Clock className="w-3 h-3" />
      {secs}s
    </span>
  );
}

export default function AmbulanceOperatorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const prevPendingCount = useRef(0);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ambulance/operator');
      if (res.status === 401) {
        router.push('/ambulance/login');
        return;
      }
      const json = await res.json();
      const newPending = (json.pendingDispatches ?? []).length;
      if (newPending > prevPendingCount.current && prevPendingCount.current >= 0) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
          }
        } catch {}
      }
      prevPendingCount.current = newPending;
      setData(json);
    } catch (err) {
      console.error('Failed to fetch operator data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const act = async (action: string, payload: Record<string, string>) => {
    const key = action + JSON.stringify(payload);
    setActing(key);
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const result = await res.json();
      if (!result.success && result.error) {
        alert(result.error);
      }
      await fetchData();
    } catch (err) {
      alert('Action failed. Please refresh and try again.');
    } finally {
      setActing(null);
    }
  };

  const driverUpdate = async (dispatchId: string, status: string) => {
    await act('DRIVER_UPDATE', { dispatchId, status });
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading operator dashboard...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-700 font-semibold">Session expired or not found.</p>
        <button
          onClick={() => router.push('/ambulance/login')}
          className="text-amber-700 font-bold text-sm hover:underline"
        >
          Sign in →
        </button>
      </div>
    );
  }

  const { provider, units = [], pendingDispatches = [], activeDispatches = [] } = data;
  const onlineUnits = units.filter((u: any) => u.isOnline && u.status === 'available').length;

  return (
    <div className="max-w-5xl mx-auto space-y-5 px-3 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
              Operator Portal
            </span>
            {provider?.verificationStatus === 'VERIFIED' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Pending verification
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            {provider?.name ?? 'Ambulance Operator Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push('/ambulance/fleet')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Truck className="w-3.5 h-3.5" /> Manage Fleet
          </button>
          <button
            onClick={fetchData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Fleet', value: units.length, sub: 'units registered', color: 'amber' },
          { label: 'Online', value: onlineUnits, sub: 'available now', color: 'emerald' },
          { label: 'Pending', value: pendingDispatches.length, sub: 'awaiting acceptance', color: 'rose' },
          { label: 'Active', value: activeDispatches.length, sub: 'dispatches in progress', color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
            <div className="text-[11px] uppercase font-bold text-slate-400">{stat.label}</div>
            <div className={`mt-2 text-2xl font-extrabold ${
              stat.color === 'emerald' ? 'text-emerald-700' :
              stat.color === 'rose' ? 'text-rose-700' :
              stat.color === 'blue' ? 'text-blue-700' :
              'text-slate-900'
            }`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Incoming Dispatch Offers */}
      {pendingDispatches.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="font-extrabold text-rose-900 text-base">Incoming Dispatch Offers</h2>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
              {pendingDispatches.length} waiting
            </span>
          </div>

          {pendingDispatches.map((d: any) => (
            <div key={d.id} className="bg-white rounded-2xl border border-rose-200 p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{d.request?.patientName ?? 'Patient Request'}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.request?.severity === 'urgent' ? 'bg-rose-100 text-rose-800' :
                      d.request?.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>{d.request?.severity}</span>
                    {d.offerExpiresAt && <CountdownBadge expiresAt={d.offerExpiresAt} />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{d.request?.address ?? d.pickupAddress}
                  </p>
                  {d.dropoffAddress && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />Drop-off: {d.dropoffAddress}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Payout</div>
                  <div className="text-lg font-extrabold text-amber-700">{formatKES(d.ambulancePayoutKES ?? 0)}</div>
                  <div className="text-[10px] text-slate-400">ETA {d.estimatedEtaMinutes} min</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <span><strong>Unit:</strong> {d.unit?.name ?? 'Assigned unit'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{d.request?.patientPhone}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => act('ACCEPT_DISPATCH', { dispatchId: d.id })}
                  disabled={acting !== null}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Dispatch
                </button>
                <button
                  onClick={() => act('DECLINE_DISPATCH', { dispatchId: d.id })}
                  disabled={acting !== null}
                  className="w-full sm:flex-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Dispatches */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-600" />
          <h2 className="font-bold text-base text-slate-900">Active Dispatches</h2>
        </div>

        {activeDispatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No active dispatches right now.</div>
        ) : (
          <div className="space-y-3">
            {activeDispatches.map((d: any) => (
              <div key={d.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{d.request?.patientName ?? 'Patient'}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{d.pickupAddress}</p>
                    {d.dropoffAddress && (
                      <p className="text-xs text-slate-500">→ Drop-off: {d.dropoffAddress}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div className="font-bold text-slate-800">ETA: {d.estimatedEtaMinutes} min</div>
                    <div>{d.unit?.name}</div>
                  </div>
                </div>

                {/* Driver status controls */}
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['assigned', 'en_route', 'arrived', 'completed'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => driverUpdate(d.id, s)}
                        disabled={d.status === s || acting !== null}
                        className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                          d.status === s
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 cursor-default'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-800'
                        }`}
                      >
                        {{ assigned: 'Assigned', en_route: 'En Route', arrived: 'Arrived', completed: 'Complete' }[s]}
                      </button>
                    ))}
                    <button
                      onClick={() => act('UPDATE_DISPATCH_STATUS', { dispatchId: d.id, status: 'cancelled' })}
                      disabled={acting !== null}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Driver view link */}
                <div className="border-t border-slate-100 pt-2">
                  <a
                    href={`/ambulance/driver/${d.id.slice(-6).toUpperCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 hover:underline"
                  >
                    <Truck className="w-3 h-3" />
                    Open driver view (code: {d.id.slice(-6).toUpperCase()})
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Overview */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">My Fleet</h2>
          </div>
          <button
            onClick={() => router.push('/ambulance/fleet')}
            className="text-xs font-bold text-amber-700 hover:underline"
          >
            Manage →
          </button>
        </div>

        {units.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No units registered yet.{' '}
            <button onClick={() => router.push('/ambulance/fleet')} className="text-amber-700 font-bold hover:underline">Add your first unit →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {units.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚑</span>
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-500">{u.driverName} • {u.registrationNo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    u.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>{u.status}</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3" />{u.neighbourhood}
                  </div>
                </div>
              </div>
            ))}
            {units.length > 5 && (
              <button onClick={() => router.push('/ambulance/fleet')} className="text-xs text-amber-700 font-bold hover:underline w-full text-center py-1">
                View all {units.length} units →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
