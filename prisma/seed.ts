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

  // 6. Create Initial Audit Logs
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
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
