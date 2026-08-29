import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = doctors.map((d) => ({
      id: d.id,
      userId: d.userId,
      name: d.user.name,
      phone: d.user.phone,
      email: d.user.email,
      kmpdcLicenseNo: d.kmpdcLicenseNo,
      specialty: d.specialty,
      cadre: d.cadre,
      verificationStatus: d.verificationStatus,
      verifiedAt: d.verifiedAt,
      isOnline: d.isOnline,
      neighbourhood: d.neighbourhood,
      address: d.address,
      lat: d.lat,
      lng: d.lng,
      rating: d.rating,
      totalConsults: d.totalConsults,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      payoutMpesa: d.payoutMpesa,
    }));

    return NextResponse.json({ doctors: formatted });
  } catch (error: any) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { doctorId, action, isOnline, verificationStatus } = body;

    // Toggle Doctor Online / Offline
    if (action === 'TOGGLE_ONLINE') {
      const doc = await prisma.doctorProfile.update({
        where: { id: doctorId },
        data: { isOnline: Boolean(isOnline) },
        include: { user: true },
      });

      await prisma.auditLog.create({
        data: {
          actorId: doc.userId,
          actorRole: 'DOCTOR',
          actorName: doc.user.name,
          action: isOnline ? 'DOCTOR_ONLINE' : 'DOCTOR_OFFLINE',
          targetType: 'DOCTOR',
          targetId: doc.id,
          details: `Doctor ${doc.user.name} switched status to ${isOnline ? 'ONLINE' : 'OFFLINE'}.`,
        },
      });

      return NextResponse.json({ success: true, doctor: doc });
    }

    // Admin Update Doctor Verification Status
    if (action === 'UPDATE_VERIFICATION') {
      const doc = await prisma.doctorProfile.update({
        where: { id: doctorId },
        data: {
          verificationStatus,
          verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
        },
        include: { user: true },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session?.userId || 'admin',
          actorRole: session?.role || 'ADMIN',
          actorName: session?.name || 'Chief Medical Admin',
          action: 'DOCTOR_VERIFICATION_UPDATE',
          targetType: 'DOCTOR',
          targetId: doc.id,
          details: `KMPDC Licensure status for ${doc.user.name} (${doc.kmpdcLicenseNo}) updated to ${verificationStatus}.`,
        },
      });

      return NextResponse.json({ success: true, doctor: doc });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Doctor update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
