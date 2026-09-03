'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Ambulance, CheckCircle2, Clock3, MapPin, Phone, Plus, RefreshCw, ShieldCheck, Truck, AlertTriangle, Trash2, XCircle } from 'lucide-react';

const defaultForm = {
  name: '',
  driverName: '',
  driverPhone: '',
  phone: '',
  registrationNo: '',
  vehicleType: 'basic',
  area: 'Nairobi',
  neighbourhood: 'Kilimani',
  status: 'available',
  verificationStatus: 'VERIFIED',
  capacity: '2',
  etaMinutes: '15',
  providerId: '',
};

export default function AmbulanceConsolePage() {
  const [units, setUnits] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'fleet' | 'providers'>('fleet');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/ambulance');
      const data = await res.json();
      setUnits(data.units || []);
      setDispatches(data.dispatches || []);
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to fetch ambulance units', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();

    const intervalId = window.setInterval(() => {
      fetchUnits();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ONBOARD',
          ...form,
          capacity: Number(form.capacity),
          etaMinutes: Number(form.etaMinutes),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setForm(defaultForm);
        await fetchUnits();
      }
    } catch (error) {
      console.error('Failed to onboard ambulance', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateDispatchStatus = async (dispatchId: string, status: string) => {
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_DISPATCH_STATUS', dispatchId, status }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not update dispatch status');
      }

      await fetchUnits();
    } catch (error) {
      console.error('Failed to update dispatch status', error);
    }
  };

  const updateUnitVerification = async (unitId: string, verificationStatus: string) => {
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          id: unitId,
          verificationStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not update ambulance verification');
      }

      await fetchUnits();
    } catch (error) {
      console.error('Failed to update ambulance verification', error);
    }
  };

  const updateUnitOnline = async (unitId: string, isOnline: boolean) => {
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          id: unitId,
          isOnline,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not update unit status');
      }

      await fetchUnits();
    } catch (error) {
      console.error('Failed to update ambulance online status', error);
    }
  };

  const deleteUnit = async (unitId: string, unitName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${unitName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_UNIT', id: unitId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to remove ambulance unit');
        return;
      }

      await fetchUnits();
    } catch (error) {
      console.error('Failed to delete ambulance unit', error);
      alert('Network error while deleting unit');
    }
  };

  const updateProviderVerification = async (providerId: string, verificationStatus: string) => {
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROVIDER',
          providerId,
          verificationStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not update provider verification');
      }
      await fetchUnits();
    } catch (error) {
      console.error('Failed to update provider verification', error);
    }
  };

  const verifiedUnits = units.filter((u) => String(u.verificationStatus).toUpperCase() === 'VERIFIED').length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const completedDispatches = dispatches.filter((d) => String(d.status).toLowerCase() === 'completed');
  const avgEta = units.length ? Math.round(units.reduce((acc, u) => acc + Number(u.etaMinutes || 0), 0) / units.length) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5 px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
              Clinical Transport Ops
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 sm:mt-2">
            Ambulance Console
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition ${
                activeTab === 'fleet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fleet & Dispatches
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition ${
                activeTab === 'providers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Providers ({providers.length})
            </button>
          </div>

          <button
            onClick={fetchUnits}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh fleet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-amber-100 shadow-sm">
          <div className="text-[11px] uppercase font-bold text-slate-400">Fleet</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{units.length}</div>
          <div className="text-[10px] text-slate-500">vehicles registered</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="text-[11px] uppercase font-bold text-slate-400">Available</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{availableUnits}</div>
          <div className="text-[10px] text-slate-500">ready for dispatch</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="text-[11px] uppercase font-bold text-slate-400">Verified</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-700">{verifiedUnits}</div>
          <div className="text-[10px] text-slate-500">active and cleared</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="text-[11px] uppercase font-bold text-slate-400">Avg ETA</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{avgEta} min</div>
          <div className="text-[10px] text-slate-500">coverage window</div>
        </div>
      </div>

      {activeTab === 'providers' ? (
        <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-base text-slate-900">Registered Ambulance Providers</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">{providers.length} provider(s) registered</span>
          </div>

          {providers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No independent ambulance providers registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((p) => {
                const isVerified = String(p.verificationStatus).toUpperCase() === 'VERIFIED';
                const providerUnits = units.filter((u) => u.providerId === p.id);
                return (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.verificationStatus === 'SUSPENDED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(-6)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                          <span><strong>Phone:</strong> {p.contactPhone}</span>
                          {p.contactEmail && <span><strong>Email:</strong> {p.contactEmail}</span>}
                          {p.licenseNo && <span><strong>Licence:</strong> {p.licenseNo}</span>}
                          <span><strong>Area:</strong> {p.serviceArea}</span>
                          {p.payoutMpesa && <span><strong>Payout M-Pesa:</strong> {p.payoutMpesa}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isVerified && (
                          <button
                            onClick={() => updateProviderVerification(p.id, 'VERIFIED')}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Verify Provider
                          </button>
                        )}
                        {isVerified && (
                          <button
                            onClick={() => updateProviderVerification(p.id, 'SUSPENDED')}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Suspend
                          </button>
                        )}
                        {p.verificationStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => updateProviderVerification(p.id, 'VERIFIED')}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Re-activate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Units summary for provider */}
                    <div className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Fleet Units ({providerUnits.length}): </span>
                      {providerUnits.length === 0 ? (
                        <span className="text-slate-400 italic">No units registered yet</span>
                      ) : (
                        <span>
                          {providerUnits.map((u) => `${u.name} (${u.registrationNo})`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">Active fleet</h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading ambulance fleet…</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Active dispatches</p>
                    <p className="text-xs text-amber-700">{dispatches.length} request(s) currently assigned</p>
                  </div>
                </div>
              </div>

              {completedDispatches.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Completed trips</p>
                    <p className="text-xs text-emerald-700">{completedDispatches.length} ambulance trip(s) awaiting payment visibility</p>
                  </div>

                  {completedDispatches.map((dispatch) => (
                    <div key={`completed-${dispatch.id}`} className="rounded-xl border border-emerald-200 bg-white/80 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{dispatch.request?.patientName ?? 'Completed patient request'}</p>
                        <p className="text-[11px] text-slate-500">{dispatch.request?.address ?? 'Pickup address unavailable'}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.location.href = `/patient/consult/${dispatch.request?.id ?? dispatch.requestId}/summary`}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-[10px] font-bold shadow-sm transition"
                      >
                        Completed — Go to payment
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {dispatches.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No active ambulance requests at the moment.</div>
              ) : (
                <div className="space-y-3">
                  {dispatches.map((dispatch) => (
                    <div key={dispatch.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900">{dispatch.request?.patientName ?? 'Patient request'}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{dispatch.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{dispatch.request?.address ?? 'Pickup address unavailable'}</p>
                          {dispatch.dropoffAddress && (
                            <p className="text-[11px] text-slate-500"><strong>Drop-off:</strong> {dispatch.dropoffAddress}</p>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800">ETA:</span> {dispatch.estimatedEtaMinutes ?? 15} min
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-600 border-t border-slate-200 pt-3">
                        <span><strong>Assigned unit:</strong> {dispatch.unit?.name ?? 'Unassigned'}</span>
                        <span><strong>Patient:</strong> {dispatch.request?.patientPhone ?? 'N/A'}</span>
                        <span><strong>Severity:</strong> {dispatch.request?.severity ?? 'normal'}</span>
                        <span><strong>Area:</strong> {dispatch.request?.neighbourhood ?? 'N/A'}</span>
                        {dispatch.ambulancePayoutKES ? (
                          <span><strong>Payout:</strong> KES {dispatch.ambulancePayoutKES}</span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          {['assigned', 'en_route', 'arrived', 'completed'].map((statusKey) => {
                            const isCurrent = dispatch.status === statusKey;
                            const labelMap: Record<string, string> = {
                              assigned: 'Assigned',
                              en_route: 'En route',
                              arrived: 'Arrived',
                              completed: 'Complete',
                            };

                            return (
                              <button
                                key={statusKey}
                                type="button"
                                onClick={() => updateDispatchStatus(dispatch.id, statusKey)}
                                disabled={isCurrent}
                                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                                  isCurrent
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 cursor-default'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-800'
                                }`}
                              >
                                {labelMap[statusKey]}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => updateDispatchStatus(dispatch.id, 'cancelled')}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        </div>

                        <a
                          href={`/ambulance/driver/${dispatch.id.slice(-6).toUpperCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:underline"
                        >
                          <Truck className="w-3 h-3" />
                          Driver view ({dispatch.id.slice(-6).toUpperCase()})
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {units.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">No ambulances onboarded yet.</div>
              ) : (
                <div className="space-y-3 pt-2">
                  {units.map((unit) => (
                    <div key={unit.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
                            🚑
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900">{unit.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                unit.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                                unit.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-600'} `}>
                                {unit.status}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                unit.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                                unit.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-700'} `}>
                                {unit.verificationStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                              <span><strong>Driver:</strong> {unit.driverName}</span>
                              {unit.driverPhone && <span><strong>Driver Phone:</strong> {unit.driverPhone}</span>}
                              <span><strong>Plate:</strong> {unit.registrationNo}</span>
                              <span><strong>Type:</strong> {unit.vehicleType}</span>
                              {unit.provider && (
                                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  {unit.provider.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-600" />{unit.neighbourhood}</div>
                          <div className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-amber-600" />{unit.etaMinutes} min</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 border-t border-slate-200 pt-3">
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{unit.phone}</span>
                        <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" />{unit.area}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Capacity {unit.capacity}</span>
                        <span className="font-semibold text-slate-700">Status: {unit.isOnline ? 'Online' : 'Offline'}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          {String(unit.verificationStatus).toUpperCase() !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => updateUnitVerification(unit.id, 'VERIFIED')}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              Verify unit
                            </button>
                          )}
                          {String(unit.verificationStatus).toUpperCase() === 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => updateUnitVerification(unit.id, 'PENDING')}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:border-slate-300 transition"
                            >
                              Mark pending
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => updateUnitOnline(unit.id, !unit.isOnline)}
                            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                              unit.isOnline
                                ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {unit.isOnline ? 'Set Offline' : 'Set Online'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteUnit(unit.id, unit.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition"
                          title="Remove ambulance unit"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200 mb-4">
            <Plus className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">Ambulance onboarding</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-sm">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Unit name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Daktari Mtaani 4"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Driver name</label>
              <input
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                placeholder="John Otieno"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Driver Phone</label>
                <input
                  value={form.driverPhone}
                  onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                  placeholder="+254722000000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Provider (Optional)</label>
                <select
                  value={form.providerId}
                  onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Independent / Unassigned</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Unit Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+254700000000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Reg no.</label>
                <input
                  value={form.registrationNo}
                  onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                  placeholder="KAA 204Q"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Vehicle type</label>
                <select
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="icu">ICU</option>
                  <option value="maternity">Maternity</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Area</label>
                <input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Nairobi"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Neighbourhood</label>
                <input
                  value={form.neighbourhood}
                  onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })}
                  placeholder="Kilimani"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="in_transit">In transit</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">ETA min</label>
                <input
                  type="number"
                  min={1}
                  value={form.etaMinutes}
                  onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Onboarding review is required before the unit is marked verified.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition disabled:opacity-60"
            >
              {submitting ? 'Submitting onboarding…' : 'Create ambulance unit'}
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
