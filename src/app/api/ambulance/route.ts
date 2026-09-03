import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/utils';

// 120-second AMSP dispatch offer timeout
const AMSP_OFFER_TIMEOUT_MS = 120_000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');

    if (scope === 'operator') {
      // Return data scoped to the authenticated AMSP
      const session = getSessionFromRequest(req, 'AMBULANCE');
      if (!session?.ambulanceProviderId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const providerId = session.ambulanceProviderId;
      const [units, dispatches] = await Promise.all([
        prisma.ambulanceUnit.findMany({
          where: { providerId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.ambulanceDispatch.findMany({
          where: {
            unit: { providerId },
            OR: [{ status: 'pending' }, { status: 'assigned' }, { status: 'en_route' }, { status: 'arrived' }, { status: 'completed' }],
          },
          include: {
            request: { select: { id: true, patientName: true, patientPhone: true, status: true, serviceType: true, neighbourhood: true, address: true, severity: true, estimatedPriceKES: true, createdAt: true } },
            unit: true,
          },
          orderBy: { assignedAt: 'desc' },
        }),
      ]);
      return NextResponse.json({ units, dispatches });
    }

    // Default: admin view — all units, active dispatches, and providers
    const [units, dispatches, providers] = await Promise.all([
      prisma.ambulanceUnit.findMany({
        orderBy: { createdAt: 'desc' },
        include: { provider: { select: { id: true, name: true, verificationStatus: true } } },
      }),
      prisma.ambulanceDispatch.findMany({
        where: {
          OR: [{ status: 'assigned' }, { status: 'en_route' }, { status: 'arrived' }, { status: 'pending' }],
        },
        include: {
          request: { select: { id: true, patientName: true, patientPhone: true, status: true, serviceType: true, neighbourhood: true, address: true, severity: true, estimatedPriceKES: true, createdAt: true } },
          unit: true,
        },
        orderBy: { assignedAt: 'desc' },
      }),
      prisma.ambulanceProvider.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({ units, dispatches, providers });
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
      const normalizedVerificationStatus = String(payload.verificationStatus || 'PENDING').toUpperCase();

      const session = getSessionFromRequest(req, 'AMBULANCE');
      const providerId = payload.providerId || session?.ambulanceProviderId || null;

      const unit = await prisma.ambulanceUnit.create({
        data: {
          name: payload.name || 'Daktari Mtaani Ambulance',
          driverName: payload.driverName || 'Onboarded Driver',
          driverPhone: payload.driverPhone || null,
          phone: payload.phone || '+254700000000',
          registrationNo: payload.registrationNo || `KAA-${Date.now()}`,
          vehicleType: payload.vehicleType || 'basic',
          status: normalizedStatus,
          verificationStatus: normalizedVerificationStatus,
          isOnline: payload.isOnline !== undefined ? Boolean(payload.isOnline) : true,
          area: payload.area || 'Nairobi',
          neighbourhood: payload.neighbourhood || 'Kilimani',
          lat: Number(payload.lat ?? -1.2917),
          lng: Number(payload.lng ?? 36.7905),
          etaMinutes: Number(payload.etaMinutes ?? 15),
          capacity: Number(payload.capacity ?? 2),
          providerId,
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
          isOnline: payload.isOnline !== undefined ? Boolean(payload.isOnline) : undefined,
        },
      });

      return NextResponse.json({ success: true, unit });
    }

    if (action === 'DELETE_UNIT') {
      const { id } = payload;
      if (!id) {
        return NextResponse.json({ error: 'Ambulance unit id is required' }, { status: 400 });
      }

      // Check for active dispatches first
      const activeDispatch = await prisma.ambulanceDispatch.findFirst({
        where: {
          unitId: id,
          status: { in: ['pending', 'assigned', 'en_route', 'arrived'] },
        },
      });

      if (activeDispatch) {
        return NextResponse.json(
          { error: 'Cannot delete unit while it is assigned to an active dispatch trip.' },
          { status: 400 }
        );
      }

      await prisma.ambulanceUnit.delete({
        where: { id },
      });

      await prisma.auditLog.create({
        data: {
          actorId: 'admin',
          actorRole: 'ADMIN',
          actorName: 'Admin Console',
          action: 'UNIT_DELETED',
          targetType: 'AMBULANCE_UNIT',
          targetId: id,
          details: `Ambulance unit ${id} deleted by administrator.`,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'ASSIGN_REQUEST') {
      const { requestId, unitId, pickupAddress, dropoffAddress, emergencyLevel, estimatedEtaMinutes } = payload;

      if (!requestId || !unitId) {
        return NextResponse.json({ error: 'requestId and unitId are required' }, { status: 400 });
      }

      const now = new Date();
      const offerExpires = new Date(now.getTime() + AMSP_OFFER_TIMEOUT_MS);

      const dispatch = await prisma.ambulanceDispatch.create({
        data: {
          requestId,
          unitId,
          status: 'pending',
          pickupAddress: pickupAddress || 'Unknown pickup address',
          dropoffAddress: dropoffAddress || null,
          emergencyLevel: emergencyLevel || 'urgent',
          estimatedEtaMinutes: Number(estimatedEtaMinutes ?? 15),
          offeredAt: now,
          offerExpiresAt: offerExpires,
          ambulancePayoutKES: payload.ambulancePayoutKES || 0,
        },
      });

      await prisma.medicalRequest.update({
        where: { id: requestId },
        data: {
          status: 'dispatching',
          currentOfferId: dispatch.id,
        },
      });

      return NextResponse.json({ success: true, dispatch });
    }

    if (action === 'ACCEPT_DISPATCH') {
      const { dispatchId } = payload;
      if (!dispatchId) {
        return NextResponse.json({ error: 'dispatchId is required' }, { status: 400 });
      }

      const dispatch = await prisma.ambulanceDispatch.findUnique({
        where: { id: dispatchId },
        include: { unit: true },
      });

      if (!dispatch) {
        return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
      }

      if (dispatch.status !== 'pending') {
        return NextResponse.json({ error: `Dispatch is already ${dispatch.status}` }, { status: 400 });
      }

      if (dispatch.offerExpiresAt && new Date() > dispatch.offerExpiresAt) {
        await prisma.ambulanceDispatch.update({
          where: { id: dispatchId },
          data: { status: 'declined', declinedAt: new Date() },
        });
        return NextResponse.json({ error: 'Offer has expired' }, { status: 410 });
      }

      const [updatedDispatch] = await Promise.all([
        prisma.ambulanceDispatch.update({
          where: { id: dispatchId },
          data: { status: 'assigned', acceptedAt: new Date() },
        }),
        prisma.ambulanceUnit.update({
          where: { id: dispatch.unitId },
          data: { status: 'in_transit' },
        }),
        prisma.medicalRequest.update({
          where: { id: dispatch.requestId },
          data: { status: 'dispatching' },
        }),
        prisma.auditLog.create({
          data: {
            actorId: dispatch.unitId,
            actorRole: 'AMBULANCE',
            actorName: dispatch.unit.name,
            action: 'DISPATCH_ACCEPTED',
            targetType: 'REQUEST',
            targetId: dispatch.requestId,
            details: `Ambulance unit ${dispatch.unit.name} (${dispatch.unit.registrationNo}) accepted dispatch ${dispatchId}.`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, dispatch: updatedDispatch });
    }

    if (action === 'DECLINE_DISPATCH') {
      const { dispatchId } = payload;
      if (!dispatchId) {
        return NextResponse.json({ error: 'dispatchId is required' }, { status: 400 });
      }

      const dispatch = await prisma.ambulanceDispatch.findUnique({
        where: { id: dispatchId },
        include: { unit: { include: { provider: true } }, request: true },
      });

      if (!dispatch) {
        return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
      }

      await prisma.ambulanceDispatch.update({
        where: { id: dispatchId },
        data: { status: 'declined', declinedAt: new Date() },
      });

      const eligibleUnits = await prisma.ambulanceUnit.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          status: 'available',
          isOnline: true,
          id: { not: dispatch.unitId },
        },
      });

      if (eligibleUnits.length > 0) {
        const ranked = eligibleUnits
          .map((u) => ({
            unit: u,
            dist: calculateDistanceKm(
              { lat: dispatch.request.lat, lng: dispatch.request.lng },
              { lat: u.lat, lng: u.lng }
            ),
          }))
          .sort((a, b) => a.dist - b.dist);

        const nextUnit = ranked[0].unit;
        const now = new Date();
        await prisma.ambulanceDispatch.create({
          data: {
            requestId: dispatch.requestId,
            unitId: nextUnit.id,
            status: 'pending',
            pickupAddress: dispatch.pickupAddress,
            dropoffAddress: dispatch.dropoffAddress,
            emergencyLevel: dispatch.emergencyLevel,
            estimatedEtaMinutes: nextUnit.etaMinutes,
            offeredAt: now,
            offerExpiresAt: new Date(now.getTime() + AMSP_OFFER_TIMEOUT_MS),
            ambulancePayoutKES: dispatch.ambulancePayoutKES,
          },
        });

        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'DISPATCH_REROUTED',
            targetType: 'REQUEST',
            targetId: dispatch.requestId,
            details: `Dispatch declined by ${dispatch.unit.name}. Re-routed to ${nextUnit.name} (${nextUnit.registrationNo}).`,
          },
        });
      } else {
        await prisma.medicalRequest.update({
          where: { id: dispatch.requestId },
          data: { status: 'matching' },
        });

        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'DISPATCH_NO_UNIT_AVAILABLE',
            targetType: 'REQUEST',
            targetId: dispatch.requestId,
            details: `All ambulance units declined or unavailable for request ${dispatch.requestId}. Escalating to ops.`,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'DRIVER_UPDATE') {
      const { dispatchId, status, dispatchCode } = payload;
      if (!dispatchId || !status) {
        return NextResponse.json({ error: 'dispatchId and status are required' }, { status: 400 });
      }

      if (dispatchCode && !dispatchId.toUpperCase().endsWith(dispatchCode.toUpperCase())) {
        return NextResponse.json({ error: 'Invalid dispatch code' }, { status: 403 });
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
        en_route: 'in_transit',
        arrived: 'arrived',
        completed: 'completed',
      };

      const nextRequestStatus = requestStatusMap[normalizedStatus] ?? dispatch.request.status;

      const updatedDispatch = await prisma.ambulanceDispatch.update({
        where: { id: dispatchId },
        data: {
          status: normalizedStatus,
          arrivedAt: normalizedStatus === 'arrived' ? new Date() : dispatch.arrivedAt,
          completedAt: normalizedStatus === 'completed' ? new Date() : dispatch.completedAt,
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

    if (action === 'UPDATE_PROVIDER') {
      const { providerId, verificationStatus } = payload;
      if (!providerId) {
        return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
      }

      const provider = await prisma.ambulanceProvider.update({
        where: { id: providerId },
        data: {
          verificationStatus: verificationStatus ? String(verificationStatus).toUpperCase() : undefined,
          verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : undefined,
        },
      });

      if (verificationStatus === 'VERIFIED') {
        await prisma.ambulanceUnit.updateMany({
          where: { providerId },
          data: { verificationStatus: 'VERIFIED' },
        });
      }

      return NextResponse.json({ success: true, provider });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Ambulance API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process ambulance request' }, { status: 500 });
  }
}
