'use client';

import React, { useEffect, useState } from 'react';
import { loadState, saveState } from '@/lib/store';
import { DoctorProfile, PaymentRecord } from '@/lib/types';
import { formatKES } from '@/lib/utils';
import { DollarSign, Wallet, ArrowDownRight, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';

export default function DoctorEarningsPage() {
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const state = loadState();
    const doc = state.doctors.find((d) => d.id === state.activeDoctorId) || state.doctors[0];
    setCurrentDoctor(doc);
    setPayments(state.payments);
  }, []);

  const totalEarned = payments.reduce((acc, p) => acc + (p.doctorPayoutAmountKES || 800), 0);

  const handleWithdrawMpesa = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      alert(`M-Pesa B2C payout of ${formatKES(totalEarned)} initiated successfully to ${currentDoctor?.payoutMpesa}.`);
      setIsWithdrawing(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Doctor Earnings & M-Pesa Payouts
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Automated B2C disbursement for completed consultations.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Available Balance
          </span>
          <span className="text-3xl font-black block">{formatKES(totalEarned)}</span>
          <p className="text-[11px] text-emerald-200/80">Ready for instant M-Pesa B2C payout</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Payout Destination
          </span>
          <span className="text-lg font-bold text-slate-900 block font-mono">
            {currentDoctor?.payoutMpesa || '+254 722 100 200'}
          </span>
          <p className="text-[11px] text-emerald-700 font-medium">Safaricom M-Pesa Registered</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-center">
          <button
            onClick={handleWithdrawMpesa}
            disabled={isWithdrawing || totalEarned === 0}
            className="w-full bg-[#00b04f] hover:bg-[#008c3e] text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isWithdrawing ? 'Processing B2C...' : 'Withdraw to M-Pesa'}</span>
          </button>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Recent Consultation Payouts</h3>

        <div className="divide-y divide-slate-100 text-xs">
          {payments.length === 0 ? (
            <p className="py-8 text-center text-slate-400">No payment transactions recorded yet.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Consultation #{p.requestId}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Receipt: {p.mpesaReceiptNo || 'SDQ-DIRECT'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Gross: {formatKES(p.amountKES)} • Platform Take: {formatKES(p.amountKES * 0.2)} (20%)
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm block">
                    +{formatKES(p.doctorPayoutAmountKES || p.amountKES * 0.8)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Disbursed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
