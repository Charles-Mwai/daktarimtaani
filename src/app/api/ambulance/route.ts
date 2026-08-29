import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [units, dispatches] = await Promise.all([
      prisma.ambulanceUnit.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ambulanceDispatch.findMany({
        where: {
          OR: [{ status: 'assigned' }, { status: 'en_route' }, { status: 'arrived' }, { status: 'pending' }],
        },
        include: {
          request: {
            select: {
              id: true,
              patientName: true,
              patientPhone: true,
              status: true,
              serviceType: true,
              neighbourhood: true,
              address: true,
              severity: true,
              estimatedPriceKES: true,
              createdAt: true,
            },
          },
          unit: true,
        },
        orderBy: { assignedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ units, dispatches });
  } catch (error: any) {
    console.error('Fetch ambulance units error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === 'CREATE_UNIT' || action === 'ONBOARD') {
      const normalizedStatus = String(payload.status || 'available').toLowerCase();
      const normalizedVerificationStatus = String(payload.verificationStatus || 'VERIFIED').toUpperCase();

      const unit = await prisma.ambulanceUnit.create({
        data: {
          name: payload.name || 'Daktari Mtaani Ambulance',
          driverName: payload.driverName || 'Onboarded Driver',
          phone: payload.phone || '+254700000000',
          registrationNo: payload.registrationNo || `KAA-${Date.now()}`,
          vehicleType: payload.vehicleType || 'basic',
          status: normalizedStatus,
          verificationStatus: normalizedVerificationStatus,
          area: payload.area || 'Nairobi',
          neighbourhood: payload.neighbourhood || 'Kilimani',
          lat: Number(payload.lat ?? -1.2917),
          lng: Number(payload.lng ?? 36.7905),
          etaMinutes: Number(payload.etaMinutes ?? 15),
          capacity: Number(payload.capacity ?? 2),
        },
      });

      return NextResponse.json({ success: true, unit });
    }

    if (action === 'UPDATE_STATUS') {
      if (!payload.id) {
        return NextResponse.json({ error: 'Ambulance unit id is required' }, { status: 400 });
      }

      const unit = await prisma.ambulanceUnit.update({
        where: { id: payload.id },
        data: {
          status: payload.status ? String(payload.status).toLowerCase() : undefined,
          verificationStatus: payload.verificationStatus ? String(payload.verificationStatus).toUpperCase() : undefined,
          etaMinutes: payload.etaMinutes !== undefined ? Number(payload.etaMinutes) : undefined,
        },
      });

      return NextResponse.json({ success: true, unit });
    }

    if (action === 'ASSIGN_REQUEST') {
      const { requestId, unitId, pickupAddress, dropoffAddress, emergencyLevel, estimatedEtaMinutes } = payload;

      if (!requestId || !unitId) {
        return NextResponse.json({ error: 'requestId and unitId are required' }, { status: 400 });
      }

      const dispatch = await prisma.ambulanceDispatch.create({
        data: {
          requestId,
          unitId,
          status: 'assigned',
          pickupAddress: pickupAddress || 'Unknown pickup address',
          dropoffAddress: dropoffAddress || null,
          emergencyLevel: emergencyLevel || 'urgent',
          estimatedEtaMinutes: Number(estimatedEtaMinutes ?? 15),
        },
      });

      await prisma.medicalRequest.update({
        where: { id: requestId },
        data: {
          status: 'dispatching',
          currentOfferId: dispatch.id,
        },
      });

      await prisma.ambulanceUnit.update({
        where: { id: unitId },
        data: { status: 'in_transit' },
      });

      return NextResponse.json({ success: true, dispatch });
    }

    if (action === 'UPDATE_DISPATCH_STATUS') {
      const { dispatchId, status, arrivedAt, completedAt } = payload;
      if (!dispatchId || !status) {
        return NextResponse.json({ error: 'dispatchId and status are required' }, { status: 400 });
      }

      const dispatch = await prisma.ambulanceDispatch.findUnique({
        where: { id: dispatchId },
        include: { request: true, unit: true },
      });

      if (!dispatch) {
        return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
      }

      const normalizedStatus = String(status).toLowerCase();
      const requestStatusMap: Record<string, string> = {
        pending: 'dispatching',
        assigned: 'dispatching',
        en_route: 'in_transit',
        arrived: 'arrived',
        completed: 'completed',
        cancelled: 'cancelled',
      };

      const nextRequestStatus = requestStatusMap[normalizedStatus] ?? dispatch.request.status;

      const updatedDispatch = await prisma.ambulanceDispatch.update({
        where: { id: dispatchId },
        data: {
          status: normalizedStatus,
          arrivedAt: arrivedAt ? new Date(arrivedAt) : normalizedStatus === 'arrived' ? new Date() : undefined,
          completedAt: completedAt ? new Date(completedAt) : normalizedStatus === 'completed' ? new Date() : undefined,
        },
      });

      await prisma.medicalRequest.update({
        where: { id: dispatch.requestId },
        data: {
          status: nextRequestStatus,
          inTransitAt: normalizedStatus === 'en_route' ? new Date() : dispatch.request.inTransitAt,
          arrivedAt: normalizedStatus === 'arrived' ? new Date() : dispatch.request.arrivedAt,
          consultEndedAt: normalizedStatus === 'completed' ? new Date() : dispatch.request.consultEndedAt,
        },
      });

      await prisma.ambulanceUnit.update({
        where: { id: dispatch.unitId },
        data: {
          status:
            normalizedStatus === 'completed' || normalizedStatus === 'arrived'
              ? 'available'
              : normalizedStatus === 'en_route' || normalizedStatus === 'assigned'
              ? 'in_transit'
              : dispatch.unit.status,
        },
      });

      return NextResponse.json({ success: true, dispatch: updatedDispatch });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Ambulance API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process ambulance request' }, { status: 500 });
  }
}
