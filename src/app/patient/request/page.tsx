'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Video,
  Home,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Check,
  Car,
} from 'lucide-react';
import { COMMON_SYMPTOMS, NAIROBI_NEIGHBOURHOODS, PRICING } from '@/lib/constants';
import { formatKES } from '@/lib/utils';
import { ServiceType } from '@/lib/types';

function PatientRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = (searchParams.get('service') as ServiceType) || 'teleconsult';

  const [serviceType, setServiceType] = useState<ServiceType>(initialService);
  const [selectedLocation, setSelectedLocation] = useState(NAIROBI_NEIGHBOURHOODS[0]);
  const [customAddress, setCustomAddress] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomsSummary, setSymptomsSummary] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'urgent'>('mild');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSymptom = (label: string) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsSummary.trim() && selectedSymptoms.length === 0) {
      alert('Please select or describe your symptoms before proceeding.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current patient session
      const sessionRes = await fetch('/api/auth/me?role=PATIENT');
      const sessionData = await sessionRes.json();
      const user = sessionData.user;

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user?.patientProfile?.id || null,
          patientName: user?.name || 'Patient',
          patientPhone: user?.phone || '+254700000000',
          serviceType,
          symptomsSummary:
            symptomsSummary.trim() ||
            `Patient reported symptoms: ${selectedSymptoms.join(', ')}`,
          symptomsTags: selectedSymptoms.length > 0 ? selectedSymptoms : ['General Assessment'],
          severity,
          neighbourhood: selectedLocation.neighbourhood,
          address: customAddress.trim() || selectedLocation.address,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          estimatedPriceKES:
            serviceType === 'home_visit'
              ? PRICING.home_visit.basePriceKES
              : serviceType === 'ambulance'
              ? PRICING.ambulance.basePriceKES
              : PRICING.teleconsult.basePriceKES,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert('Failed to submit request. Please try again.');
        return;
      }

      router.push(`/patient/request/${data.request.id}`);
    } catch (err) {
      console.error('Request creation error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceConfig = PRICING[serviceType];

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Request Medical Consultation
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Complete the quick clinical triage below to get matched with a verified doctor.
        </p>
      </div>

      <form onSubmit={handleCreateRequest} className="space-y-6">
        {/* 1. Care Mode Selection */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            1. Select Care Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setServiceType('teleconsult')}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                serviceType === 'teleconsult'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${serviceType === 'teleconsult' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">{formatKES(PRICING.teleconsult.basePriceKES)}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Teleconsultation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant in-browser video call ({PRICING.teleconsult.targetSLA})</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setServiceType('home_visit')}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                serviceType === 'home_visit'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${serviceType === 'home_visit' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">{formatKES(PRICING.home_visit.basePriceKES)}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Home Visit</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Doctor arrives at your address ({PRICING.home_visit.targetSLA})</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setServiceType('ambulance')}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                serviceType === 'ambulance'
                  ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-1 ring-amber-400'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${serviceType === 'ambulance' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">{formatKES(PRICING.ambulance.basePriceKES)}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Ambulance</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Patient transfer to clinic or hospital ({PRICING.ambulance.targetSLA})</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Structured Triage & Symptoms */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Clinical Triage & Symptoms
            </label>
            <span className="text-[11px] text-emerald-700 font-medium">Select all that apply</span>
          </div>

          {/* Quick Symptom Chips */}
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.label);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{sym.label}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Symptoms Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Describe what you are feeling in your own words:
            </label>
            <textarea
              rows={3}
              value={symptomsSummary}
              onChange={(e) => setSymptomsSummary(e.target.value)}
              placeholder="e.g. Mild headache and fatigue for 2 days, took paracetamol but fever persists at 38°C..."
              className="w-full text-xs md:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>

          {/* Severity selector */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Urgency Assessment:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSeverity('mild')}
                className={`py-2 px-3 rounded-xl font-semibold border transition text-center ${
                  severity === 'mild'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mild / Non-Urgent
              </button>

              <button
                type="button"
                onClick={() => setSeverity('moderate')}
                className={`py-2 px-3 rounded-xl font-semibold border transition text-center ${
                  severity === 'moderate'
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Moderate Discomfort
              </button>

              <button
                type="button"
                onClick={() => setSeverity('urgent')}
                className={`py-2 px-3 rounded-xl font-semibold border transition text-center ${
                  severity === 'urgent'
                    ? 'bg-rose-100 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Urgent Attention
              </button>
            </div>
          </div>
        </div>

        {/* 3. Location Picker */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            3. Patient Location (Nairobi Pilot Area)
          </label>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {NAIROBI_NEIGHBOURHOODS.map((loc, idx) => {
              const isSelected = selectedLocation.neighbourhood === loc.neighbourhood;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-start gap-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 font-semibold text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold">{loc.neighbourhood}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{loc.address}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Building, House / Apt Number or Landmark:
            </label>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="e.g. Green Valley Apts, Block B, Flat 4"
              className="w-full text-xs md:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Price & Guarantee Summary */}
        <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>M-Pesa Escrow Protection</span>
            </div>
            <p className="text-xs text-emerald-100">
              Total consultation fee: <strong className="text-lg text-white font-extrabold">{formatKES(priceConfig.basePriceKES)}</strong>
            </p>
            <p className="text-[11px] text-emerald-200/80">
              Target response: {priceConfig.targetSLA} • Verified KMPDC Practitioner
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <span>{isSubmitting ? 'Matching Doctor...' : 'Request Doctor Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PatientRequestPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading consultation triage...</div>}>
      <PatientRequestContent />
    </Suspense>
  );
}
