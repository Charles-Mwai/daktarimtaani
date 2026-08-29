// Client-side views of the DB-backed API shapes (flat Prisma rows), shared by
// the patient consult pages (track / room / summary). Distinct from the legacy
// nested shapes in types.ts which mirror the localStorage demo store.

export interface RequestRow {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceType: 'teleconsult' | 'home_visit' | 'ambulance';
  symptomsSummary: string;
  symptomsTags: string; // JSON string array
  severity: string;
  neighbourhood: string;
  address: string;
  lat: number;
  lng: number;
  estimatedPriceKES: number;
  status: 'matching' | 'accepted' | 'dispatching' | 'in_transit' | 'arrived' | 'consulting' | 'completed' | 'cancelled';
  assignedDoctorId?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
  inTransitAt?: string | null;
  arrivedAt?: string | null;
  consultStartedAt?: string | null;
  consultEndedAt?: string | null;
  paidAt?: string | null;
}

export interface DoctorView {
  id: string;
  name: string;
  phone: string | null;
  specialty: string;
  cadre: string;
  kmpdcLicenseNo: string;
  rating: number;
  totalConsults: number;
  avatarUrl: string;
  neighbourhood: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PrescriptionRow {
  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface ClinicalRecordView {
  id: string;
  requestId: string;
  doctorId: string;
  patientId: string;
  chiefComplaint: string;
  vitalsNotes?: string | null;
  clinicalImpression: string;
  prescriptions: PrescriptionRow[];
  referralRequired: boolean;
  referralFacility?: string | null;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  requestId: string;
  amountKES: number;
  phone: string;
  mpesaReceiptNo?: string | null;
  status: string;
  doctorPayoutAmountKES: number;
  doctorPayoutStatus: string;
  paymentDate?: string | null;
  createdAt: string;
}

export interface AmbulanceUnitRow {
  id: string;
  name: string;
  driverName: string;
  phone: string;
  registrationNo: string;
  vehicleType: 'basic' | 'advanced' | 'icu' | 'maternity';
  status: 'available' | 'in_transit' | 'offline' | 'maintenance';
  verificationStatus: 'pending' | 'verified' | 'suspended';
  area: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  etaMinutes: number;
  capacity: number;
  createdAt: string;
}

export interface AmbulanceConsoleView {
  units: AmbulanceUnitRow[];
}

export interface ConsultView {
  request: RequestRow;
  doctor: DoctorView | null;
  clinicalRecord: ClinicalRecordView | null;
  payment: PaymentRow | null;
}

// Fetch the enriched single-request view. Returns null when the request does
// not exist (404); throws on transient network failures so callers can retry.
export async function fetchConsult(requestId: string): Promise<ConsultView | null> {
  const res = await fetch(`/api/requests/${requestId}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch request: ${res.status}`);
  const data = await res.json();
  if (!data?.request) return null;
  return {
    request: data.request,
    doctor: data.doctor ?? null,
    clinicalRecord: data.clinicalRecord ?? null,
    payment: data.payment ?? null,
  };
}

export async function fetchAmbulanceConsole(): Promise<AmbulanceConsoleView> {
  const res = await fetch('/api/ambulance', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ambulance console: ${res.status}`);
  const data = await res.json();
  return { units: data.units ?? [] };
}
