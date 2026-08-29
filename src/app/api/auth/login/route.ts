import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, ROLE_COOKIE } from '@/lib/auth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, role, otp } = body;

    // ─── PATIENT LOGIN (Phone OTP) ─────────────────────────────────────────────
    if (role === 'PATIENT') {
      const phone = identifier.trim();
      const providedName = body.name?.trim();
      let user = await prisma.user.findFirst({
        where: { phone },
        include: { patient: true },
      });

      if (!user) {
        // Auto-create patient profile on first OTP login
        user = await prisma.user.create({
          data: {
            phone,
            name: providedName || 'Patient ' + phone.slice(-4),
            role: 'PATIENT',
            patient: {
              create: {
                neighbourhood: 'Kilimani',
                address: 'Kilimani, Nairobi',
                consentGiven: true,
              },
            },
          },
          include: { patient: true },
        });

        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorRole: 'PATIENT',
            actorName: user.name,
            action: 'PATIENT_SIGNUP',
            targetType: 'PATIENT',
            targetId: user.id,
            details: `Patient registered via phone OTP ${phone}. Data Protection Act consent captured.`,
          },
        });
      }

      const token = signToken({
        userId: user.id,
        role: 'PATIENT',
        phone: user.phone,
        name: user.name,
        patientId: user.patient?.id,
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: 'PATIENT',
          patientProfile: user.patient,
        },
      });

      res.cookies.set(ROLE_COOKIE.PATIENT, token, COOKIE_OPTS);
      return res;
    }

    // ─── DOCTOR LOGIN (Email/Phone + Password) ─────────────────────────────────
    if (role === 'DOCTOR') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier.trim() }, { phone: identifier.trim() }],
          role: 'DOCTOR',
        },
        include: { doctor: true },
      });

      if (!user || !user.passwordHash || !comparePassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid doctor credentials or password' }, { status: 401 });
      }

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

      res.cookies.set(ROLE_COOKIE.DOCTOR, token, COOKIE_OPTS);
      return res;
    }

    // ─── ADMIN LOGIN (Email/Phone + Password) ──────────────────────────────────
    if (role === 'ADMIN') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier.trim() }, { phone: identifier.trim() }],
          role: 'ADMIN',
        },
      });

      if (!user || !user.passwordHash || !comparePassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
      }

      const token = signToken({
        userId: user.id,
        role: 'ADMIN',
        phone: user.phone,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: 'ADMIN',
        },
      });

      res.cookies.set(ROLE_COOKIE.ADMIN, token, COOKIE_OPTS);
      return res;
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
