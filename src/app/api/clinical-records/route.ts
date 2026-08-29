import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'requestId required' }, { status: 400 });
    }

    const record = await prisma.clinicalRecord.findUnique({
      where: { requestId },
    });

    return NextResponse.json({ record });
  } catch (error: any) {
    console.error('Fetch clinical record error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestId,
      doctorId,
      patientId,
      chiefComplaint,
      vitalsNotes,
      clinicalImpression,
      prescriptions,
      referralRequired,
      referralFacility,
    } = body;

    const record = await prisma.clinicalRecord.upsert({
      where: { requestId },
      update: {
        vitalsNotes,
        clinicalImpression,
        prescriptionsJson: JSON.stringify(prescriptions || []),
        referralRequired: Boolean(referralRequired),
        referralFacility: referralFacility || null,
      },
      create: {
        requestId,
        doctorId,
        patientId,
        chiefComplaint: chiefComplaint || 'Clinical consultation summary',
        vitalsNotes,
        clinicalImpression: clinicalImpression || 'Acute General Evaluation',
        prescriptionsJson: JSON.stringify(prescriptions || []),
        referralRequired: Boolean(referralRequired),
        referralFacility: referralFacility || null,
      },
    });

    // Mark request completed
    await prisma.medicalRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        consultEndedAt: new Date(),
      },
    });

    // Increment doctor consult count
    await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: { totalConsults: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        actorId: doctorId,
        actorRole: 'DOCTOR',
        actorName: 'Attending Doctor',
        action: 'CLINICAL_RECORD_FINALIZED',
        targetType: 'MEDICAL_RECORD',
        targetId: record.id,
        details: `Clinical record signed and prescription issued for request ${requestId}. Data encrypted at rest per ODPC mandate.`,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Save clinical record error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
