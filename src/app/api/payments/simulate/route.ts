import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatKES } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, amountKES, phone } = body;

    const receiptNo = 'SDQ' + Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 7);
    const doctorPayout = Math.floor(amountKES * 0.8);

    const payment = await prisma.payment.upsert({
      where: { requestId },
      update: {
        status: 'completed',
        mpesaReceiptNo: receiptNo,
        paymentDate: new Date(),
        doctorPayoutAmountKES: doctorPayout,
        doctorPayoutStatus: 'paid',
      },
      create: {
        requestId,
        amountKES: amountKES || 1000,
        phone: phone || '+254700000000',
        mpesaReceiptNo: receiptNo,
        status: 'completed',
        doctorPayoutAmountKES: doctorPayout,
        doctorPayoutStatus: 'paid',
        paymentDate: new Date(),
      },
    });

    await prisma.medicalRequest.update({
      where: { id: requestId },
      data: { paidAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: 'patient',
        actorRole: 'PATIENT',
        actorName: 'Patient M-Pesa Checkout',
        action: 'PAYMENT_COMPLETED',
        targetType: 'PAYMENT',
        targetId: payment.id,
        details: `M-Pesa STK Push of ${formatKES(amountKES)} confirmed for request ${requestId}. Receipt: ${receiptNo}. Doctor escrow released.`,
      },
    });

    return NextResponse.json({ success: true, payment, receiptNo });
  } catch (error: any) {
    console.error('Simulate payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
