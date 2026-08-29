'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, UserCheck, Award, FileCheck, RefreshCw } from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (doctorId: string, status: 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          action: 'UPDATE_VERIFICATION',
          verificationStatus: status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchDoctors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Licensure & Verification Queue
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Enforcing KMPDC e-Health regulatory compliance & annual practitioner licensure checks.
          </p>
        </div>

        <button
          onClick={fetchDoctors}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading doctor verification queue...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No doctors registered yet.</div>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        doc.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.verificationStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold">{doc.specialty}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="font-mono bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 text-slate-800">
                      KMPDC Reg: <strong>{doc.kmpdcLicenseNo}</strong>
                    </span>
                    <span>Cadre: <strong>{doc.cadre}</strong></span>
                    <span>Phone: <strong>{doc.phone}</strong></span>
                    <span>Zone: <strong>{doc.neighbourhood}</strong></span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 max-w-xl">{doc.bio}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-center">
                {doc.verificationStatus !== 'VERIFIED' ? (
                  <button
                    onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(doc.id, 'SUSPENDED')}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Suspend Doctor</span>
                  </button>
                )}

                {doc.verificationStatus === 'SUSPENDED' && (
                  <button
                    onClick={() => handleUpdateStatus(doc.id, 'PENDING')}
                    className="text-xs text-slate-500 hover:underline text-center cursor-pointer"
                  >
                    Set to Pending Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
