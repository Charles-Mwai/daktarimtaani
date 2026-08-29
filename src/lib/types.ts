export type ServiceType = 'teleconsult' | 'home_visit' | 'ambulance';

export type RequestStatus =
  | 'matching'
  | 'accepted'
  | 'dispatching'
  | 'in_transit'
  | 'arrived'
  | 'consulting'
  | 'completed'
  | 'cancelled';

export type DoctorVerificationStatus = 'verified' | 'pending' | 'rejected' | 'suspended';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  neighbourhood: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  defaultLocation: LocationCoordinates;
}

export interface DoctorProfile {
  id: string;
  name: string;
  title: string; // e.g. "Dr." or "Clinical Officer"
  phone: string;
  email: string;
  kmpdcLicenseNo: string;
  specialty: string;
  cadre: 'Medical Practitioner' | 'Clinical Officer' | 'Specialist';
  verificationStatus: DoctorVerificationStatus;
  verifiedAt?: string;
  rating: number;
  totalConsults: number;
  isOnline: boolean;
  currentLocation: LocationCoordinates;
  avatarUrl: string;
  bio: string;
  payoutMpesa: string;
  joinedDate: string;
}

export interface DispatchOffer {
  id: string;
  requestId: string;
  doctorId: string;
  offeredAt: string;
  expiresAt: string; // 30s timeout
  status: 'pending' | 'accepted' | 'declined' | 'timed_out' | 'cancelled';
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ClinicalRecord {
  id: string;
  requestId: string;
  doctorId: string;
  patientId: string;
  chiefComplaint: string;
  symptomsList: string[];
  vitalsNotes?: string;
  clinicalImpression: string;
  prescriptions: PrescriptionItem[];
  referralRequired: boolean;
  referralFacility?: string;
  confidentialDoctorNotesEncrypted?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  requestId: string;
  amountKES: number;
  phone: string;
  mpesaReceiptNo?: string;
  status: 'pending' | 'stk_sent' | 'completed' | 'failed';
  paymentDate?: string;
  doctorPayoutAmountKES: number;
  doctorPayoutStatus: 'pending' | 'paid';
}

export interface RatingRecord {
  id: string;
  requestId: string;
  patientRating: number;
  patientComment?: string;
  doctorRating?: number;
  doctorComment?: string;
  createdAt: string;
}

export interface MedicalRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceType: ServiceType;
  symptomsSummary: string;
  symptomsTags: string[];
  severity: 'mild' | 'moderate' | 'urgent';
  location: LocationCoordinates;
  estimatedPriceKES: number;
  status: RequestStatus;
  createdAt: string;
  assignedDoctorId?: string;
  currentOfferId?: string;
  timeline: {
    requestedAt: string;
    acceptedAt?: string;
    inTransitAt?: string;
    arrivedAt?: string;
    consultStartedAt?: string;
    consultEndedAt?: string;
    paidAt?: string;
  };
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  targetType: 'request' | 'doctor_verification' | 'medical_record' | 'payment';
  targetId: string;
  timestamp: string;
  details: string;
}
