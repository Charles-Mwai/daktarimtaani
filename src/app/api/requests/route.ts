import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistanceKm } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const where: any = {};
    if (doctorId) where.assignedDoctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const requests = await prisma.medicalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // If a doctorId was provided, also include any requests that currently have
    // a pending dispatch offer targeted at this doctor (so they immediately
    // see inbound offers in their dashboard without relying on a separate
    // pending endpoint).
    if (doctorId) {
      const now = new Date();
      const pendingOffers = await prisma.dispatchOffer.findMany({
        where: {
          doctorId,
          status: 'pending',
          expiresAt: { gt: now },
        },
      });

      if (pendingOffers.length > 0) {
        const pendingRequestIds = pendingOffers.map((o) => o.requestId);
        const pendingRequests = await prisma.medicalRequest.findMany({
          where: { id: { in: pendingRequestIds } },
        });

        // Prepend any pending requests that aren't already in the main list
        const existingIds = new Set(requests.map((r) => r.id));
        for (const pr of pendingRequests) {
          if (!existingIds.has(pr.id)) requests.unshift(pr);
        }
      }
    }

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      patientName,
      patientPhone,
      serviceType,
      symptomsSummary,
      symptomsTags,
      severity,
      neighbourhood,
      address,
      lat,
      lng,
      estimatedPriceKES,
      dropoffAddress,
    } = body;

    const request = await prisma.medicalRequest.create({
      data: {
        patientId: patientId || 'guest-patient',
        patientName: patientName || 'Patient',
        patientPhone: patientPhone || '+254700000000',
        serviceType: serviceType || 'teleconsult',
        symptomsSummary: symptomsSummary || 'General clinical consultation',
        symptomsTags: JSON.stringify(symptomsTags || ['General']),
        severity: severity || 'mild',
        neighbourhood: neighbourhood || 'Kilimani',
        address: address || 'Nairobi, Kenya',
        lat: lat || -1.2917,
        lng: lng || 36.7905,
        estimatedPriceKES: estimatedPriceKES || (serviceType === 'home_visit' ? 2500 : 1000),
        status: 'matching',
      },
    });

    if (serviceType === 'ambulance') {
      const eligibleUnits = await prisma.ambulanceUnit.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          status: 'available',
          isOnline: true,
        },
      });

      if (eligibleUnits.length > 0) {
        const ranked = eligibleUnits
          .map((unit) => ({
            unit,
            dist: calculateDistanceKm(
              { lat: request.lat, lng: request.lng },
              { lat: unit.lat, lng: unit.lng }
            ),
          }))
          .sort((a, b) => a.dist - b.dist);

        const selectedUnit = ranked[0].unit;
        const now = new Date();
        const offerExpires = new Date(now.getTime() + 120_000);
        const payoutKES = Math.round((estimatedPriceKES || 4200) * 0.8);

        const dispatch = await prisma.ambulanceDispatch.create({
          data: {
            requestId: request.id,
            unitId: selectedUnit.id,
            status: 'pending',
            pickupAddress: address || request.address,
            dropoffAddress: dropoffAddress || null,
            emergencyLevel: severity === 'urgent' || severity === 'moderate' ? 'urgent' : 'routine',
            estimatedEtaMinutes: Math.max(5, Number(selectedUnit.etaMinutes || 15)),
            offeredAt: now,
            offerExpiresAt: offerExpires,
            ambulancePayoutKES: payoutKES,
          },
        });

        await prisma.medicalRequest.update({
          where: { id: request.id },
          data: {
            status: 'dispatching',
            currentOfferId: dispatch.id,
          },
        });

        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'AMBULANCE_OFFER_SENT',
            targetType: 'REQUEST',
            targetId: request.id,
            details: `Sent 120s dispatch offer to ${selectedUnit.name} (${selectedUnit.registrationNo}) for request ${request.id}. ETA ${Math.max(5, Number(selectedUnit.etaMinutes || 15))} min. Payout KES ${payoutKES}.`,
          },
        });
      } else {
        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'AMBULANCE_DISPATCH_NO_UNIT',
            targetType: 'REQUEST',
            targetId: request.id,
            details: `No verified online ambulance unit available for request ${request.id} in ${request.neighbourhood}.`,
          },
        });
      }

      return NextResponse.json({ success: true, request });
    }

    // Run Dispatch Engine: Find online verified doctors
    const onlineDoctors = await prisma.doctorProfile.findMany({
      where: {
        isOnline: true,
        verificationStatus: 'VERIFIED',
      },
      include: { user: true },
    });

    if (onlineDoctors.length > 0) {
      // Rank by proximity & rating
      const ranked = onlineDoctors.map((doc) => {
        const dist = calculateDistanceKm(
          { lat: request.lat, lng: request.lng },
          { lat: doc.lat, lng: doc.lng }
        );
        return {
          doc,
          dist,
          score: doc.rating * 20 - dist * 2,
        };
      });

      ranked.sort((a, b) => b.score - a.score);
      const targetDoctor = ranked[0].doc;

      // Create dispatch offer with configurable SLA (useful for testing)
      const slaMs = Number(process.env.DISPATCH_SLA_MS) || 30000;
      const offer = await prisma.dispatchOffer.create({
        data: {
          requestId: request.id,
          doctorId: targetDoctor.id,
          status: 'pending',
          expiresAt: new Date(Date.now() + slaMs),
        },
      });

      await prisma.medicalRequest.update({
        where: { id: request.id },
        data: { currentOfferId: offer.id },
      });

      await prisma.auditLog.create({
        data: {
          actorId: 'system-dispatch',
          actorRole: 'SYSTEM',
          actorName: 'Dispatch Engine',
          action: 'DISPATCH_OFFER_SENT',
          targetType: 'REQUEST',
          targetId: request.id,
          details: `Offered request ${request.id} to ${targetDoctor.user.name} (${targetDoctor.kmpdcLicenseNo}) in ${targetDoctor.neighbourhood}. SLA timer started (${slaMs}ms).`,
        },
      });
    } else {
      await prisma.auditLog.create({
        data: {
          actorId: 'system-dispatch',
          actorRole: 'SYSTEM',
          actorName: 'Dispatch Engine',
          action: 'DISPATCH_NO_DOCTOR',
          targetType: 'REQUEST',
          targetId: request.id,
          details: `No online verified doctors available in ${request.neighbourhood} for request ${request.id}. Escalated to ops console.`,
        },
      });
    }

    return NextResponse.json({ success: true, request });
  } catch (error: any) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
