import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Enriched single-request view for the patient consult flow: doctor profile,
// clinical record (with parsed prescriptions) and payment in one poll.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = await prisma.medicalRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const [doctorProfile, clinicalRecord, payment, ambulanceDispatch] = await Promise.all([
      request.assignedDoctorId
        ? prisma.doctorProfile.findUnique({
            where: { id: request.assignedDoctorId },
            include: { user: { select: { name: true, phone: true } } },
          })
        : null,
      prisma.clinicalRecord.findUnique({ where: { requestId: request.id } }),
      prisma.payment.findUnique({ where: { requestId: request.id } }),
      request.serviceType === 'ambulance'
        ? prisma.ambulanceDispatch.findUnique({
            where: { requestId: request.id },
            include: { unit: true },
          })
        : null,
    ]);

    let clinicalRecordView: Record<string, unknown> | null = null;
    if (clinicalRecord) {
      let prescriptions: unknown[] = [];
      try {
        prescriptions = JSON.parse(clinicalRecord.prescriptionsJson || '[]');
      } catch {
        prescriptions = [];
      }
      clinicalRecordView = { ...clinicalRecord, prescriptions };
    }

    const doctor = doctorProfile
      ? {
          id: doctorProfile.id,
          name: doctorProfile.user?.name ?? 'Attending Doctor',
          phone: doctorProfile.user?.phone ?? null,
          specialty: doctorProfile.specialty,
          cadre: doctorProfile.cadre,
          kmpdcLicenseNo: doctorProfile.kmpdcLicenseNo,
          rating: doctorProfile.rating,
          totalConsults: doctorProfile.totalConsults,
          avatarUrl: doctorProfile.avatarUrl,
          neighbourhood: doctorProfile.neighbourhood,
          address: doctorProfile.address,
          lat: doctorProfile.lat,
          lng: doctorProfile.lng,
        }
      : null;

    return NextResponse.json({
      request,
      doctor,
      clinicalRecord: clinicalRecordView,
      payment,
      ambulance: ambulanceDispatch
        ? {
            dispatch: ambulanceDispatch,
            unit: ambulanceDispatch.unit,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Fetch request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Visit lifecycle transitions driven by the doctor console / consult room.
const LIFECYCLE_STATUSES: Record<string, { timestampField: 'acceptedAt' | 'inTransitAt' | 'arrivedAt' | 'consultStartedAt' }> = {
  accepted: { timestampField: 'acceptedAt' },
  in_transit: { timestampField: 'inTransitAt' },
  arrived: { timestampField: 'arrivedAt' },
  consulting: { timestampField: 'consultStartedAt' },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const requestedStatus: string = body?.status;
    const existing = await prisma.medicalRequest.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (requestedStatus === 'completed') {
      const request = await prisma.medicalRequest.update({
        where: { id: params.id },
        data: {
          status: 'completed',
          consultEndedAt: existing.consultEndedAt ?? new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: existing.assignedDoctorId ?? existing.patientId,
          actorRole: 'DOCTOR',
          actorName: 'Attending Doctor',
          action: 'CONSULT_ENDED',
          targetType: 'REQUEST',
          targetId: request.id,
          details: `Teleconsultation ended for request ${request.id}.`,
        },
      });

      return NextResponse.json({ success: true, request });
    }

    // Handle lifecycle transitions (doctor-driven)
    if (requestedStatus in LIFECYCLE_STATUSES) {
      const transition = LIFECYCLE_STATUSES[requestedStatus];
      const request = await prisma.medicalRequest.update({
        where: { id: params.id },
        data: {
          status: requestedStatus,
          [transition.timestampField]: existing[transition.timestampField] ?? new Date(),
        },
      });

      if (existing.serviceType === 'ambulance') {
        const dispatch = await prisma.ambulanceDispatch.findUnique({ where: { requestId: params.id } });
        if (dispatch) {
          const nextDispatchStatus =
            requestedStatus === 'in_transit'
              ? 'en_route'
              : requestedStatus === 'arrived'
              ? 'arrived'
              : requestedStatus === 'accepted'
              ? 'assigned'
              : 'pending';

          await prisma.ambulanceDispatch.update({
            where: { id: dispatch.id },
            data: {
              status: nextDispatchStatus,
              acceptedAt: requestedStatus === 'accepted' ? new Date() : dispatch.acceptedAt,
              arrivedAt: requestedStatus === 'arrived' ? new Date() : dispatch.arrivedAt,
            },
          });

          if (requestedStatus === 'in_transit' || requestedStatus === 'arrived') {
            await prisma.ambulanceUnit.update({
              where: { id: dispatch.unitId },
              data: { status: requestedStatus === 'arrived' ? 'available' : 'in_transit' },
            });
          }
        }
      }

      const actorId = existing.assignedDoctorId ?? existing.patientId;
      const actionName =
        requestedStatus === 'arrived'
          ? 'DOCTOR_ARRIVED'
          : requestedStatus === 'in_transit'
          ? 'AMBULANCE_EN_ROUTE'
          : 'CONSULT_STARTED';

      await prisma.auditLog.create({
        data: {
          actorId,
          actorRole: existing.serviceType === 'ambulance' ? 'PATIENT' : 'DOCTOR',
          actorName: existing.serviceType === 'ambulance' ? 'Patient / Ops' : 'Attending Doctor',
          action: actionName,
          targetType: 'REQUEST',
          targetId: request.id,
          details: `Request status updated to ${requestedStatus}`,
        },
      });

      return NextResponse.json({ success: true, request });
    }

    // Handle patient cancellation
    if (requestedStatus === 'cancelled') {
      const request = await prisma.medicalRequest.update({
        where: { id: params.id },
        data: { status: 'cancelled' },
      });

      // Expire any pending dispatch offers for this request and notify dispatch engine
      const pendingOffers = await prisma.dispatchOffer.findMany({
        where: { requestId: params.id, status: 'pending' },
      });

      for (const offer of pendingOffers) {
        await prisma.dispatchOffer.update({ where: { id: offer.id }, data: { status: 'cancelled' } });
        await prisma.auditLog.create({
          data: {
            actorId: 'system-dispatch',
            actorRole: 'SYSTEM',
            actorName: 'Dispatch Engine',
            action: 'DISPATCH_EXPIRED_BY_CANCELLATION',
            targetType: 'REQUEST',
            targetId: request.id,
            details: `Dispatch offer ${offer.id} expired because patient cancelled request ${request.id}`,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          actorId: existing.patientId ?? 'anonymous',
          actorRole: 'PATIENT',
          actorName: 'Patient (self-service)',
          action: 'REQUEST_CANCELLED',
          targetType: 'REQUEST',
          targetId: request.id,
          details: `Patient cancelled request ${request.id}`,
        },
      });

      return NextResponse.json({ success: true, request });
    }

    return NextResponse.json(
      { error: 'status must be one of: arrived, consulting, cancelled' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Update request status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
