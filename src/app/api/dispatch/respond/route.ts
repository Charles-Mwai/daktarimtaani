import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId, response } = body; // response: 'accepted' | 'declined' | 'timed_out'

    const offer = await prisma.dispatchOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    await prisma.dispatchOffer.update({
      where: { id: offerId },
      data: { status: response },
    });

    const request = await prisma.medicalRequest.findUnique({
      where: { id: offer.requestId },
    });

    if (!request) {
      return NextResponse.json({ error: 'Associated request not found' }, { status: 404 });
    }

    if (response === 'accepted') {
      const nextStatus = request.serviceType === 'home_visit' ? 'in_transit' : 'accepted';
      const updatedRequest = await prisma.medicalRequest.update({
        where: { id: request.id },
        data: {
          status: nextStatus,
          assignedDoctorId: offer.doctorId,
          acceptedAt: new Date(),
          inTransitAt: request.serviceType === 'home_visit' ? new Date() : null,
        },
      });

      const doctor = await prisma.doctorProfile.findUnique({
        where: { id: offer.doctorId },
        include: { user: true },
      });

      await prisma.auditLog.create({
        data: {
          actorId: offer.doctorId,
          actorRole: 'DOCTOR',
          actorName: doctor?.user.name || 'Doctor',
          action: 'DISPATCH_ACCEPTED',
          targetType: 'REQUEST',
          targetId: request.id,
          details: `Doctor ${doctor?.user.name} accepted request ${request.id}. Status updated to ${nextStatus}.`,
        },
      });

      return NextResponse.json({ success: true, request: updatedRequest });
    } else {
      // Re-route to alternative online doctor
      const otherDoctors = await prisma.doctorProfile.findMany({
        where: {
          isOnline: true,
          verificationStatus: 'VERIFIED',
          id: { not: offer.doctorId },
        },
        include: { user: true },
      });

      if (otherDoctors.length > 0) {
        const nextDoctor = otherDoctors[0];
          const slaMs = Number(process.env.DISPATCH_SLA_MS) || 30000;
          const nextOffer = await prisma.dispatchOffer.create({
            data: {
              requestId: request.id,
              doctorId: nextDoctor.id,
              status: 'pending',
              expiresAt: new Date(Date.now() + slaMs),
            },
          });

        await prisma.medicalRequest.update({
          where: { id: request.id },
          data: { currentOfferId: nextOffer.id },
        });

        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'DISPATCH_REASSIGNED',
            targetType: 'REQUEST',
            targetId: request.id,
            details: `Offer ${offerId} was ${response}. Auto-reassigned request to ${nextDoctor.user.name}. SLA ${slaMs}ms.`,
          },
        });
      }

      return NextResponse.json({ success: true, reassigned: otherDoctors.length > 0 });
    }
  } catch (error: any) {
    console.error('Respond to dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
