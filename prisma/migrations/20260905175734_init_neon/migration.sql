-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "neighbourhood" TEXT NOT NULL DEFAULT 'Kilimani',
    "address" TEXT NOT NULL DEFAULT 'Argwings Kodhek Rd, Kilimani, Nairobi',
    "lat" DOUBLE PRECISION NOT NULL DEFAULT -1.2917,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 36.7905,
    "emergencyPhone" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kmpdcLicenseNo" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "cadre" TEXT NOT NULL DEFAULT 'Medical Practitioner',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "neighbourhood" TEXT NOT NULL DEFAULT 'Kilimani',
    "address" TEXT NOT NULL DEFAULT 'Wood Avenue, Kilimani, Nairobi',
    "lat" DOUBLE PRECISION NOT NULL DEFAULT -1.2950,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 36.7865,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalConsults" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    "bio" TEXT NOT NULL DEFAULT 'Licensed practitioner registered with KMPDC.',
    "payoutMpesa" TEXT NOT NULL DEFAULT '+254 700 000 000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRequest" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "symptomsSummary" TEXT NOT NULL,
    "symptomsTags" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'mild',
    "neighbourhood" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "estimatedPriceKES" INTEGER NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'matching',
    "assignedDoctorId" TEXT,
    "currentOfferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "inTransitAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "consultStartedAt" TIMESTAMP(3),
    "consultEndedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "MedicalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbulanceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "passwordHash" TEXT,
    "licenseNo" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "serviceArea" TEXT NOT NULL DEFAULT 'Nairobi',
    "logoUrl" TEXT,
    "payoutMpesa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbulanceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbulanceUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "phone" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'basic',
    "status" TEXT NOT NULL DEFAULT 'available',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "area" TEXT NOT NULL,
    "neighbourhood" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "etaMinutes" INTEGER NOT NULL DEFAULT 15,
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbulanceUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbulanceDispatch" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pickupAddress" TEXT NOT NULL,
    "dropoffAddress" TEXT,
    "emergencyLevel" TEXT NOT NULL DEFAULT 'urgent',
    "estimatedEtaMinutes" INTEGER NOT NULL DEFAULT 15,
    "offeredAt" TIMESTAMP(3),
    "offerExpiresAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "ambulancePayoutKES" INTEGER NOT NULL DEFAULT 0,
    "ambulancePayoutStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbulanceDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchOffer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalRecord" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "chiefComplaint" TEXT NOT NULL,
    "vitalsNotes" TEXT,
    "clinicalImpression" TEXT NOT NULL,
    "prescriptionsJson" TEXT NOT NULL,
    "referralRequired" BOOLEAN NOT NULL DEFAULT false,
    "referralFacility" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "amountKES" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "mpesaReceiptNo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "doctorPayoutAmountKES" INTEGER NOT NULL,
    "doctorPayoutStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "patientRating" INTEGER NOT NULL DEFAULT 5,
    "patientComment" TEXT,
    "doctorRating" INTEGER DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_kmpdcLicenseNo_key" ON "DoctorProfile"("kmpdcLicenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "AmbulanceProvider_contactPhone_key" ON "AmbulanceProvider"("contactPhone");

-- CreateIndex
CREATE UNIQUE INDEX "AmbulanceUnit_registrationNo_key" ON "AmbulanceUnit"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "AmbulanceDispatch_requestId_key" ON "AmbulanceDispatch"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalRecord_requestId_key" ON "ClinicalRecord"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_requestId_key" ON "Payment"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_requestId_key" ON "Rating"("requestId");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbulanceUnit" ADD CONSTRAINT "AmbulanceUnit_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AmbulanceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbulanceDispatch" ADD CONSTRAINT "AmbulanceDispatch_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MedicalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbulanceDispatch" ADD CONSTRAINT "AmbulanceDispatch_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "AmbulanceUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
