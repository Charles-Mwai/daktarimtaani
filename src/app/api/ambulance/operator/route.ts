import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req, 'AMBULANCE');
    if (!session?.ambulanceProviderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerId = session.ambulanceProviderId;

    const [provider, units, activeDispatches, pendingDispatches] = await Promise.all([
      prisma.ambulanceProvider.findUnique({ where: { id: providerId } }),
      prisma.ambulanceUnit.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ambulanceDispatch.findMany({
        where: {
          unit: { providerId },
          status: { in: ['assigned', 'en_route', 'arrived'] },
        },
        include: {
          request: {
            select: {
              id: true,
              patientName: true,
              patientPhone: true,
              serviceType: true,
              status: true,
              severity: true,
              neighbourhood: true,
              address: true,
              estimatedPriceKES: true,
              createdAt: true,
            },
          },
          unit: true,
        },
        orderBy: { assignedAt: 'desc' },
      }),
      prisma.ambulanceDispatch.findMany({
        where: {
          unit: { providerId },
          status: 'pending',
          offerExpiresAt: { gt: new Date() },
        },
        include: {
          request: {
            select: {
              id: true,
              patientName: true,
              patientPhone: true,
              serviceType: true,
              severity: true,
              neighbourhood: true,
              address: true,
              estimatedPriceKES: true,
              createdAt: true,
            },
          },
          unit: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      provider,
      units,
      pendingDispatches,
      activeDispatches,
    });
  } catch (error: any) {
    console.error('Operator fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
