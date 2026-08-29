import { DoctorProfile, LocationCoordinates, PatientProfile } from './types';

export const NAIROBI_NEIGHBOURHOODS: LocationCoordinates[] = [
  {
    neighbourhood: 'Kilimani / Hurlingham',
    address: 'Argwings Kodhek Rd, Kilimani, Nairobi',
    lat: -1.2917,
    lng: 36.7905,
  },
  {
    neighbourhood: 'Westlands / Parklands',
    address: 'Rhapta Road, Westlands, Nairobi',
    lat: -1.2642,
    lng: 36.8041,
  },
  {
    neighbourhood: 'Kileleshwa',
    address: 'Kandara Rd, Kileleshwa, Nairobi',
    lat: -1.2825,
    lng: 36.7824,
  },
  {
    neighbourhood: 'South B / South C',
    address: 'Mombasa Road, South B, Nairobi',
    lat: -1.3142,
    lng: 36.8375,
  },
  {
    neighbourhood: 'Lavington',
    address: 'James Gichuru Rd, Lavington, Nairobi',
    lat: -1.2789,
    lng: 36.7645,
  },
  {
    neighbourhood: 'Kasarani / Roysambu',
    address: 'Thika Superhighway, Kasarani, Nairobi',
    lat: -1.2185,
    lng: 36.8924,
  },
];

export const INITIAL_PATIENT: PatientProfile = {
  id: 'patient-001',
  name: 'Wanjiku Mwangi',
  phone: '+254 712 345 678',
  email: 'wanjiku.mwangi@example.co.ke',
  dob: '1992-05-14',
  defaultLocation: NAIROBI_NEIGHBOURHOODS[0], // Kilimani
};

export const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-001',
    name: 'Dr. Brian Kamau',
    title: 'Dr.',
    phone: '+254 722 100 200',
    email: 'dr.kamau@daktari.co.ke',
    kmpdcLicenseNo: 'KMPDC/A4912/2026',
    specialty: 'General Practice & Family Medicine',
    cadre: 'Medical Practitioner',
    verificationStatus: 'verified',
    verifiedAt: '2026-01-15T09:00:00Z',
    rating: 4.9,
    totalConsults: 142,
    isOnline: true,
    currentLocation: {
      neighbourhood: 'Kilimani',
      address: 'Wood Avenue, Kilimani, Nairobi',
      lat: -1.2950,
      lng: 36.7865,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    bio: 'MBChB (Univ. of Nairobi). 8 years experience in acute primary care, triage, and home medical interventions.',
    payoutMpesa: '+254 722 100 200',
    joinedDate: '2025-11-01',
  },
  {
    id: 'doc-002',
    name: 'Dr. Faith Achieng',
    title: 'Dr.',
    phone: '+254 733 456 789',
    email: 'dr.achieng@daktari.co.ke',
    kmpdcLicenseNo: 'KMPDC/A6210/2026',
    specialty: 'Pediatrics & Child Health',
    cadre: 'Specialist',
    verificationStatus: 'verified',
    verifiedAt: '2026-02-01T11:30:00Z',
    rating: 4.95,
    totalConsults: 98,
    isOnline: true,
    currentLocation: {
      neighbourhood: 'Westlands',
      address: 'Mpaka Rd, Westlands, Nairobi',
      lat: -1.2660,
      lng: 36.8020,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1594824813581-797e930f3f6e?w=300&auto=format&fit=crop&q=80',
    bio: 'MMed Pediatrics (Aga Khan Univ). Compassionate pediatric care and early childhood triage.',
    payoutMpesa: '+254 733 456 789',
    joinedDate: '2025-12-10',
  },
  {
    id: 'doc-003',
    name: 'CO. Peter Omondi',
    title: 'CO',
    phone: '+254 701 987 654',
    email: 'co.omondi@daktari.co.ke',
    kmpdcLicenseNo: 'KMPDC/CO-8841/2026',
    specialty: 'Clinical Medicine & Community Health',
    cadre: 'Clinical Officer',
    verificationStatus: 'pending',
    verifiedAt: undefined,
    rating: 4.7,
    totalConsults: 45,
    isOnline: false,
    currentLocation: {
      neighbourhood: 'South B',
      address: 'Kapiti Rd, South B, Nairobi',
      lat: -1.3120,
      lng: 36.8390,
    },
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    bio: 'Diploma in Clinical Medicine & Surgery (KMTC). Field diagnostics, wound care, and immediate emergency stabilization.',
    payoutMpesa: '+254 701 987 654',
    joinedDate: '2026-08-20',
  },
];

export const PRICING = {
  teleconsult: {
    basePriceKES: 1000,
    platformFeeKES: 200,
    doctorShareKES: 800,
    targetSLA: '< 5 min',
    description: 'Instant video or voice consultation with a licensed KMPDC doctor directly in your browser.',
  },
  home_visit: {
    basePriceKES: 2500,
    platformFeeKES: 500,
    doctorShareKES: 2000,
    targetSLA: '< 45 min',
    description: 'A verified doctor or clinical officer dispatched directly to your home or office location.',
  },
  ambulance: {
    basePriceKES: 4200,
    platformFeeKES: 800,
    doctorShareKES: 3400,
    targetSLA: '< 20 min',
    description: 'Non-emergency or emergency ambulance transport with live GPS tracking and patient transfer support.',
  },
};

export const COMMON_SYMPTOMS = [
  { id: 'fever', label: 'High Fever & Chills', severity: 'moderate' as const, category: 'General' },
  { id: 'respiratory', label: 'Cough, Flu & Sore Throat', severity: 'mild' as const, category: 'Respiratory' },
  { id: 'stomach', label: 'Severe Stomach Pain / Diarrhea', severity: 'moderate' as const, category: 'Digestive' },
  { id: 'headache', label: 'Persistent Migraine / Headache', severity: 'mild' as const, category: 'Neurological' },
  { id: 'pediatric', label: 'Child Illness / Pediatric Triage', severity: 'moderate' as const, category: 'Pediatric' },
  { id: 'rash', label: 'Skin Rash or Allergic Flare', severity: 'mild' as const, category: 'Dermatology' },
  { id: 'hypertension', label: 'Blood Pressure Check / Medication Refill', severity: 'mild' as const, category: 'Chronic' },
  { id: 'injury', label: 'Sprain, Minor Cut or Wound Care', severity: 'urgent' as const, category: 'Trauma' },
];
