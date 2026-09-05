'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  const [dropoffAddress, setDropoffAddress] = useState('');
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
          dropoffAddress: serviceType === 'ambulance' ? (dropoffAddress.trim() || null) : undefined,
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
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-y-3 px-4 sm:px-6 md:px-10 py-5 border-b border-black/[0.06]">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display font-bold text-[22px] text-canopy">
            Daktari Mtaani
          </span>
          <span className="w-[7px] h-[7px] rounded-full bg-murram mb-[3px]" />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm">
          <Link href="/patient/records" className="text-ink/70 hover:text-canopy">
            My records
          </Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-[1.85rem] sm:text-[2rem] md:text-[2.5rem] text-canopy leading-[1.1]">
            Request a doctor
          </h1>
          <p className="text-[17px] text-ink/75 max-w-lg leading-relaxed">
            Tell us what you need and where you are. We'll match you with a verified KMPDC doctor.
          </p>
        </div>

        <form onSubmit={handleCreateRequest} className="space-y-6">
          {/* 1. Care Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-canopy">
              What do you need?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setServiceType('teleconsult')}
                className={`min-h-36 p-5 sm:p-6 rounded-2xl border-2 text-left transition flex flex-col ${
                  serviceType === 'teleconsult'
                    ? 'border-leaf bg-canopy/5 shadow-sm'
                    : 'border-black/10 hover:border-black/20 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${serviceType === 'teleconsult' ? 'bg-leaf text-white' : 'bg-ink/5 text-ink/60'}`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-lg text-canopy">{formatKES(PRICING.teleconsult.basePriceKES)}</span>
                </div>
                <h4 className="font-semibold text-ink mt-auto">Video call</h4>
                <p className="text-[13px] text-ink/60 mt-1">{PRICING.teleconsult.targetSLA}</p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('home_visit')}
                className={`p-6 rounded-2xl border-2 text-left transition flex flex-col ${
                  serviceType === 'home_visit'
                    ? 'border-leaf bg-canopy/5 shadow-sm'
                    : 'border-black/10 hover:border-black/20 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${serviceType === 'home_visit' ? 'bg-leaf text-white' : 'bg-ink/5 text-ink/60'}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-lg text-canopy">{formatKES(PRICING.home_visit.basePriceKES)}</span>
                </div>
                <h4 className="font-semibold text-ink mt-auto">Home visit</h4>
                <p className="text-[13px] text-ink/60 mt-1">{PRICING.home_visit.targetSLA}</p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('ambulance')}
                className={`p-6 rounded-2xl border-2 text-left transition flex flex-col ${
                  serviceType === 'ambulance'
                    ? 'border-murram bg-murram/10 shadow-sm'
                    : 'border-black/10 hover:border-black/20 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${serviceType === 'ambulance' ? 'bg-murram text-white' : 'bg-ink/5 text-ink/60'}`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-lg text-murram">{formatKES(PRICING.ambulance.basePriceKES)}</span>
                </div>
                <h4 className="font-semibold text-ink mt-auto">Ambulance</h4>
                <p className="text-[13px] text-ink/60 mt-1">{PRICING.ambulance.targetSLA}</p>
              </button>
            </div>
          </div>

          {/* 2. Symptoms */}
          <div className="space-y-3 pt-4 border-t border-black/10">
            <label className="text-sm font-semibold text-canopy">
              What's bothering you? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.label);
                return (
                  <button
                    type="button"
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.label)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                      isSelected
                        ? 'bg-leaf text-white border-leaf shadow-sm'
                        : 'bg-white text-ink border-black/10 hover:border-black/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                    {sym.label}
                  </button>
                );
              })}
            </div>

            {/* Detailed Symptoms Textarea */}
            <div>
              <label className="block text-sm font-medium text-ink/75 mb-2">
                Describe in your own words:
              </label>
              <textarea
                rows={3}
                value={symptomsSummary}
                onChange={(e) => setSymptomsSummary(e.target.value)}
                placeholder="e.g. Mild headache and fatigue for 2 days, fever at 38°C..."
                className="w-full text-sm p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-leaf text-ink placeholder-ink/40 bg-white"
              />
            </div>

            {/* Urgency selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-ink/75">
                How urgent?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('mild')}
                    className={`min-h-11 py-3 px-3 rounded-lg font-medium text-sm transition border ${
                    severity === 'mild'
                      ? 'bg-leaf/10 border-leaf text-leaf'
                      : 'bg-white border-black/10 text-ink/70 hover:border-black/20'
                  }`}
                >
                  Mild
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('moderate')}
                    className={`min-h-11 py-3 px-3 rounded-lg font-medium text-sm transition border ${
                    severity === 'moderate'
                      ? 'bg-murram/10 border-murram text-murram'
                      : 'bg-white border-black/10 text-ink/70 hover:border-black/20'
                  }`}
                >
                  Moderate
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('urgent')}
                    className={`min-h-11 py-3 px-3 rounded-lg font-medium text-sm transition border ${
                    severity === 'urgent'
                      ? 'bg-murram/20 border-murram text-canopy'
                      : 'bg-white border-black/10 text-ink/70 hover:border-black/20'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>
          </div>

          {/* 3. Location Picker */}
          <div className="space-y-3 pt-4 border-t border-black/10">
            <label className="text-sm font-semibold text-canopy">
              Where are you? (Nairobi Pilot Area)
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              {NAIROBI_NEIGHBOURHOODS.map((loc, idx) => {
                const isSelected = selectedLocation.neighbourhood === loc.neighbourhood;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedLocation(loc)}
                    className={`min-h-20 p-4 rounded-xl border-2 text-left text-sm transition ${
                      isSelected
                        ? 'border-leaf bg-canopy/5 font-medium text-canopy'
                        : 'border-black/10 hover:border-black/20 text-ink/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-leaf' : 'text-ink/40'}`} />
                      <div>
                        <div className="font-semibold">{loc.neighbourhood}</div>
                        <div className="text-xs text-ink/50 font-normal mt-0.5">{loc.address}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom address */}
            <div>
              <label className="block text-sm font-medium text-ink/75 mb-2">
                Building or flat number:
              </label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="e.g. Green Valley Apts, Block B, Flat 4"
                className="w-full text-sm p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-leaf text-ink placeholder-ink/40 bg-white"
              />
            </div>

            {/* Ambulance-only: dropoff destination */}
            {serviceType === 'ambulance' && (
              <div className="space-y-2 p-4 rounded-xl bg-murram/5 border border-murram/20">
                <label className="block text-sm font-medium text-ink/75">
                  Hospital or clinic destination (optional):
                </label>
                <input
                  type="text"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder="e.g. Aga Khan Hospital, 3rd Parklands Ave"
                  className="w-full text-sm p-3 rounded-lg border border-murram/30 focus:outline-none focus:ring-2 focus:ring-murram focus:border-murram text-ink placeholder-ink/40 bg-white"
                />
                <p className="text-xs text-ink/50">Leave blank if you haven't decided yet.</p>
              </div>
            )}
          </div>

          {/* Summary & CTA */}
          <div className="pt-6 border-t border-black/10 space-y-4">
            <div className={`rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              serviceType === 'ambulance'
                ? 'bg-murram/10 border border-murram/30'
                : 'bg-canopy/5 border border-leaf/30'
            }`}>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
                  serviceType === 'ambulance' ? 'text-murram' : 'text-leaf'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>M-Pesa payment</span>
                </div>
                <p className="text-sm text-ink/75">
                  Total cost:{' '}
                  <span className={`font-display font-bold text-lg ${
                    serviceType === 'ambulance' ? 'text-murram' : 'text-canopy'
                  }`}>
                    {formatKES(priceConfig.basePriceKES)}
                  </span>
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`min-h-11 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition active:scale-95 ${
                  serviceType === 'ambulance'
                    ? 'bg-murram text-white hover:bg-murram/90'
                    : 'bg-leaf text-white hover:bg-canopy'
                }`}
              >
                {isSubmitting
                  ? serviceType === 'ambulance'
                    ? 'Dispatching...'
                    : 'Matching doctor...'
                  : serviceType === 'ambulance'
                  ? 'Request Ambulance'
                  : 'Find Doctor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientRequestPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-ink/50">Loading consultation triage...</div>}>
      <PatientRequestContent />
    </Suspense>
  );
}
