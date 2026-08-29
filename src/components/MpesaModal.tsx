'use client';

import React, { useState } from 'react';
import { formatKES } from '@/lib/utils';
import { Smartphone, CheckCircle, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface MpesaModalProps {
  requestId: string;
  amountKES: number;
  phone: string;
  onSuccess: (receiptNo: string) => void;
  onCancel: () => void;
}

export default function MpesaModal({
  requestId,
  amountKES,
  phone,
  onSuccess,
  onCancel,
}: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(phone || '0712345678');
  const [step, setStep] = useState<'prompt' | 'stk_sent' | 'pin_entry' | 'processing' | 'success' | 'error'>('prompt');
  const [pin, setPin] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [error, setError] = useState('');

  const handleSendSTK = () => {
    setStep('stk_sent');
    setTimeout(() => {
      setStep('pin_entry');
    }, 1200);
  };

  const handleConfirmPin = async () => {
    setStep('processing');
    try {
      const res = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, amountKES, phone: phoneNumber }),
      });
      if (!res.ok) throw new Error(`Payment failed (${res.status})`);
      const data = await res.json();
      setReceiptNo(data.receiptNo);
      setStep('success');
      setTimeout(() => {
        onSuccess(data.receiptNo);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment could not be processed. Try again.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100">
        {/* M-Pesa Header */}
        <div className="bg-[#00b04f] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00b04f] font-black text-sm">
              M
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Lipa na M-PESA</h3>
              <p className="text-[11px] text-emerald-100">Online STK Push Checkout</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-100 block">Amount</span>
            <span className="font-extrabold text-base">{formatKES(amountKES)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {step === 'prompt' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Pay with M-PESA
                </p>
                <p className="text-xs text-slate-500">
                  An instant prompt will be sent to your Safaricom phone to authorize payment.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">🇰🇪 +254</span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="712345678"
                    className="w-full pl-20 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Escrow Guarantee: Doctor only receives fee upon satisfactory completion of your consultation.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onCancel}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSTK}
                  className="w-2/3 py-2.5 bg-[#00b04f] hover:bg-[#008c3e] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <span>Send STK Push</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'stk_sent' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#00b04f] animate-spin mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Sending STK Push to phone...</h4>
              <p className="text-xs text-slate-500">Communicating with Safaricom Daraja Gateway</p>
            </div>
          )}

          {step === 'pin_entry' && (
            <div className="space-y-4">
              {/* Phone popup simulation banner */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-700 shadow-inner font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1">
                  <span>SAFARICOM SIM TOOLKIT</span>
                  <span>100% SECURE</span>
                </div>
                <p className="text-emerald-400 font-bold">
                  Do you want to pay {formatKES(amountKES)} to DAKTARI MTAANI (Paybill 889900)?
                </p>
                <div className="pt-2">
                  <label className="text-[11px] text-slate-300 block mb-1">Enter 4-Digit M-Pesa PIN:</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg px-3 py-1.5 text-center tracking-widest text-base font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    autoFocus
                  />
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                (Interactive test mode: Enter any 4-digit PIN e.g. <code>1234</code> to simulate live payment)
              </p>

              <button
                onClick={handleConfirmPin}
                disabled={pin.length < 4}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                  pin.length >= 4
                    ? 'bg-[#00b04f] hover:bg-[#008c3e] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Authorize Payment
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#00b04f] animate-spin mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Confirming payment...</h4>
              <p className="text-xs text-slate-500">Securing transaction & releasing doctor escrow</p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 rotate-180" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Payment Failed</h4>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setStep('pin_entry');
                }}
                className="text-xs font-bold text-[#008c3e] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Payment Confirmed!</h4>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                <p>Receipt: <strong className="text-emerald-700">{receiptNo}</strong></p>
                <p>Paid: {formatKES(amountKES)} via M-Pesa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
