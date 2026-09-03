import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, ROLE_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactPhone, password } = body;

    if (!contactPhone || !password) {
      return NextResponse.json(
        { error: 'contactPhone and password are required' },
        { status: 400 }
      );
    }

    const provider = await prisma.ambulanceProvider.findUnique({
      where: { contactPhone },
    });

    if (!provider || !provider.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!comparePassword(password, provider.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: provider.id,
      role: 'AMBULANCE',
      phone: provider.contactPhone,
      name: provider.name,
      ambulanceProviderId: provider.id,
    });

    const response = NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        verificationStatus: provider.verificationStatus,
        serviceArea: provider.serviceArea,
      },
    });

    response.cookies.set(ROLE_COOKIE.AMBULANCE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Provider login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
