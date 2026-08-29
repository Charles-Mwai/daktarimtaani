'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MapTracker from '@/components/MapTracker';
import {
  PhoneCall,
  ShieldCheck,
  CheckCircle,
  Navigation,
  Clock,
  ArrowRight,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { formatKES } from '@/lib/utils';
import { fetchConsult, ConsultView } from '@/lib/api';

const POLL_MS = 3000;

export default function PatientTrackHomeVisitPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [consult, setConsult] = useState<ConsultView | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const view = await fetchConsult(requestId);
        if (cancelled) return;
        if (view === null) {
          setNotFound(true);
        } else {
          setConsult(view);
        }
      } catch {
        // transient fetch failure — keep polling
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId]);

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <p className="text-slate-700 font-semibold">Home visit request not found.</p>
        <a href="/patient/request" className="text-emerald-700 font-bold text-sm hover:underline">
          Book a new visit &rarr;
        </a>
      </div>
    );
  }

  if (!consult) {
    return <div className="text-center py-12 text-slate-500">Loading home visit tracking...</div>;
  }

  const { request, doctor } = consult;

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
        <p className="text-slate-700 font-semibold">Confirming your doctor assignment...</p>
        <p className="text-xs text-slate-500">This page updates automatically once a doctor accepts.</p>
      </div>
    );
  }

  const arrived = request.status === 'arrived' || request.status === 'consulting';
  const concluded = request.status === 'completed' || request.status === 'cancelled';

  const patientLocation = {
    lat: request.lat,
    lng: request.lng,
    address: request.address,
    neighbourhood: request.neighbourhood,
  };
  const doctorStart = {
    lat: doctor.lat,
    lng: doctor.lng,
    address: doctor.address,
    neighbourhood: doctor.neighbourhood,
  };

  const heading = concluded
    ? 'Visit Concluded'
    : request.status === 'consulting'
      ? 'Consultation In Progress'
      : arrived
        ? 'Doctor Has Arrived'
        : 'Doctor Is On The Way';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Dispatch Status
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {request.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{heading}</h1>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Home Visit Fee</span>
          <span className="text-xl font-extrabold text-emerald-700">{formatKES(request.estimatedPriceKES)}</span>
        </div>
      </div>

      {/* Status banner */}
      {concluded ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900">The doctor has concluded this visit.</p>
              <p className="text-xs text-slate-500">Clinical notes and prescriptions are ready below.</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/patient/consult/${requestId}/summary`)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md transition"
          >
            <span>View Clinical Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : arrived ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          {request.status === 'consulting' ? (
            <Stethoscope className="w-8 h-8 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle className="w-8 h-8 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="font-bold text-slate-900">
              {request.status === 'consulting'
                ? 'Your consultation is in progress.'
                : `${doctor.name} has arrived at your location.`}
            </p>
            <p className="text-xs text-slate-500">
              Verify the security code below before letting the doctor in. This page will update
              automatically when the visit concludes.
            </p>
          </div>
        </div>
      ) : null}

      {/* Live Map Component */}
      <MapTracker
        doctorLocation={doctorStart}
        patientLocation={patientLocation}
        doctorName={doctor.name}
        isSimulatingMovement={true}
        arrived={arrived || concluded}
      />

      {/* Doctor Vehicle & Identity Card */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                <span className="text-emerald-600" title="Verified KMPDC Doctor">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{doctor.kmpdcLicenseNo}</span>
                <span>★ {doctor.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doctor.phone && (
              <a
                href={`tel:${doctor.phone}`}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Doctor</span>
              </a>
            )}
          </div>
        </div>

        {/* Security & Verification Code */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Home Visit Security Code:</span>
            <span className="text-base font-extrabold text-slate-900 tracking-widest font-mono">
              DM-{request.id.slice(-4).toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs text-right">
            Ask doctor to confirm this code upon arrival before letting them inside.
          </p>
        </div>

        {concluded && (
          <div className="pt-2">
            <button
              onClick={() => router.push(`/patient/consult/${requestId}/summary`)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition active:scale-98"
            >
              <span>Proceed to Clinical Summary & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
