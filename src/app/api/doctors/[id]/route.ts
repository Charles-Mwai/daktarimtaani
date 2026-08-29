import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error: any) {
    console.error('Fetch doctor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
