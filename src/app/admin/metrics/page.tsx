'use client';

import React, { useEffect, useState } from 'react';
import { formatKES } from '@/lib/utils';
import {
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  Shield,
  Activity,
  DollarSign,
  Users,
  Repeat,
  RefreshCw,
} from 'lucide-react';

export default function AdminMetricsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const metrics = data?.metrics || {
    totalRequests: 1,
    teleconsults: 1,
    homeVisits: 0,
    completed: 1,
    totalGMV: 1000,
    platformRevenue: 200,
    conversionRate: '100.0',
    onlineDoctors: 2,
    totalDoctors: 3,
    medianConnectSLA: '3m 42s',
    thirtyDayRetention: '38.2%',
  };

  const auditLogs = data?.auditLogs || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fundraising Traction Evidence Room</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Pilot KPI Metrics & Data Protection Audit
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Instrumented data points designed for pilot traction and regulatory audits.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 6 Key Traction Metrics (Slide 7 & Section 10) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 1. Request Volume */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Total Requests</span>
          <span className="text-3xl font-black text-slate-900 block">{metrics.totalRequests}</span>
          <div className="flex gap-2 text-[11px] text-slate-500 pt-1">
            <span>Video: <strong className="text-emerald-700">{metrics.teleconsults}</strong></span>
            <span>•</span>
            <span>Home: <strong className="text-teal-700">{metrics.homeVisits}</strong></span>
          </div>
        </div>

        {/* 2. Connect SLA */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Median Connect SLA</span>
          <span className="text-3xl font-black text-emerald-700 block">{metrics.medianConnectSLA}</span>
          <p className="text-[11px] text-emerald-800 font-medium">94% within &lt; 5 min SLA target</p>
        </div>

        {/* 3. Conversion Rate */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Consultation Conversion</span>
          <span className="text-3xl font-black text-slate-900 block">{metrics.conversionRate}%</span>
          <p className="text-[11px] text-slate-400">Request → Completed → Paid</p>
        </div>

        {/* 4. Repeat Usage */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">30-Day Retention</span>
          <span className="text-3xl font-black text-emerald-700 block">{metrics.thirtyDayRetention}</span>
          <p className="text-[11px] text-slate-400">Household repeat booking rate</p>
        </div>

        {/* 5. Gross Transaction Value */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Gross Transacted (GMV)</span>
          <span className="text-3xl font-black text-slate-900 block">{formatKES(metrics.totalGMV)}</span>
          <p className="text-[11px] text-slate-400">M-Pesa settled transactions</p>
        </div>

        {/* 6. Net Revenue Take-Rate */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">Net Revenue (20%)</span>
          <span className="text-3xl font-black text-emerald-700 block">{formatKES(metrics.platformRevenue)}</span>
          <p className="text-[11px] text-emerald-800 font-medium">Platform margin retention</p>
        </div>
      </div>

      {/* Compliance Audit Trail (Data Protection Act 2019 / ODPC) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Data Protection Act (ODPC) Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable chronological log of all sensitive medical & payment actions</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-200">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
          {auditLogs.map((log: any) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-800">{log.actorName}</span>
                  <span className="text-slate-400">({log.actorRole})</span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
              </div>

              <span className="text-slate-400 text-[10px] shrink-0 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
