'use client';

import React, { useEffect, useState } from 'react';
import { formatKES } from '@/lib/utils';
import {
  Activity,
  MapPin,
  Stethoscope,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Radio,
  UserCheck,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function AdminOpsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpsData = async () => {
    try {
      const [docRes, reqRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/requests'),
      ]);
      const docData = await docRes.json();
      const reqData = await reqRes.json();

      if (docData.doctors) setDoctors(docData.doctors);
      if (reqData.requests) setRequests(reqData.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpsData();
    const interval = setInterval(fetchOpsData, 3000);
    return () => clearInterval(interval);
  }, []);

  const onlineDoctors = doctors.filter((d) => d.isOnline && d.verificationStatus === 'VERIFIED');
  const activeRequests = requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Live Pilot Operations Control
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Dispatch Center & SLA Monitor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/ambulance"
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>🚑</span>
            <span>Ambulance Console</span>
          </a>
          <button
            onClick={fetchOpsData}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ops</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Online Verified Roster</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {onlineDoctors.length} / {doctors.length}
          </span>
          <span className="text-[10px] text-slate-400">Nairobi Active Fleet</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Active Dispatches</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {activeRequests.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">In Matching / En Route</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Median Connect SLA</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            3.4 min
          </span>
          <span className="text-[10px] text-slate-400">Target: &lt; 5 min SLA</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total GMV (Pilot)</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {formatKES(requests.reduce((acc, r) => acc + (r.estimatedPriceKES || 1000), 0))}
          </span>
          <span className="text-[10px] text-slate-400">20% Platform Take-rate</span>
        </div>
      </div>

      {/* 2-Column: Request Pipeline & Fleet Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Request Pipeline</span>
            </h3>

            {requests.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-xs">No requests in pipeline yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const assignedDoc = doctors.find((d) => d.id === req.assignedDoctorId);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                              req.status === 'matching'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : req.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="font-bold text-slate-900">{req.patientName}</span>
                          <span className="text-slate-400">({req.serviceType})</span>
                        </div>
                        <span className="font-bold text-emerald-700">{formatKES(req.estimatedPriceKES)}</span>
                      </div>

                      <div className="text-slate-600 grid sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong>Location:</strong> {req.neighbourhood} ({req.address})
                        </div>
                        <div>
                          <strong>Assigned Doctor:</strong>{' '}
                          {assignedDoc ? `${assignedDoc.name} (${assignedDoc.kmpdcLicenseNo})` : 'Awaiting Match'}
                        </div>
                      </div>

                      <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Triage: {req.symptomsSummary}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Doctor Fleet Status */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>Doctor Fleet Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                      <p className="text-[10px] text-emerald-700 font-mono">{doc.neighbourhood}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.isOnline
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {doc.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {doc.verificationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
