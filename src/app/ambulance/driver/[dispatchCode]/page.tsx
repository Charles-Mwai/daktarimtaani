'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Navigation, MapPin, Phone, Truck } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'assigned', label: 'Assigned', icon: '📋' },
  { key: 'en_route', label: 'En Route', icon: '🚑' },
  { key: 'arrived', label: 'Arrived', icon: '📍' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

export default function DriverViewPage() {
  const params = useParams();
  const dispatchCode = (params.dispatchCode as string).toUpperCase();

  const [dispatch, setDispatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDispatch = async () => {
    try {
      const res = await fetch('/api/ambulance?scope=operator');
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      const allDispatches = [...(data.dispatches ?? [])];
      const found = allDispatches.find((d: any) => d.id.slice(-6).toUpperCase() === dispatchCode);
      if (!found) setNotFound(true);
      else setDispatch(found);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatch();
    const id = setInterval(fetchDispatch, 5000);
    return () => clearInterval(id);
  }, [dispatchCode]);

  const updateStatus = async (status: string) => {
    if (!dispatch) return;
    setUpdating(true);
    setMessage('');
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DRIVER_UPDATE',
          dispatchId: dispatch.id,
          dispatchCode,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Status updated to: ${status}`);
        await fetchDispatch();
      } else {
        setMessage(data.error || 'Update failed.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Loading dispatch...</p>
        </div>
      </div>
    );
  }

  if (notFound || !dispatch) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white space-y-3">
          <Truck className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold">Dispatch Not Found</h1>
          <p className="text-sm text-slate-400">Code: {dispatchCode}</p>
          <p className="text-xs text-slate-500">Ask your operator for the correct 6-character dispatch code.</p>
        </div>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === dispatch.status);
  const isComplete = dispatch.status === 'completed';
  const isCancelled = dispatch.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-amber-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-950" />
          <span className="font-extrabold text-slate-950 text-sm">Driver View</span>
        </div>
        <span className="font-mono text-xs bg-slate-950/20 px-2 py-0.5 rounded text-slate-950 font-bold">
          {dispatchCode}
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-sm mx-auto w-full">
        {/* Dispatch info */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pickup</div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{dispatch.pickupAddress}</p>
          </div>
          {dispatch.dropoffAddress && (
            <>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-2">Drop-off</div>
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold">{dispatch.dropoffAddress}</p>
              </div>
            </>
          )}
          {dispatch.request?.patientPhone && (
            <a
              href={`tel:${dispatch.request.patientPhone}`}
              className="flex items-center gap-2 mt-2 text-amber-400 text-xs font-bold hover:text-amber-300"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Patient: {dispatch.request.patientPhone}
            </a>
          )}
        </div>

        {/* Progress steps */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Progress</div>
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx || isComplete;
            const isCurrent = idx === currentStepIdx && !isComplete;
            return (
              <div key={step.key} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                isCurrent ? 'bg-amber-500/20 border border-amber-500/40' :
                isDone ? 'opacity-60' : 'opacity-30'
              }`}>
                <span className="text-xl">{step.icon}</span>
                <span className={`font-bold text-sm ${
                  isCurrent ? 'text-amber-400' :
                  isDone ? 'text-emerald-400' :
                  'text-slate-500'
                }`}>{step.label}</span>
                {isDone && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                {isCurrent && <span className="ml-auto text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">Current</span>}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        {!isComplete && !isCancelled && (
          <div className="space-y-2">
            {dispatch.status === 'assigned' && (
              <button
                onClick={() => updateStatus('en_route')}
                disabled={updating}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-extrabold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                {updating ? 'Updating...' : 'Start Journey — En Route'}
              </button>
            )}
            {dispatch.status === 'en_route' && (
              <button
                onClick={() => updateStatus('arrived')}
                disabled={updating}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-extrabold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {updating ? 'Updating...' : 'Mark Arrived at Pickup'}
              </button>
            )}
            {dispatch.status === 'arrived' && (
              <button
                onClick={() => updateStatus('completed')}
                disabled={updating}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {updating ? 'Updating...' : 'Mark Trip Complete'}
              </button>
            )}
          </div>
        )}

        {isComplete && (
          <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-4 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-emerald-400">Trip Complete</p>
            <p className="text-xs text-slate-400 mt-1">Patient payment is now being processed.</p>
          </div>
        )}

        {isCancelled && (
          <div className="bg-rose-900/40 border border-rose-700/40 rounded-2xl p-4 text-center">
            <p className="font-bold text-rose-400">This dispatch was cancelled.</p>
          </div>
        )}

        {message && (
          <div className="bg-slate-700 rounded-xl p-3 text-xs text-center text-slate-200">
            {message}
          </div>
        )}

        <div className="text-center">
          <p className="text-[10px] text-slate-600">Daktari Mtaani • Driver View • {dispatchCode}</p>
        </div>
      </div>
    </div>
  );
}
