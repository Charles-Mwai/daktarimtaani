'use client';

import React, { useEffect, useState } from 'react';
import { LocationCoordinates } from '@/lib/types';
import { Navigation, MapPin, Stethoscope, Clock, ShieldCheck } from 'lucide-react';
import { calculateDistanceKm, estimateArrivalMins } from '@/lib/utils';

interface MapTrackerProps {
  doctorLocation: LocationCoordinates;
  patientLocation: LocationCoordinates;
  doctorName?: string;
  isSimulatingMovement?: boolean;
  arrived?: boolean;
}

export default function MapTracker({
  doctorLocation,
  patientLocation,
  doctorName = 'Dr. Kamau',
  isSimulatingMovement = true,
  arrived = false,
}: MapTrackerProps) {
  // Current interpolated doctor coordinates for the ride-hailing style animation
  const [currentDocPos, setCurrentDocPos] = useState({
    lat: doctorLocation.lat,
    lng: doctorLocation.lng,
  });
  const [progress, setProgress] = useState(0); // 0 to 100%

  useEffect(() => {
    if (arrived) {
      setCurrentDocPos({ lat: patientLocation.lat, lng: patientLocation.lng });
      setProgress(100);
      return;
    }
    if (!isSimulatingMovement) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Doctor arrived nearby
        const next = prev + 2;
        // Interpolate position between doctor origin and patient location
        const lat = doctorLocation.lat + (patientLocation.lat - doctorLocation.lat) * (next / 100);
        const lng = doctorLocation.lng + (patientLocation.lng - doctorLocation.lng) * (next / 100);
        setCurrentDocPos({ lat, lng });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [doctorLocation, patientLocation, isSimulatingMovement, arrived]);

  const currentDistance = arrived ? 0 : calculateDistanceKm(currentDocPos, patientLocation);
  const currentETA = arrived ? 0 : estimateArrivalMins(currentDistance);

  // Approximate relative positioning on a stylized Nairobi vector map canvas
  // Nairobi bounding box roughly: lat [-1.35, -1.20], lng [36.70, 36.95]
  const minLat = -1.35;
  const maxLat = -1.20;
  const minLng = 36.70;
  const maxLng = 36.95;

  const getPercentX = (lng: number) => Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
  const getPercentY = (lat: number) => Math.min(95, Math.max(5, ((maxLat - lat) / (maxLat - minLat)) * 100));

  const patientX = getPercentX(patientLocation.lng);
  const patientY = getPercentY(patientLocation.lat);

  const docX = getPercentX(currentDocPos.lng);
  const docY = getPercentY(currentDocPos.lat);

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex flex-col">
      {/* Top Floating ETA Card */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-emerald-100 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Doctor Dispatched
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live GPS
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {doctorName} {arrived ? 'has arrived' : 'is en route'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Estimated Arrival</span>
            <span className="text-lg font-extrabold text-emerald-700 flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4 text-emerald-600" />
              {arrived ? 'Arrived' : `${currentETA} mins`}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400 block font-medium">Distance</span>
            <span className="text-sm font-bold text-slate-700">{currentDistance} km</span>
          </div>
        </div>
      </div>

      {/* Stylized Nairobi Map Canvas View */}
      <div className="relative flex-1 bg-[#eef5ee] overflow-hidden">
        {/* Road & grid styling */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#65a30d" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated arterial roads (e.g. Mombasa Rd, Ngong Rd, Waiyaki Way) */}
          <path d="M 0 100 Q 200 150 400 300" stroke="#94a3b8" strokeWidth="6" fill="none" />
          <path d="M 100 0 Q 250 200 500 400" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          <path d="M 300 0 Q 320 250 200 400" stroke="#94a3b8" strokeWidth="5" fill="none" />
        </svg>

        {/* Route Line connecting Doctor to Patient */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <line
            x1={`${docX}%`}
            y1={`${docY}%`}
            x2={`${patientX}%`}
            y2={`${patientY}%`}
            stroke="#059669"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
          />
        </svg>

        {/* Patient Location Pin */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          style={{ left: `${patientX}%`, top: `${patientY}%` }}
        >
          <div className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md mb-1 whitespace-nowrap border border-slate-700 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>You: {patientLocation.neighbourhood}</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Moving Doctor Location Pin */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 ease-linear"
          style={{ left: `${docX}%`, top: `${docY}%` }}
        >
          <div className="bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md mb-1 whitespace-nowrap border border-emerald-600 flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-emerald-300" />
            <span>{doctorName}</span>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
            <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs">
              🩺
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safety & Dispatch Trust Badge */}
      <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>KMPDC Licensed Practitioner • Official Medical Kit & ID Card Verified</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Live GPS updates every 2s
        </span>
      </div>
    </div>
  );
}
