'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatKES } from '@/lib/utils';
import {
  AlertCircle,
  Clock,
  MapPin,
  Stethoscope,
  Video,
  Navigation,
  CheckCircle2,
  XCircle,
  Phone,
} from 'lucide-react';

interface DispatchOfferModalProps {
  currentDoctorId: string;
  onOfferHandled?: () => void;
}

export default function DispatchOfferModal({
  currentDoctorId,
  onOfferHandled,
}: DispatchOfferModalProps) {
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [request, setRequest] = useState<any | null>(null);
  const [cancelledNotice, setCancelledNotice] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [responding, setResponding] = useState(false);
  const chimeRef = useRef<boolean>(false);

  // Poll the database every 2 seconds for a pending offer
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/dispatch/pending?doctorId=${currentDoctorId}`);
        const data = await res.json();

        if (data.offer && data.request) {
          if (!chimeRef.current) {
            chimeRef.current = true;
            playChime();
          }
          setActiveOffer(data.offer);
          setRequest(data.request);
          setSecondsRemaining(data.secondsRemaining);
        } else {
          // No active offer — clear modal or show cancellation notice
          if (data.cancelledOffer) {
            chimeRef.current = false;
            setActiveOffer(null);
            setRequest(null);
            setCancelledNotice('Patient cancelled the request.');
          } else {
            if (activeOffer) {
              chimeRef.current = false;
              setActiveOffer(null);
              setRequest(null);
            }
            setCancelledNotice(null);
          }
        }
      } catch (e) {
        console.error('Dispatch poll error:', e);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDoctorId]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch (e) {
      // Audio context not available
    }
  };

  const handleRespond = async (response: 'accepted' | 'declined') => {
    if (!activeOffer || responding) return;
    setResponding(true);
    try {
      await fetch('/api/dispatch/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: activeOffer.id, response }),
      });
      chimeRef.current = false;
      setActiveOffer(null);
      setRequest(null);
      onOfferHandled?.();
    } catch (e) {
      console.error('Respond error:', e);
    } finally {
      setResponding(false);
    }
  };

  if (!activeOffer || !request) return null;

  if (cancelledNotice) {
    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-200 p-6 text-center">
          <div className="text-emerald-700 font-bold text-lg">Request Cancelled</div>
          <p className="text-sm text-slate-600 mt-3">{cancelledNotice}</p>
          <div className="mt-5">
            <button
              onClick={() => setCancelledNotice(null)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctorPayout = request.serviceType === 'home_visit' ? 2000 : 800;
  const symptomsTags: string[] = (() => {
    try {
      return JSON.parse(request.symptomsTags || '[]');
    } catch {
      return [];
    }
  })();

  const progress = (secondsRemaining / 30) * 100;
  const isUrgent = secondsRemaining <= 10;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-200">
        {/* Countdown Header */}
        <div
          className={`p-4 text-white relative transition-colors duration-700 ${
            isUrgent
              ? 'bg-gradient-to-r from-rose-600 to-red-700'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Incoming Patient Dispatch
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md ${
                isUrgent ? 'bg-white/30 text-white' : 'bg-white/20 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{secondsRemaining}s to respond</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: isUrgent ? '#fbbf24' : '#a7f3d0',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Service Type + Patient + Payout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                {request.serviceType === 'home_visit' ? (
                  <Navigation className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {request.serviceType === 'home_visit'
                    ? 'Home Visit Dispatch'
                    : 'Teleconsultation Call'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Patient: {request.patientName}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span className="font-mono">{request.patientPhone}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Your Payout</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {formatKES(doctorPayout)}
              </span>
            </div>
          </div>

          {/* Location & Symptoms */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-sm">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">{request.neighbourhood}</span>
                <p className="text-xs text-slate-500 mt-0.5">{request.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700 pt-2 border-t border-slate-200">
              <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Chief Complaint:</span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {request.symptomsSummary}
                </p>
              </div>
            </div>

            {symptomsTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {symptomsTags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleRespond('declined')}
              disabled={responding}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition active:scale-[0.98] disabled:opacity-60"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              Decline
            </button>
            <button
              onClick={() => handleRespond('accepted')}
              disabled={responding}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              {responding ? 'Accepting...' : 'Accept Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
