import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, ROLE_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check each role cookie in priority order.
    // This approach returns the session matching the CURRENT PORTAL's cookie —
    // determined by reading cookies from the request directly (not next/headers)
    // so each browser tab sees only its own portal's session.
    const rolePriority: Array<keyof typeof ROLE_COOKIE> = ['PATIENT', 'DOCTOR', 'ADMIN'];

    // The caller can pass ?role=PATIENT|DOCTOR|ADMIN to force a specific lookup
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get('role')?.toUpperCase() as keyof typeof ROLE_COOKIE | null;

    let session = null;

    if (requestedRole && ROLE_COOKIE[requestedRole]) {
      const token = req.cookies.get(ROLE_COOKIE[requestedRole])?.value;
      if (token) session = verifyToken(token);
    } else {
      // Auto-detect: return whichever role cookie is present
      for (const role of rolePriority) {
        const token = req.cookies.get(ROLE_COOKIE[role])?.value;
        if (token) {
          const parsed = verifyToken(token);
          if (parsed) {
            session = parsed;
            break;
          }
        }
      }
    }

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        doctorProfile: user.doctor,
        patientProfile: user.patient,
      },
    });
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
