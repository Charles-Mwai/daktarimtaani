'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoRoom from '@/components/VideoRoom';
import { fetchConsult, ConsultView } from '@/lib/api';
import { CheckCircle, ArrowRight } from 'lucide-react';

const POLL_MS = 3000;

export default function PatientVideoConsultPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [consult, setConsult] = useState<ConsultView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const markedConsulting = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const view = await fetchConsult(requestId);
        if (cancelled || view === null) {
          if (view === null) setNotFound(true);
          return;
        }
        setConsult(view);

        // First party to join the room starts the consult (DB status only).
        if (
          !markedConsulting.current &&
          view.request.status === 'accepted' &&
          view.request.assignedDoctorId
        ) {
          markedConsulting.current = true;
          fetch(`/api/requests/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'consulting' }),
          }).catch(() => {});
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

  // The doctor closes the consult from their console (Rx & Close) — redirect
  // the patient to the summary once the request completes.
  const concluded = consult?.request.status === 'completed';
  useEffect(() => {
    if (!concluded) return;
    const timeout = setTimeout(() => {
      router.push(`/patient/consult/${requestId}/summary`);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [concluded, requestId, router]);

  const handleEndCall = () => {
    router.push(`/patient/consult/${requestId}/summary`);
  };

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <p className="text-slate-700 font-semibold">Consultation request not found.</p>
        <a href="/patient/request" className="text-emerald-700 font-bold text-sm hover:underline">
          Book a new consultation &rarr;
        </a>
      </div>
    );
  }

  if (!consult) {
    return <div className="text-center py-12 text-slate-500">Loading consultation room...</div>;
  }

  const { request, doctor } = consult;

  if (request.status === 'matching' || !request.assignedDoctorId) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
        <p className="text-slate-700 font-semibold">Waiting for a doctor to accept your request...</p>
        <a
          href={`/patient/request/${requestId}`}
          className="text-emerald-700 font-bold text-sm hover:underline"
        >
          View matching status &rarr;
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Teleconsultation</h1>
          <p className="text-xs text-slate-500">
            Consulting with {doctor?.name || 'Licensed Doctor'} ({doctor?.specialty})
          </p>
        </div>
      </div>

      {concluded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <p className="text-sm font-bold text-slate-900">
              The doctor has ended the consultation. Opening your clinical summary...
            </p>
          </div>
          <button
            onClick={() => router.push(`/patient/consult/${requestId}/summary`)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            View Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <VideoRoom
        request={request}
        doctor={doctor}
        userRole="patient"
        onEndCall={handleEndCall}
      />
    </div>
  );
}
