"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatKES } from '@/lib/utils';
import { Clock, FileText, User, MapPin } from 'lucide-react';

export default function DoctorHistoryPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sres = await fetch('/api/auth/me?role=DOCTOR');
        const sdata = await sres.json();
        setDoctor(sdata.user);
        if (!sdata.user || !sdata.user.doctorProfile) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const docId = sdata.user.doctorProfile.id;
        const res = await fetch(`/api/requests?doctorId=${docId}`);
        const data = await res.json();
        // Filter to consultations that have been assigned/accepted/consulting/completed
        const goodStates = new Set(['accepted', 'in_transit', 'arrived', 'consulting', 'completed']);
        const list = (data.requests || []).filter((r: any) => goodStates.has(r.status));

        // Sort by most recent first
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(list);
      } catch (e) {
        console.error('Load history error', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading consult history...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-50 rounded-md text-emerald-700">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Consult History</h2>
          <p className="text-sm text-slate-500">Recent consultations assigned to you.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center text-slate-600">
          No past consults found. Your recent accepted consultations will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-md">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{r.patientName}</div>
                    <div className="text-xs text-slate-500">{r.patientPhone} • {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{r.neighbourhood} — {r.address}</span>
                  </div>
                  <div className="mt-2">{r.symptomsSummary}</div>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="text-xs text-slate-500">Status</div>
                <div className="font-bold text-slate-900 text-sm">{r.status}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => router.push(`/doctor/request/${r.id}`)} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 font-semibold">Open</button>
                  <button onClick={() => navigator.clipboard.writeText(r.id)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 text-slate-700">Copy ID</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
