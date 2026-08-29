'use client';

import {
  AuditLog,
  ClinicalRecord,
  DispatchOffer,
  DoctorProfile,
  MedicalRequest,
  PatientProfile,
  PaymentRecord,
  RatingRecord,
  RequestStatus,
  ServiceType,
  UserRole,
} from './types';
import { INITIAL_DOCTORS, INITIAL_PATIENT, PRICING } from './constants';
import { calculateDistanceKm, playChimeSound } from './utils';

const STORAGE_KEY = 'daktari_mtaani_state_v1';

interface AppState {
  activeRole: UserRole;
  activeDoctorId: string;
  patient: PatientProfile;
  doctors: DoctorProfile[];
  requests: MedicalRequest[];
  dispatchOffers: DispatchOffer[];
  clinicalRecords: ClinicalRecord[];
  payments: PaymentRecord[];
  ratings: RatingRecord[];
  auditLogs: AuditLog[];
}

const getInitialState = (): AppState => {
  return {
    activeRole: 'patient',
    activeDoctorId: 'doc-001',
    patient: INITIAL_PATIENT,
    doctors: INITIAL_DOCTORS,
    requests: [
      {
        id: 'req-sample-01',
        patientId: INITIAL_PATIENT.id,
        patientName: INITIAL_PATIENT.name,
        patientPhone: INITIAL_PATIENT.phone,
        serviceType: 'teleconsult',
        symptomsSummary: 'Persistent migraine and mild fever since yesterday morning.',
        symptomsTags: ['High Fever & Chills', 'Persistent Migraine / Headache'],
        severity: 'mild',
        location: INITIAL_PATIENT.defaultLocation,
        estimatedPriceKES: PRICING.teleconsult.basePriceKES,
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        assignedDoctorId: 'doc-001',
        timeline: {
          requestedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          acceptedAt: new Date(Date.now() - 3600000 * 24 + 15000).toISOString(),
          consultStartedAt: new Date(Date.now() - 3600000 * 24 + 60000).toISOString(),
          consultEndedAt: new Date(Date.now() - 3600000 * 24 + 900000).toISOString(),
          paidAt: new Date(Date.now() - 3600000 * 24 + 960000).toISOString(),
        },
      },
    ],
    dispatchOffers: [],
    clinicalRecords: [
      {
        id: 'rec-sample-01',
        requestId: 'req-sample-01',
        doctorId: 'doc-001',
        patientId: INITIAL_PATIENT.id,
        chiefComplaint: 'Tension headache accompanied by low-grade febrile episodes.',
        symptomsList: ['Persistent Migraine / Headache', 'High Fever & Chills'],
        vitalsNotes: 'Temp 37.8°C, BP 120/80 mmHg. Alert and oriented.',
        clinicalImpression: 'Tension-type Cephalea secondary to acute viral prodrome.',
        prescriptions: [
          {
            id: 'rx-1',
            medication: 'Paracetamol Tabs',
            dosage: '1000mg',
            frequency: 'TDS (3x Daily)',
            duration: '3 Days',
            instructions: 'Take with warm water after meals. Rest adequately.',
          },
        ],
        referralRequired: false,
        createdAt: new Date(Date.now() - 3600000 * 24 + 900000).toISOString(),
      },
    ],
    payments: [
      {
        id: 'pay-sample-01',
        requestId: 'req-sample-01',
        amountKES: 1000,
        phone: INITIAL_PATIENT.phone,
        mpesaReceiptNo: 'SDQ891LK92',
        status: 'completed',
        paymentDate: new Date(Date.now() - 3600000 * 24 + 960000).toISOString(),
        doctorPayoutAmountKES: 800,
        doctorPayoutStatus: 'paid',
      },
    ],
    ratings: [
      {
        id: 'rat-sample-01',
        requestId: 'req-sample-01',
        patientRating: 5,
        patientComment: 'Dr. Kamau was very thorough and reassuring over video. Connected in under 2 minutes!',
        doctorRating: 5,
        createdAt: new Date(Date.now() - 3600000 * 24 + 1000000).toISOString(),
      },
    ],
    auditLogs: [
      {
        id: 'log-001',
        actorId: 'doc-001',
        actorRole: 'doctor',
        actorName: 'Dr. Brian Kamau',
        action: 'DOCTOR_VERIFIED',
        targetType: 'doctor_verification',
        targetId: 'doc-001',
        timestamp: '2026-01-15T09:00:00Z',
        details: 'KMPDC License KMPDC/A4912/2026 validated against national register.',
      },
      {
        id: 'log-002',
        actorId: INITIAL_PATIENT.id,
        actorRole: 'patient',
        actorName: INITIAL_PATIENT.name,
        action: 'CONSULT_COMPLETED',
        targetType: 'medical_record',
        targetId: 'rec-sample-01',
        timestamp: new Date(Date.now() - 3600000 * 24 + 900000).toISOString(),
        details: 'Clinical note encrypted & stored. Consent captured per Data Protection Act 2019.',
      },
    ],
  };
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return getInitialState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('daktari_state_updated'));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function resetState(): AppState {
  const initial = getInitialState();
  saveState(initial);
  return initial;
}

// Dispatch Matching Algorithm
export function triggerDispatch(requestId: string): AppState {
  const state = loadState();
  const request = state.requests.find((r) => r.id === requestId);
  if (!request) return state;

  // Find candidate doctors: verified and online
  const availableDoctors = state.doctors.filter(
    (d) => d.verificationStatus === 'verified' && d.isOnline
  );

  if (availableDoctors.length === 0) {
    // Escalate to admin log
    const audit: AuditLog = {
      id: 'log-' + Date.now(),
      actorId: 'system',
      actorRole: 'admin',
      actorName: 'Dispatch Engine',
      action: 'DISPATCH_NO_DOCTOR',
      targetType: 'request',
      targetId: requestId,
      timestamp: new Date().toISOString(),
      details: `Zero online verified doctors available for request ${requestId} in ${request.location.neighbourhood}. Alerting ops console.`,
    };
    state.auditLogs.unshift(audit);
    saveState(state);
    return state;
  }

  // Rank doctors by proximity to patient location
  const ranked = [...availableDoctors].map((doc) => {
    const distanceKm = calculateDistanceKm(request.location, doc.currentLocation);
    return {
      doctor: doc,
      distanceKm,
      score: doc.rating * 20 - distanceKm * 2, // weighted rating vs proximity
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  const targetDoctor = ranked[0].doctor;

  // Create 30-second dispatch offer
  const offer: DispatchOffer = {
    id: 'offer-' + Date.now(),
    requestId: request.id,
    doctorId: targetDoctor.id,
    offeredAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30000).toISOString(),
    status: 'pending',
  };

  request.currentOfferId = offer.id;
  state.dispatchOffers.push(offer);

  const audit: AuditLog = {
    id: 'log-' + Date.now(),
    actorId: 'system',
    actorRole: 'admin',
    actorName: 'Dispatch Engine',
    action: 'OFFER_SENT',
    targetType: 'request',
    targetId: requestId,
    timestamp: new Date().toISOString(),
    details: `Offered request ${requestId} (${request.serviceType}) to ${targetDoctor.name} (${targetDoctor.kmpdcLicenseNo}). 30s accept SLA timer started.`,
  };
  state.auditLogs.unshift(audit);

  saveState(state);
  playChimeSound();
  return state;
}

export function respondToDispatchOffer(
  offerId: string,
  response: 'accepted' | 'declined' | 'timed_out' | 'cancelled'
): AppState {
  const state = loadState();
  const offerIndex = state.dispatchOffers.findIndex((o) => o.id === offerId);
  if (offerIndex === -1) return state;

  const offer = state.dispatchOffers[offerIndex];
  offer.status = response;

  const request = state.requests.find((r) => r.id === offer.requestId);
  const doctor = state.doctors.find((d) => d.id === offer.doctorId);

  if (response === 'accepted' && request && doctor) {
    request.status = request.serviceType === 'home_visit' ? 'in_transit' : 'accepted';
    request.assignedDoctorId = doctor.id;
    request.timeline.acceptedAt = new Date().toISOString();
    if (request.serviceType === 'home_visit') {
      request.timeline.inTransitAt = new Date().toISOString();
    }

    state.auditLogs.unshift({
      id: 'log-' + Date.now(),
      actorId: doctor.id,
      actorRole: 'doctor',
      actorName: doctor.name,
      action: 'DISPATCH_ACCEPTED',
      targetType: 'request',
      targetId: request.id,
      timestamp: new Date().toISOString(),
      details: `${doctor.name} accepted request ${request.id}. Status set to ${request.status}.`,
    });
  } else if (response === 'declined' || response === 'timed_out' || response === 'cancelled') {
    state.auditLogs.unshift({
      id: 'log-' + Date.now(),
      actorId: doctor ? doctor.id : 'system',
      actorRole: 'doctor',
      actorName: doctor ? doctor.name : 'System SLA Timer',
      action: response === 'declined' ? 'DISPATCH_DECLINED' : response === 'timed_out' ? 'DISPATCH_TIMEOUT' : 'DISPATCH_CANCELLED',
      targetType: 'request',
      targetId: offer.requestId,
      timestamp: new Date().toISOString(),
      details: `Offer ${offerId} was ${response}. Re-routing dispatch to alternative doctor...`,
    });

    // Re-trigger dispatch offer to next doctor
    if (request) {
      setTimeout(() => {
        triggerDispatch(request.id);
      }, 500);
    }
  }

  saveState(state);
  return state;
}
