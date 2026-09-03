'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ambulance, Plus, MapPin, Phone, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

const defaultForm = {
  name: '',
  driverName: '',
  driverPhone: '',
  phone: '',
  registrationNo: '',
  vehicleType: 'basic',
  area: 'Nairobi',
  neighbourhood: 'Kilimani',
  etaMinutes: '15',
  capacity: '2',
};

export default function AmbulanceFleetPage() {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ambulance/operator');
      if (res.status === 401) { router.push('/ambulance/login'); return; }
      const json = await res.json();
      setUnits(json.units ?? []);
      setProvider(json.provider);
    } catch (err) {
      console.error('Failed to load fleet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOnline = async (unit: any) => {
    try {
      await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', id: unit.id, isOnline: !unit.isOnline }),
      });
      await fetchData();
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ONBOARD',
          ...form,
          etaMinutes: Number(form.etaMinutes),
          capacity: Number(form.capacity),
          status: 'available',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm(defaultForm);
        setShowForm(false);
        await fetchData();
      } else {
        alert(data.error || 'Failed to add unit');
      }
    } catch (err) {
      alert('Failed to add unit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-slate-500 text-sm">Loading fleet...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5 px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Fleet Management</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{provider?.name ?? 'My Fleet'}</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={fetchData} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Unit
          </button>
        </div>
      </div>

      {/* Add unit form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-amber-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-base text-slate-900">Register New Ambulance Unit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Unit name</label>
              <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="KRCS Unit 3" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Driver name</label>
              <input required value={form.driverName} onChange={(e) => setForm({...form, driverName: e.target.value})} placeholder="John Otieno" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Driver phone</label>
              <input value={form.driverPhone} onChange={(e) => setForm({...form, driverPhone: e.target.value})} placeholder="+254722000001" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Unit phone</label>
              <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+254711000103" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Reg. No.</label>
              <input required value={form.registrationNo} onChange={(e) => setForm({...form, registrationNo: e.target.value})} placeholder="KCB 003K" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Vehicle type</label>
              <select value={form.vehicleType} onChange={(e) => setForm({...form, vehicleType: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="icu">ICU</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Neighbourhood</label>
              <input required value={form.neighbourhood} onChange={(e) => setForm({...form, neighbourhood: e.target.value})} placeholder="Kilimani" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">ETA (min)</label>
              <input type="number" min={1} value={form.etaMinutes} onChange={(e) => setForm({...form, etaMinutes: e.target.value})} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs py-3 rounded-xl transition">
              {submitting ? 'Adding...' : 'Add Unit'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 bg-white text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Units list */}
      <div className="space-y-3">
        {units.length === 0 ? (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-10 text-center">
            <Ambulance className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No units registered yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-amber-700 font-bold text-xs hover:underline">Add your first unit →</button>
          </div>
        ) : units.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shrink-0">🚑</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{u.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                      u.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>{u.status}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      String(u.verificationStatus).toUpperCase() === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>{String(u.verificationStatus).toLowerCase()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                    <span><strong>Driver:</strong> {u.driverName}</span>
                    <span><strong>Plate:</strong> {u.registrationNo}</span>
                    <span><strong>Type:</strong> {u.vehicleType}</span>
                    {u.driverPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.driverPhone}</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{u.neighbourhood} • ETA {u.etaMinutes} min
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">{u.isOnline ? 'Online' : 'Offline'}</span>
                <button
                  onClick={() => toggleOnline(u)}
                  className={`transition ${u.isOnline ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}
                  title={u.isOnline ? 'Go offline' : 'Go online'}
                >
                  {u.isOnline ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
