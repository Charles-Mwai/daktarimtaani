'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadState } from '@/lib/store';
import { ClinicalRecord, MedicalRequest } from '@/lib/types';
import { FileText, Calendar, Pill, User, Stethoscope, ChevronRight } from 'lucide-react';
import { formatKES } from '@/lib/utils';

export default function PatientRecordsPage() {
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);

  useEffect(() => {
    const state = loadState();
    setRequests(state.requests);
    setRecords(state.clinicalRecords);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Health Records & Consultations
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Encrypted, ODPC Data Protection Act compliant health history.
        </p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No medical requests yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              When you complete a teleconsultation or home visit, your records will appear here.
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const rec = records.find((r) => r.requestId === req.id);
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {req.serviceType}
                    </span>
                    <span className="text-slate-400 font-mono">ID: {req.id}</span>
                  </div>
                  <span className="text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {rec?.clinicalImpression || req.symptomsSummary}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Location: {req.location.neighbourhood} • Status: <strong className="text-emerald-700 capitalize">{req.status}</strong>
                    </p>
                  </div>

                  <Link
                    href={`/patient/consult/${req.id}/summary`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition self-start sm:self-center"
                  >
                    <span>View Prescription & Notes</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
