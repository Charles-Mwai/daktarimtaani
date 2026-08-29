import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { requestId, patientRating, patientComment } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'requestId required' }, { status: 400 });
    }

    const request = await prisma.medicalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const rating = Math.min(5, Math.max(1, Number(patientRating) || 5));

    const record = await prisma.rating.upsert({
      where: { requestId },
      update: { patientRating: rating, patientComment: patientComment || null },
      create: {
        requestId,
        patientRating: rating,
        patientComment: patientComment || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: request.patientId,
        actorRole: 'PATIENT',
        actorName: request.patientName,
        action: 'RATING_SUBMITTED',
        targetType: 'Rating',
        targetId: record.id,
        details: `Patient rated consultation ${rating}/5`,
      },
    });

    return NextResponse.json({ success: true, rating: record });
  } catch (error: any) {
    console.error('Submit rating error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
