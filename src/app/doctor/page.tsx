'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DispatchOfferModal from '@/components/DispatchOfferModal';
import {
  Stethoscope,
  Power,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Video,
  Navigation,
  CheckCircle2,
  FileEdit,
  DollarSign,
  User,
  Plus,
  Trash2,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { formatKES } from '@/lib/utils';

export default function DoctorConsolePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Clinical note writing modal state
  const [selectedReqForNotes, setSelectedReqForNotes] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState('Temp 37.2°C, BP 120/80 mmHg, Pulse 74 bpm');
  const [prescriptions, setPrescriptions] = useState<Array<{ medication: string; dosage: string; frequency: string; duration: string; instructions: string }>>([
    { medication: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'TDS (3x Daily)', duration: '5 Days', instructions: 'Take with food' },
  ]);

  const loadDoctorData = async () => {
    try {
      const authRes = await fetch('/api/auth/me?role=DOCTOR');
      const authData = await authRes.json();

      if (!authData.user || authData.user.role !== 'DOCTOR') {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setCurrentUser(authData.user);
      setDoctorProfile(authData.user.doctorProfile);

      // Fetch requests for this doctor
      if (authData.user.doctorProfile?.id) {
        const reqRes = await fetch(`/api/requests?doctorId=${authData.user.doctorProfile.id}`);
        const reqData = await reqRes.json();
        if (reqData.requests) {
          let active = reqData.requests.filter((r: any) => r.status !== 'completed' && r.status !== 'cancelled');
          const completed = reqData.requests.filter((r: any) => r.status === 'completed');

          // Also surface any pending dispatch offers as active items so doctors see inbound requests
          try {
            const pendingRes = await fetch(`/api/dispatch/pending?doctorId=${authData.user.doctorProfile.id}`);
            const pendingData = await pendingRes.json();
            if (pendingData.request && pendingData.offer) {
              // prepend if not already present
              const exists = active.find((a: any) => a.id === pendingData.request.id);
              if (!exists) active = [pendingData.request, ...active];
            }
          } catch (e) {
            // ignore
          }

          setActiveRequests(active);
          setCompletedRequests(completed);
        }
      }
    } catch (e) {
      console.error('Failed to load doctor data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
    const interval = setInterval(loadDoctorData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    if (!doctorProfile) return;
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorProfile.id,
          action: 'TOGGLE_ONLINE',
          isOnline: !doctorProfile.isOnline,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDoctorProfile({ ...doctorProfile, isOnline: !doctorProfile.isOnline });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveClinicalNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForNotes || !doctorProfile) return;

    try {
      const res = await fetch('/api/clinical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReqForNotes.id,
          doctorId: doctorProfile.id,
          patientId: selectedReqForNotes.patientId,
          chiefComplaint: selectedReqForNotes.symptomsSummary,
          vitalsNotes: vitals,
          clinicalImpression: diagnosis,
          prescriptions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedReqForNotes(null);
        loadDoctorData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'arrived' | 'consulting' | 'completed') => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadDoctorData();
    } catch (e) {
      console.error(e);
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medication: '', dosage: '', frequency: 'BD (2x Daily)', duration: '3 Days', instructions: '' },
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading Doctor Console...</div>;
  }

  // Not logged in view
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Doctor Console Authentication</h2>
          <p className="text-xs text-slate-500">
            Please log in or register with your KMPDC license to access your dispatch dashboard.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-card space-y-3">
          <button
            onClick={() => router.push('/doctor/login')}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Doctor Sign In</span>
          </button>

          <button
            onClick={() => router.push('/doctor/signup')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition"
          >
            Apply to Join Roster (KMPDC Registration)
          </button>
        </div>
      </div>
    );
  }

  // Verification Gatekeeper (Status PENDING or SUSPENDED)
  if (doctorProfile?.verificationStatus !== 'VERIFIED') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="bg-amber-200/80 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Status: {doctorProfile?.verificationStatus}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              KMPDC Licensure Review in Progress
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Hello {currentUser.name}. Under Kenya Medical Practitioners and Dentists Council regulations, your license number <strong>{doctorProfile?.kmpdcLicenseNo}</strong> must be authenticated before receiving live patient dispatches.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 text-left border border-amber-200/60 text-xs text-slate-700 space-y-2 max-w-md mx-auto">
            <div className="font-bold text-slate-900">What happens next:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>Our clinical admin cross-references your KMPDC license register entry.</li>
              <li>Verification typically takes &lt; 2 hours during pilot onboarding.</li>
              <li>Once verified, your online toggle will unlock automatically.</li>
            </ul>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            Need urgent verification for testing? Log in to the <strong>Admin Portal (`/admin/doctors`)</strong> to approve this license.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 30-Second Dispatch Offer Modal */}
      <DispatchOfferModal currentDoctorId={doctorProfile.id} />

      {/* Doctor Status Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={doctorProfile.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                doctorProfile.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${doctorProfile.isOnline ? 'bg-white animate-pulse' : 'bg-slate-200'}`} />
            </span>
          </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  KMPDC VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                {doctorProfile.specialty} • <span className="font-mono text-emerald-700">{doctorProfile.kmpdcLicenseNo}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 sm:mt-1">
                Hub Location: <strong>{doctorProfile.neighbourhood}</strong>
              </p>
            </div>
        </div>

        {/* Online Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs transition shadow-md active:scale-95 cursor-pointer ${
              doctorProfile.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-800 hover:bg-slate-900 text-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{doctorProfile.isOnline ? 'Online (Accepting Dispatches)' : 'Offline (Shift Paused)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Today's Earnings</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            {formatKES(completedRequests.length * 800)}
          </span>
          <span className="text-[10px] text-slate-400">Via M-Pesa B2C Payout</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Consults Completed</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {completedRequests.length}
          </span>
          <span className="text-[10px] text-slate-400">Total Lifetime: {doctorProfile.totalConsults}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Quality Rating</span>
          <span className="text-xl font-extrabold text-amber-500 mt-1 block">
            ★ {doctorProfile.rating}
          </span>
          <span className="text-[10px] text-slate-400">Top Rated in Nairobi</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Acceptance SLA</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            96%
          </span>
          <span className="text-[10px] text-slate-400">Avg Response: 14s</span>
        </div>
      </div>

      {/* Active Consultations Queue */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Active Consultations & Dispatches</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeRequests.length} Active
            </span>
          </div>
        </div>

        {activeRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No active patient dispatches currently</p>
            <p className="text-slate-400 mt-0.5">Keep your status Online to receive incoming pilot requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {req.serviceType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.status === 'consulting'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{req.patientName}</span>
                    <span className="text-slate-400 text-xs">({req.patientPhone})</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Location:</strong> {req.address} ({req.neighbourhood})
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Triage:</strong> {req.symptomsSummary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {req.serviceType === 'teleconsult' ? (
                    <>
                      <button
                        onClick={() => router.push(`/doctor/consult/${req.id}/room`)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Video Call</span>
                      </button>
                      {req.status === 'consulting' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'completed')}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>End Video Consult</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/patient/consult/${req.id}/track`)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Navigate Live GPS</span>
                      </button>
                      {req.status === 'in_transit' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'arrived')}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Arrived</span>
                        </button>
                      )}
                      {req.status === 'arrived' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'consulting')}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>Start Consultation</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setSelectedReqForNotes(req)}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    <FileEdit className="w-4 h-4 text-emerald-600" />
                    <span>Write Rx & Close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Notes & Prescription Modal Form */}
      {selectedReqForNotes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical Consultation Record & Rx</h3>
                <p className="text-xs text-slate-500">Patient: {selectedReqForNotes.patientName}</p>
              </div>
              <button
                onClick={() => setSelectedReqForNotes(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClinicalNotes} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vitals & Examination Notes:
                </label>
                <input
                  type="text"
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Diagnosis / Impression:
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bacterial Tonsillopharyngitis"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Prescription Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Prescription (Rx):</label>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Drug name (e.g. Amoxicillin)"
                        value={rx.medication}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].medication = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="p-2 rounded-lg border border-slate-200 text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg)"
                        value={rx.dosage}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[idx].dosage = e.target.value;
                          setPrescriptions(updated);
                        }}
                        className="p-2 rounded-lg border border-slate-200 text-xs"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Freq & Duration"
                          value={rx.frequency}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].frequency = e.target.value;
                            setPrescriptions(updated);
                          }}
                          className="p-2 rounded-lg border border-slate-200 text-xs flex-1"
                        />
                        {prescriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrescriptionRow(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReqForNotes(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition"
                >
                  Sign Record & Conclude Consult
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
