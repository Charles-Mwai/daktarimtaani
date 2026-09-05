'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoRoom from '@/components/VideoRoom';
import { fetchConsult, ConsultView } from '@/lib/api';

const POLL_MS = 3000;

export default function DoctorVideoConsultPage() {
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
        // Keep polling through transient network failures.
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
        <p className="text-slate-700 font-semibold">Consultation request not found.</p>
        <button
          onClick={() => router.push('/doctor')}
          className="text-emerald-700 font-bold text-sm hover:underline"
        >
          Return to doctor dashboard &rarr;
        </button>
      </div>
    );
  }

  if (!consult) {
    return <div className="text-center py-12 text-slate-500">Loading consultation room...</div>;
  }

  const { request, doctor } = consult;

  const handleEndConsultation = async () => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
    } finally {
      router.push('/doctor');
    }
  };

  if (request.serviceType !== 'teleconsult') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <p className="text-slate-700 font-semibold">This request does not have a video room.</p>
        <button
          onClick={() => router.push('/doctor')}
          className="text-emerald-700 font-bold text-sm hover:underline"
        >
          Return to doctor dashboard &rarr;
        </button>
      </div>
    );
  }

  if (!request.assignedDoctorId) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <p className="text-slate-700 font-semibold">This consultation is not assigned yet.</p>
        <button
          onClick={() => router.push('/doctor')}
          className="text-emerald-700 font-bold text-sm hover:underline"
        >
          Return to doctor dashboard &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Live Teleconsultation</h1>
        <p className="text-xs text-slate-500">
          Patient: {request.patientName} · {request.neighbourhood}
        </p>
      </div>

      <VideoRoom
        request={request}
        doctor={doctor}
        userRole="doctor"
        onEndCall={handleEndConsultation}
      />
    </div>
  );
}
