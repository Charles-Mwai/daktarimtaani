'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchConsult, ConsultView } from '@/lib/api';
import { formatKES } from '@/lib/utils';
import MpesaModal from '@/components/MpesaModal';
import {
  FileText,
  CheckCircle,
  Pill,
  ShieldCheck,
  Star,
  Download,
  CreditCard,
  Building,
  User,
  Heart,
  ArrowRight,
  Loader2,
  PenLine,
} from 'lucide-react';

const POLL_MS = 4000;

export default function PatientConsultSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [consult, setConsult] = useState<ConsultView | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const refresh = useCallback(async (): Promise<ConsultView | null> => {
    try {
      const view = await fetchConsult(requestId);
      if (view === null) {
        setNotFound(true);
        return null;
      }
      setConsult(view);
      return view;
    } catch {
      return null;
    }
  }, [requestId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, patientRating: rating, patientComment: comment }),
      });
      setRatingSubmitted(true);
    } catch {
      setRatingSubmitted(true); // don't block the patient on a failed demo submit
    }
  };

  const handlePaymentSuccess = (receiptNo: string) => {
    setShowMpesaModal(false);
    refresh();
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
    return <div className="text-center py-12 text-slate-500">Loading consultation summary...</div>;
  }

  const { request, doctor, clinicalRecord: record, payment } = consult;
  const doctorName = doctor?.name || 'Attending Doctor';

  // Consultation not concluded yet — no clinical record exists.
  if (!record) {
    const inProgress = request.status !== 'completed';

    if (request.serviceType === 'ambulance' && request.status === 'completed') {
      return (
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-extrabold text-slate-900">Ambulance trip completed</h1>
          <p className="text-sm text-slate-500">
            The ride is complete. Please complete payment to finalize this request and confirm the service was delivered.
          </p>

          <button
            onClick={() => setShowMpesaModal(true)}
            className="bg-[#00b04f] hover:bg-[#008c3e] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 mx-auto"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay {formatKES(request.estimatedPriceKES)} (M-Pesa)</span>
          </button>

          {showMpesaModal && (
            <MpesaModal
              requestId={requestId}
              amountKES={request.estimatedPriceKES}
              phone={request.patientPhone}
              onSuccess={() => {
                setShowMpesaModal(false);
                refresh();
              }}
              onCancel={() => setShowMpesaModal(false)}
            />
          )}
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        {inProgress ? (
          <>
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">Consultation still in progress</h1>
            <p className="text-sm text-slate-500">
              Your clinical summary and prescriptions will appear here as soon as{' '}
              {doctorName} concludes the consultation.
            </p>
            <a
              href={`/patient/consult/${requestId}/${request.serviceType === 'teleconsult' ? 'room' : 'track'}`}
              className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm hover:underline"
            >
              Return to {request.serviceType === 'teleconsult' ? 'consultation room' : 'visit tracking'}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </>
        ) : (
          <>
            <PenLine className="w-10 h-10 text-emerald-600 mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">Doctor is finalizing clinical notes</h1>
            <p className="text-sm text-slate-500">
              The consultation has ended. This page updates automatically the moment the
              prescription and notes are submitted.
            </p>
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin mx-auto" />
          </>
        )}
      </div>
    );
  }

  const isPaid = payment?.status === 'completed' || !!request.paidAt;

  const rxDetail = (rx: { dosage?: string; frequency?: string; duration?: string }) =>
    [rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' • ');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Consultation Concluded</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Medical Summary & Prescription
          </h1>
          <p className="text-xs text-emerald-100/80">
            Official consultation record with {doctorName}
            {doctor ? ` (${doctor.kmpdcLicenseNo})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isPaid ? (
            <button
              onClick={() => setShowMpesaModal(true)}
              className="bg-[#00b04f] hover:bg-[#008c3e] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay {formatKES(request.estimatedPriceKES)} (M-Pesa)</span>
            </button>
          ) : (
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Paid: {payment?.mpesaReceiptNo || 'M-Pesa'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Notes & Prescription Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-sm space-y-6">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Patient:</span> {request.patientName} ({request.patientPhone})
          </div>
          <div>
            <span className="font-semibold text-slate-700">Consultation Date:</span>{' '}
            {new Date(record.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          {doctor && <div className="text-emerald-700 font-mono font-semibold">{doctor.kmpdcLicenseNo}</div>}
        </div>

        {/* Chief Complaint */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chief Complaint
          </h3>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs md:text-sm text-slate-800">
            <p className="font-semibold text-slate-900">{record.chiefComplaint}</p>
          </div>
        </div>

        {/* Clinical Impression */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Clinical Diagnosis & Assessment
          </h3>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs md:text-sm text-slate-800">
            <p className="font-bold text-emerald-950">{record.clinicalImpression}</p>
            {record.vitalsNotes && (
              <p className="text-slate-600 text-xs">
                <strong>Vitals / Observations:</strong> {record.vitalsNotes}
              </p>
            )}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Official Prescription (Rx)</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-medium">Valid at registered Kenyan pharmacies</span>
          </div>

          {record.prescriptions.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600">
              No prescriptions were issued for this consultation. Follow the clinical advice above,
              and seek review if symptoms persist.
            </div>
          ) : (
            <div className="space-y-2">
              {record.prescriptions.map((rx, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rx.medication}</h4>
                    {rxDetail(rx) && (
                      <p className="text-emerald-800 font-medium mt-0.5">{rxDetail(rx)}</p>
                    )}
                    {rx.instructions && (
                      <p className="text-slate-500 text-[11px] mt-1 italic">{rx.instructions}</p>
                    )}
                  </div>
                  <div className="shrink-0 bg-white px-3 py-1 rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-800 self-start sm:self-center">
                    Rx Verified
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral notice */}
        {record.referralRequired && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Referral issued:</strong> {record.referralFacility || 'Higher-level facility'}.
              Please present this summary at the receiving facility.
            </p>
          </div>
        )}

        {/* Doctor Signature Block */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <img
              src={doctor?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
              alt={doctorName}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-300"
            />
            <div>
              <p className="font-bold text-slate-900">{doctorName}</p>
              {doctor && <p className="text-[11px] text-emerald-700">{doctor.specialty}</p>}
              <p className="text-[10px] text-slate-400 font-mono">Digital Signature • KMPDC Verified</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Medical PDF</span>
          </button>
        </div>
      </div>

      {/* Two-Way Rating Block */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">How was your consultation experience?</h3>
        {!ratingSubmitted ? (
          <form onSubmit={handleRatingSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5 Stars</span>
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave feedback on doctor punctuality, clarity, and care quality..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>Thank you for your rating! Your feedback helps us maintain top care quality.</span>
          </div>
        )}
      </div>

      {/* M-Pesa Modal popup */}
      {showMpesaModal && (
        <MpesaModal
          requestId={request.id}
          amountKES={request.estimatedPriceKES}
          phone={request.patientPhone}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowMpesaModal(false)}
        />
      )}
    </div>
  );
}
