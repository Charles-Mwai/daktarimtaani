'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MapTracker from '@/components/MapTracker';
import {
  Stethoscope,
  Video,
  Navigation,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  MapPin,
  PhoneCall,
  Car,
  CheckCircle,
} from 'lucide-react';
import { formatKES } from '@/lib/utils';

export default function MatchingPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<any | null>(null);
  const [assignedDoctor, setAssignedDoctor] = useState<any | null>(null);
  const [ambulanceDispatch, setAmbulanceDispatch] = useState<any | null>(null);
  const [ambulanceUnit, setAmbulanceUnit] = useState<any | null>(null);
  const [matchingTime, setMatchingTime] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      if (cancelled) return;
      try {
        const [requestRes, ambulanceRes] = await Promise.all([
          fetch(`/api/requests/${requestId}`),
          fetch('/api/ambulance', { cache: 'no-store' }),
        ]);

        if (!requestRes.ok) {
          setNotFound(true);
          return;
        }

        const requestData = await requestRes.json();
        const req = requestData.request;

        if (!req) {
          setNotFound(true);
          return;
        }

        let unit = requestData.ambulance?.unit ?? null;
        if (ambulanceRes.ok) {
          const fleetData = await ambulanceRes.json();
          const fleet = fleetData.units ?? [];
          const matchByDispatch = requestData.ambulance?.dispatch?.unitId
            ? fleet.find((item: any) => item.id === requestData.ambulance.dispatch.unitId)
            : null;
          unit = matchByDispatch ?? unit;
        }

        setRequest(req);
        setAmbulanceDispatch(requestData.ambulance?.dispatch ?? null);
        setAmbulanceUnit(unit);

        if (req.assignedDoctorId && req.status !== 'matching') {
          const docRes = await fetch(`/api/doctors/${req.assignedDoctorId}`);
          if (docRes.ok) {
            const docData = await docRes.json();
            setAssignedDoctor(docData.doctor || null);
          }
        }
      } catch (e) {
        console.error('Status check error:', e);
      }
    };

    checkStatus();

    const interval = setInterval(() => {
      setMatchingTime((t) => t + 1);
      checkStatus();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId]);

  if (notFound) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-slate-500 font-medium">Request not found.</p>
        <button
          onClick={() => router.push('/patient/request')}
          className="text-xs text-emerald-700 underline"
        >
          ← Back to request form
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading request...</p>
      </div>
    );
  }

  const isAmbulance = request.serviceType === 'ambulance';
  const isMatched = request.status !== 'matching' && assignedDoctor;
  const ambulanceReached = request.status === 'arrived' || request.status === 'completed';
  const ambulanceStatusCopy = {
    dispatching: {
      title: 'Ambulance crew is being dispatched',
      description: 'We have assigned a verified emergency crew and are refreshing the ETA from the live vehicle feed.',
    },
    in_transit: {
      title: 'Your crew is on the way',
      description: 'The ambulance is heading to your pickup location and the ETA is updating in real time.',
    },
    arrived: {
      title: 'Ambulance has arrived at your location',
      description: 'The driver is waiting at the pickup point. Please confirm the crew before boarding.',
    },
    completed: {
      title: 'Transfer completed',
      description: 'Your ride has finished and the care team is ready to continue with the next step.',
    },
  } satisfies Record<string, { title: string; description: string }>;
  const statusCopy = ambulanceStatusCopy[request.status as keyof typeof ambulanceStatusCopy] ?? ambulanceStatusCopy.dispatching;

  const patientLocation = {
    lat: request.lat,
    lng: request.lng,
    address: request.address,
    neighbourhood: request.neighbourhood,
  };

  const ambulanceLocation = {
    lat: ambulanceUnit?.lat ?? request.lat,
    lng: ambulanceUnit?.lng ?? request.lng,
    address: ambulanceUnit?.area ?? request.address,
    neighbourhood: ambulanceUnit?.neighbourhood ?? request.neighbourhood,
  };

  if (isAmbulance) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live Ambulance Dispatch
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {request.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {request.status === 'dispatching'
                ? 'Ambulance Assigned'
                : request.status === 'in_transit'
                ? 'Ambulance En Route'
                : request.status === 'arrived'
                ? 'Ambulance Has Arrived'
                : request.status === 'completed'
                ? 'Transfer Complete'
                : 'Dispatching Ambulance'}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Ambulance Fee</span>
            <span className="text-xl font-extrabold text-amber-700">{formatKES(request.estimatedPriceKES)}</span>
          </div>
        </div>

        {request.status === 'matching' || (request.status === 'dispatching' && !ambulanceDispatch?.acceptedAt) ? (
          <div className="border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 bg-amber-50">
            <div className="shrink-0 animate-spin">
              <div className="w-7 h-7 rounded-full border-4 border-amber-400 border-t-transparent" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Waiting for ambulance provider to confirm</p>
              <p className="text-xs text-slate-500 mt-1">The nearest available ambulance crew has been notified. Confirmation typically takes under 2 minutes.</p>
            </div>
          </div>
        ) : request.status === 'dispatching' || request.status === 'in_transit' || request.status === 'arrived' || request.status === 'completed' ? (
          <div className={`border rounded-2xl p-4 sm:p-5 flex items-start gap-3 ${request.status === 'arrived' || request.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className={`shrink-0 ${request.status === 'arrived' || request.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {request.status === 'completed' ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Car className="w-8 h-8" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{statusCopy.title}</p>
              <p className="text-xs text-slate-500 mt-1">{statusCopy.description}</p>
              {request.status !== 'completed' && (
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  {ambulanceDispatch?.estimatedEtaMinutes ?? ambulanceUnit?.etaMinutes ?? 15} min ETA to pickup.
                </p>
              )}
            </div>
          </div>
        ) : null}

        <MapTracker
          doctorLocation={ambulanceLocation}
          patientLocation={patientLocation}
          doctorName={ambulanceUnit?.name ?? 'Ambulance Unit'}
          isSimulatingMovement={true}
          arrived={ambulanceReached}
          mode="ambulance"
        />

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-amber-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-amber-500 shadow-md shrink-0">
                <Car className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-lg text-slate-900">{ambulanceUnit?.name ?? 'Assigned Ambulance'}</h3>
                  <span className="text-amber-600" title="Verified ambulance unit">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-xs text-amber-700 font-medium">{ambulanceUnit?.registrationNo ?? 'Vehicle in dispatch queue'}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>{ambulanceUnit?.vehicleType ?? 'basic'} vehicle</span>
                  <span>•</span>
                  <span>{ambulanceUnit?.capacity ?? 2} seats</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ambulanceUnit?.phone ? (
                <a
                  href={`tel:${ambulanceUnit.phone}`}
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span>Call Driver</span>
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="block text-slate-400 font-medium">Driver</span>
              <span className="font-bold text-slate-900">{ambulanceUnit?.driverName ?? 'Dispatch team'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="block text-slate-400 font-medium">ETA</span>
              <span className="font-bold text-slate-900">{ambulanceDispatch?.estimatedEtaMinutes ?? ambulanceUnit?.etaMinutes ?? 15} min</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="block text-slate-400 font-medium">Pickup</span>
              <span className="font-bold text-slate-900">{request.address}</span>
            </div>
            {ambulanceDispatch?.dropoffAddress && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 col-span-full">
                <span className="block text-slate-400 font-medium">Drop-off Destination</span>
                <span className="font-bold text-slate-900">{ambulanceDispatch.dropoffAddress}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Ambulance Dispatch Status:</span>
              <span className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                {ambulanceDispatch?.status ?? request.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs sm:text-right">
              The crew status is refreshed automatically from the live dispatch feed so the ETA stays current.
            </p>
          </div>

          {request.status === 'completed' ? (
            <button
              onClick={() => router.push(`/patient/consult/${request.id}/summary`)}
              className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
            >
              <CheckCircle className="w-4 h-4" />
              Completed — Go to payment
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!confirm('Cancel this request?')) return;
                try {
                  const res = await fetch(`/api/requests/${request.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    router.push('/patient/request');
                  } else {
                    alert(data.error || 'Failed to cancel');
                  }
                } catch (e) {
                  console.error(e);
                  alert('Cancellation failed');
                }
              }}
              className="mt-2 text-xs text-rose-600 font-bold underline"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-sm text-center space-y-6">
        {!isMatched ? (
          <div className="space-y-6 py-6">
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-6 rounded-full bg-emerald-200/50 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.3s' }} />
              <div className="absolute inset-12 rounded-full bg-emerald-300/40 animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.6s' }} />
              <div className="relative w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 z-10">
                <Stethoscope className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Searching Nearby Doctors • {matchingTime}s</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Matching You With A Licensed Doctor</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Querying verified KMPDC practitioners near <strong>{request.neighbourhood}</strong> for your{' '}
                {request.serviceType === 'home_visit' ? 'Home Visit' : 'Teleconsultation'}.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>
                  Request ID:{' '}
                  <strong className="text-slate-800 font-mono text-[10px]">{request.id}</strong>
                </span>
                <span className="font-bold text-emerald-700">{formatKES(request.estimatedPriceKES)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{request.address}</span>
              </div>
              <div className="text-slate-600 pt-1 border-t border-slate-200">
                <strong>Symptoms:</strong> {request.symptomsSummary}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              The dispatch offer has been sent to the nearest online verified doctor.
              Check the <strong>Doctor Console</strong> tab to accept it.
            </p>
            <div className="pt-3">
              <button
                onClick={async () => {
                  if (!confirm('Cancel this request?')) return;
                  try {
                    const res = await fetch(`/api/requests/${request.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'cancelled' }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      router.push('/patient/request');
                    } else {
                      alert(data.error || 'Failed to cancel');
                    }
                  } catch (e) {
                    console.error(e);
                    alert('Cancellation failed');
                  }
                }}
                className="mt-2 text-xs text-rose-600 font-bold underline"
              >
                Cancel Request
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Doctor Accepted &amp; Ready!</span>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                {assignedDoctor.avatarUrl ? (
                  <img
                    src={assignedDoctor.avatarUrl}
                    alt={assignedDoctor.user?.name || 'Doctor'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-emerald-700" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full shadow">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">{assignedDoctor.user?.name || 'Your Doctor'}</h3>
                <p className="text-xs font-semibold text-emerald-700">{assignedDoctor.specialty}</p>
                <div className="flex items-center justify-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{assignedDoctor.kmpdcLicenseNo}</span>
                  <span>•</span>
                  <span className="text-amber-600 font-bold">★ {assignedDoctor.rating} ({assignedDoctor.totalConsults} consults)</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 text-xs text-left text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Verified Practitioner Profile</span>
              </div>
              <p className="text-slate-600">{assignedDoctor.bio}</p>
            </div>

            <div className="pt-2">
              {request.serviceType === 'teleconsult' ? (
                <button
                  onClick={() => router.push(`/patient/consult/${request.id}/room`)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95"
                >
                  <Video className="w-5 h-5" />
                  <span>Enter Teleconsultation Room Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/patient/consult/${request.id}/track`)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Track Doctor Live GPS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
