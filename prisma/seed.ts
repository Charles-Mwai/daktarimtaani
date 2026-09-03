import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Daktari Mtaani pilot database...');

  // 1. Create Patient User
  const patientUser = await prisma.user.upsert({
    where: { phone: '+254712345678' },
    update: {},
    create: {
      phone: '+254712345678',
      email: 'wanjiku.mwangi@example.co.ke',
      name: 'Wanjiku Mwangi',
      role: 'PATIENT',
      patient: {
        create: {
          neighbourhood: 'Kilimani / Hurlingham',
          address: 'Argwings Kodhek Rd, Kilimani, Nairobi',
          lat: -1.2917,
          lng: 36.7905,
          emergencyPhone: '+254712000111',
          consentGiven: true,
        },
      },
    },
  });

  // 2. Create Admin User
  await prisma.user.upsert({
    where: { phone: '+254700000000' },
    update: {},
    create: {
      phone: '+254700000000',
      email: 'admin@daktari.co.ke',
      name: 'Chief Medical Operations Admin',
      passwordHash: bcrypt.hashSync('AdminSecure2026!', 10),
      role: 'ADMIN',
    },
  });

  // 3. Create Doctor 1 (Dr. Brian Kamau - Verified GP in Kilimani)
  await prisma.user.upsert({
    where: { phone: '+254722100200' },
    update: {},
    create: {
      phone: '+254722100200',
      email: 'dr.kamau@daktari.co.ke',
      name: 'Dr. Brian Kamau',
      passwordHash: bcrypt.hashSync('DoctorPass123!', 10),
      role: 'DOCTOR',
      doctor: {
        create: {
          kmpdcLicenseNo: 'KMPDC/A4912/2026',
          specialty: 'General Practice & Family Medicine',
          cadre: 'Medical Practitioner',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date('2026-01-15T09:00:00Z'),
          isOnline: true,
          neighbourhood: 'Kilimani',
          address: 'Wood Avenue, Kilimani, Nairobi',
          lat: -1.2950,
          lng: 36.7865,
          rating: 4.9,
          totalConsults: 142,
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
          bio: 'MBChB (Univ. of Nairobi). 8 years experience in acute primary care, triage, and home medical interventions.',
          payoutMpesa: '+254722100200',
        },
      },
    },
  });

  // 4. Create Doctor 2 (Dr. Faith Achieng - Verified Pediatrician in Westlands)
  await prisma.user.upsert({
    where: { phone: '+254733456789' },
    update: {},
    create: {
      phone: '+254733456789',
      email: 'dr.achieng@daktari.co.ke',
      name: 'Dr. Faith Achieng',
      passwordHash: bcrypt.hashSync('DoctorPass123!', 10),
      role: 'DOCTOR',
      doctor: {
        create: {
          kmpdcLicenseNo: 'KMPDC/A6210/2026',
          specialty: 'Pediatrics & Child Health',
          cadre: 'Specialist',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date('2026-02-01T11:30:00Z'),
          isOnline: true,
          neighbourhood: 'Westlands',
          address: 'Mpaka Rd, Westlands, Nairobi',
          lat: -1.2660,
          lng: 36.8020,
          rating: 4.95,
          totalConsults: 98,
          avatarUrl: 'https://images.unsplash.com/photo-1594824813581-797e930f3f6e?w=300&auto=format&fit=crop&q=80',
          bio: 'MMed Pediatrics (Aga Khan Univ). Compassionate pediatric care and early childhood triage.',
          payoutMpesa: '+254733456789',
        },
      },
    },
  });

  // 5. Create Doctor 3 (CO. Peter Omondi - Pending Verification in South B)
  await prisma.user.upsert({
    where: { phone: '+254701987654' },
    update: {},
    create: {
      phone: '+254701987654',
      email: 'co.omondi@daktari.co.ke',
      name: 'CO. Peter Omondi',
      passwordHash: bcrypt.hashSync('DoctorPass123!', 10),
      role: 'DOCTOR',
      doctor: {
        create: {
          kmpdcLicenseNo: 'KMPDC/CO-8841/2026',
          specialty: 'Clinical Medicine & Community Health',
          cadre: 'Clinical Officer',
          verificationStatus: 'PENDING',
          isOnline: false,
          neighbourhood: 'South B',
          address: 'Kapiti Rd, South B, Nairobi',
          lat: -1.3120,
          lng: 36.8390,
          rating: 4.7,
          totalConsults: 45,
          avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
          bio: 'Diploma in Clinical Medicine & Surgery (KMTC). Field diagnostics, wound care, and immediate emergency stabilization.',
          payoutMpesa: '+254701987654',
        },
      },
    },
  });

  // 5b. Create Doctor 4 (Dr. Kevin Ndung'u - Verified GP in Ruaka Town)
  await prisma.user.upsert({
    where: { phone: '+254720112233' },
    update: {},
    create: {
      phone: '+254720112233',
      email: 'dr.ndungu@daktari.co.ke',
      name: "Dr. Kevin Ndung'u",
      passwordHash: bcrypt.hashSync('DoctorPass123!', 10),
      role: 'DOCTOR',
      doctor: {
        create: {
          kmpdcLicenseNo: 'KMPDC/A7319/2026',
          specialty: 'General Practice & Emergency Medicine',
          cadre: 'Medical Practitioner',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date('2026-02-10T08:30:00Z'),
          isOnline: true,
          neighbourhood: 'Ruaka Town / Two Rivers',
          address: 'Ruaka Square, Limuru Rd, Ruaka',
          lat: -1.2055,
          lng: 36.7785,
          rating: 4.92,
          totalConsults: 114,
          avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
          bio: 'MBChB (Kenyatta Univ). Acute ambulatory triage, trauma management, and home visit care throughout Ruaka, Rosslyn, and Banana Hill.',
          payoutMpesa: '+254720112233',
        },
      },
    },
  });

  // 5c. Create Doctor 5 (Dr. Stacy Wambui - Verified Family Physician in Rosslyn / Runda)
  await prisma.user.upsert({
    where: { phone: '+254721445566' },
    update: {},
    create: {
      phone: '+254721445566',
      email: 'dr.wambui@daktari.co.ke',
      name: 'Dr. Stacy Wambui',
      passwordHash: bcrypt.hashSync('DoctorPass123!', 10),
      role: 'DOCTOR',
      doctor: {
        create: {
          kmpdcLicenseNo: 'KMPDC/A8812/2026',
          specialty: 'Family Medicine & Maternal Health',
          cadre: 'Specialist',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date('2026-02-15T10:00:00Z'),
          isOnline: true,
          neighbourhood: 'Rosslyn / Runda Environs',
          address: 'Rosslyn Riviera Mall, Limuru Rd, Nairobi',
          lat: -1.2215,
          lng: 36.7972,
          rating: 4.98,
          totalConsults: 87,
          avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
          bio: 'MBChB (Univ. of Nairobi), MMed Family Medicine. Preventative healthcare, geriatric home visits, and prenatal triage across Northern Nairobi.',
          payoutMpesa: '+254721445566',
        },
      },
    },
  });

  // 6. Create demo Ambulance Provider — Kenya Red Cross Ambulance Service
  const provider = await prisma.ambulanceProvider.upsert({
    where: { contactPhone: '+254711000100' },
    update: {},
    create: {
      name: 'Kenya Red Cross Ambulance Service',
      contactPhone: '+254711000100',
      contactEmail: 'dispatch@redcross.or.ke',
      passwordHash: bcrypt.hashSync('AmbuPass2026!', 10),
      licenseNo: 'NTSA/AMB/KE-0042',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date('2026-01-20T08:00:00Z'),
      serviceArea: 'Nairobi & Environs',
      payoutMpesa: '+254711000100',
    },
  });

  // 7. Create two ambulance units for the demo provider
  await prisma.ambulanceUnit.upsert({
    where: { registrationNo: 'KCB 001K' },
    update: {},
    create: {
      name: 'KRCS Unit 1 — Kilimani',
      driverName: 'James Mwangi',
      driverPhone: '+254722001001',
      phone: '+254711000101',
      registrationNo: 'KCB 001K',
      vehicleType: 'advanced',
      status: 'available',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      area: 'Nairobi',
      neighbourhood: 'Kilimani',
      lat: -1.2880,
      lng: 36.7850,
      etaMinutes: 12,
      capacity: 2,
      providerId: provider.id,
    },
  });

  await prisma.ambulanceUnit.upsert({
    where: { registrationNo: 'KCB 002K' },
    update: {},
    create: {
      name: 'KRCS Unit 2 — Westlands',
      driverName: 'Grace Otieno',
      driverPhone: '+254733002002',
      phone: '+254711000102',
      registrationNo: 'KCB 002K',
      vehicleType: 'basic',
      status: 'available',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      area: 'Nairobi',
      neighbourhood: 'Westlands',
      lat: -1.2680,
      lng: 36.8030,
      etaMinutes: 18,
      capacity: 2,
      providerId: provider.id,
    },
  });

  await prisma.ambulanceUnit.upsert({
    where: { registrationNo: 'KCD 104R' },
    update: {},
    create: {
      name: 'KRCS Unit 3 — Ruaka / Two Rivers',
      driverName: 'Daniel Kuria',
      driverPhone: '+254722119900',
      phone: '+254711000104',
      registrationNo: 'KCD 104R',
      vehicleType: 'advanced',
      status: 'available',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      area: 'Ruaka & Environs',
      neighbourhood: 'Ruaka Town / Two Rivers',
      lat: -1.2050,
      lng: 36.7780,
      etaMinutes: 8,
      capacity: 2,
      providerId: provider.id,
    },
  });

  await prisma.ambulanceUnit.upsert({
    where: { registrationNo: 'KCD 105B' },
    update: {},
    create: {
      name: 'KRCS Unit 4 — Banana Hill / Ndenderu',
      driverName: 'Simon Kinyanjui',
      driverPhone: '+254723334455',
      phone: '+254711000105',
      registrationNo: 'KCD 105B',
      vehicleType: 'icu',
      status: 'available',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      area: 'Ruaka & Environs',
      neighbourhood: 'Ruaka — Banana Hill / Ndenderu',
      lat: -1.1895,
      lng: 36.7615,
      etaMinutes: 10,
      capacity: 2,
      providerId: provider.id,
    },
  });

  // 8. Create Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: 'admin-system',
        actorRole: 'ADMIN',
        actorName: 'System Bootstrap',
        action: 'SYSTEM_INITIALIZED',
        targetType: 'SYSTEM',
        targetId: 'bootstrap-01',
        details: 'Daktari Mtaani pilot environment initialized with KMPDC register constraints and ODPC audit logging.',
      },
      {
        actorId: 'admin-01',
        actorRole: 'ADMIN',
        actorName: 'Chief Medical Admin',
        action: 'DOCTOR_VERIFIED',
        targetType: 'DOCTOR',
        targetId: 'dr-kamau',
        details: 'KMPDC License KMPDC/A4912/2026 verified for Dr. Brian Kamau.',
      },
      {
        actorId: 'admin-01',
        actorRole: 'ADMIN',
        actorName: 'Chief Medical Admin',
        action: 'PROVIDER_VERIFIED',
        targetType: 'AMBULANCE_PROVIDER',
        targetId: provider.id,
        details: 'Kenya Red Cross Ambulance Service verified. NTSA license NTSA/AMB/KE-0042 confirmed. 2 units cleared for dispatch.',
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Demo AMSP login: phone=+254711000100, password=AmbuPass2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
