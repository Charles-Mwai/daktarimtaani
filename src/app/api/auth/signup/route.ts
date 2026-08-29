import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, ROLE_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role } = body;

    // DOCTOR SELF-REGISTRATION
    if (role === 'DOCTOR') {
      const {
        name,
        phone,
        email,
        password,
        kmpdcLicenseNo,
        specialty,
        cadre,
        neighbourhood,
        address,
        payoutMpesa,
        bio,
      } = body;

      if (!name || !phone || !kmpdcLicenseNo || !password || !specialty) {
        return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
      }

      // Check if phone or license already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: phone.trim() }, { email: email ? email.trim() : undefined }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this phone or email already exists' },
          { status: 400 }
        );
      }

      const existingLicense = await prisma.doctorProfile.findUnique({
        where: { kmpdcLicenseNo: kmpdcLicenseNo.trim() },
      });

      if (existingLicense) {
        return NextResponse.json(
          { error: 'This KMPDC License number is already registered on Daktari Mtaani' },
          { status: 400 }
        );
      }

      const passwordHash = hashPassword(password);

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email ? email.trim() : null,
          passwordHash,
          role: 'DOCTOR',
          doctor: {
            create: {
              kmpdcLicenseNo: kmpdcLicenseNo.trim(),
              specialty: specialty.trim(),
              cadre: cadre || 'Medical Practitioner',
              verificationStatus: 'PENDING', // Locked until admin approves
              isOnline: false,
              neighbourhood: neighbourhood || 'Kilimani',
              address: address || 'Nairobi, Kenya',
              payoutMpesa: payoutMpesa || phone,
              bio: bio || 'Licensed healthcare practitioner.',
            },
          },
        },
        include: { doctor: true },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: 'DOCTOR',
          actorName: user.name,
          action: 'DOCTOR_REGISTRATION_SUBMITTED',
          targetType: 'DOCTOR',
          targetId: user.doctor!.id,
          details: `Doctor registration submitted with KMPDC License ${kmpdcLicenseNo}. Status set to PENDING verification.`,
        },
      });

      const token = signToken({
        userId: user.id,
        role: 'DOCTOR',
        phone: user.phone,
        name: user.name,
        doctorId: user.doctor?.id,
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: 'DOCTOR',
          doctorProfile: user.doctor,
        },
      });

      res.cookies.set(ROLE_COOKIE.DOCTOR, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    return NextResponse.json({ error: 'Invalid registration role' }, { status: 400 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
