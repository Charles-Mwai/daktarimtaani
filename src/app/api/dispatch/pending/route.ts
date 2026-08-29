import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const now = new Date();

    // Find the most recent pending offer for this doctor that hasn't expired
    const offer = await prisma.dispatchOffer.findFirst({
      where: {
        doctorId,
        status: 'pending',
        expiresAt: { gt: now },
      },
      orderBy: { offeredAt: 'desc' },
    });

    if (!offer) {
      // Also check if there's an expired pending offer — auto-expire it
      const expiredOffer = await prisma.dispatchOffer.findFirst({
        where: {
          doctorId,
          status: 'pending',
          expiresAt: { lte: now },
        },
      });

      if (expiredOffer) {
        // Expire it and trigger re-dispatch
        await prisma.dispatchOffer.update({
          where: { id: expiredOffer.id },
          data: { status: 'timed_out' },
        });

        // Re-dispatch to the next available online verified doctor
        const otherDoctors = await prisma.doctorProfile.findMany({
          where: {
            isOnline: true,
            verificationStatus: 'VERIFIED',
            id: { not: doctorId },
          },
        });

        if (otherDoctors.length > 0) {
          const nextDoctor = otherDoctors[0];
          const nextOffer = await prisma.dispatchOffer.create({
            data: {
              requestId: expiredOffer.requestId,
              doctorId: nextDoctor.id,
              status: 'pending',
              expiresAt: new Date(Date.now() + 30000),
            },
          });
          await prisma.medicalRequest.update({
            where: { id: expiredOffer.requestId },
            data: { currentOfferId: nextOffer.id },
          });
        }
      }

      // If no active pending offer, check for a recently timed_out offer whose request
      // has been cancelled — return a signal so the doctor UI can show cancellation feedback.
      const recentCancelled = await prisma.dispatchOffer.findFirst({
        where: {
          doctorId,
          status: 'cancelled',
        },
        orderBy: { offeredAt: 'desc' },
      });

      if (recentCancelled) {
        const relatedRequest = await prisma.medicalRequest.findUnique({ where: { id: recentCancelled.requestId } });
        if (relatedRequest && relatedRequest.status === 'cancelled') {
          return NextResponse.json({ offer: null, request: null, cancelledOffer: true, offerId: recentCancelled.id, requestId: recentCancelled.requestId });
        }
      }

      return NextResponse.json({ offer: null, request: null });
    }

    // Fetch the associated request
    const request = await prisma.medicalRequest.findUnique({
      where: { id: offer.requestId },
    });

    const secondsRemaining = Math.max(
      0,
      Math.floor((new Date(offer.expiresAt).getTime() - Date.now()) / 1000)
    );

    return NextResponse.json({ offer, request, secondsRemaining });
  } catch (error: any) {
    console.error('Pending offer fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
