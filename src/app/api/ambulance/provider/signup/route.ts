import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contactPhone, contactEmail, password, licenseNo, serviceArea, payoutMpesa } = body;

    if (!name || !contactPhone || !password) {
      return NextResponse.json(
        { error: 'name, contactPhone and password are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.ambulanceProvider.findUnique({
      where: { contactPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A provider with this phone number already exists' },
        { status: 409 }
      );
    }

    const provider = await prisma.ambulanceProvider.create({
      data: {
        name,
        contactPhone,
        contactEmail: contactEmail || null,
        passwordHash: hashPassword(password),
        licenseNo: licenseNo || null,
        serviceArea: serviceArea || 'Nairobi',
        payoutMpesa: payoutMpesa || null,
        verificationStatus: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: provider.id,
        actorRole: 'AMBULANCE',
        actorName: provider.name,
        action: 'PROVIDER_REGISTERED',
        targetType: 'AMBULANCE_PROVIDER',
        targetId: provider.id,
        details: `Ambulance provider "${provider.name}" self-registered. Pending admin verification.`,
      },
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        verificationStatus: provider.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('Provider signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
