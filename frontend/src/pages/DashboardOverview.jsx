import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  Bot, 
  ArrowUpRight, 
  Activity, 
  Users, 
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const mockChartData = [
  { time: '18:00', organic: 14200, agentic: 8400, protectedMargin: 3200 },
  { time: '19:00', organic: 18900, agentic: 12600, protectedMargin: 4800 },
  { time: '20:00', organic: 24500, agentic: 19800, protectedMargin: 7900 },
  { time: '21:00', organic: 31200, agentic: 28900, protectedMargin: 11400 },
  { time: '22:00', organic: 38700, agentic: 39500, protectedMargin: 16200 },
  { time: '23:00', organic: 45200, agentic: 52400, protectedMargin: 21800 }
];

export default function DashboardOverview({ 
  auditTrail = [], 
  growthMetrics = {}, 
  guardrailMetrics = {},
  onNavigateToArena,
  onNavigateToStore
}) {
  const [rescuingCart, setRescuingCart] = useState(false);
  const [lastRescue, setLastRescue] = useState(null);

  const analytics = growthMetrics?.analytics || {
    totalRevenueINR: 1732743,
    autonomousRevenueUpliftINR: 513000,
    autonomousConversions: 131,
    averageOrderValueINR: 18450,
    conversionRatePercent: 14.8
  };

  const campaigns = growthMetrics?.campaigns || [];

  const handleTriggerRescue = async () => {
    setRescuingCart(true);
    try {
      const res = await fetch('/api/growth/rescue-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: 'cto@hypergrowth.tech',
          cartValue: 28999
        })
      });
      const data = await res.json();
      setLastRescue(data.rescue);
    } catch (e) {
      console.error(e);
    }
    setRescuingCart(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner: Track 01 & 02 Alignment */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c2340]/90 via-[#0d1527] to-slate-900 border border-[#0c8ce9]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-[#0c8ce9]/20 text-[#38bdf8] text-xs font-mono font-bold border border-[#0c8ce9]/30">
              RAZORPAY BUILDATHON READY
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              TRACK 01 + 02
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
            Autonomous Agentic Commerce & Real-Time Risk Controller
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Growing merchant revenue with autonomous AP2/x402 AI buyer transactions while enforcing bounded margins, gated approval thresholds, and explainable audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onNavigateToStore}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
          >
            <ShoppingBag className="w-4 h-4 text-[#38bdf8]" />
            <span>Open Storefront</span>
          </button>
          <button
            onClick={onNavigateToArena}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0c8ce9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white text-xs font-semibold shadow-lg shadow-[#0c8ce9]/25 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Buyer Arena</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Settled Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#0c8ce9]/20 flex items-center justify-center text-[#38bdf8]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">
              ₹{analytics.totalRevenueINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+28.4% this week via AP2 Agents</span>
          </div>
        </div>

        {/* Card 2: Autonomous Revenue Uplift */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Autonomous AI Uplift</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{analytics.autonomousRevenueUpliftINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <span>{analytics.autonomousConversions} autonomous sales closed</span>
          </div>
        </div>

        {/* Card 3: Volume Protected by Guardrails */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Risk Protected Volume</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400 tracking-tight">
              ₹{(guardrailMetrics?.totalVolumeProtectedINR || 348500).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <span>{guardrailMetrics?.rejectedCount || 8} unauthorized leaks blocked</span>
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg. Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tracking-tight">
              ₹{analytics.averageOrderValueINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-purple-300">
            <span>Dynamic bundle upsell active</span>
          </div>
        </div>

      </div>

      {/* Revenue & Anomaly Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#38bdf8]" />
                <span>Real-Time Revenue & Autonomous Agent Ingestion</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of human storefront sales vs AP2 autonomous AI buyer checkouts
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-[#38bdf8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0c8ce9]"></span>
                <span>Agentic AP2</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                <span>Storefront</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="agenticGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8ce9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0c8ce9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="agentic" stroke="#0c8ce9" strokeWidth={2} fillOpacity={1} fill="url(#agenticGrad)" name="Agentic AP2 Revenue" />
                <Area type="monotone" dataKey="organic" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#organicGrad)" name="Storefront Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Campaigns & Autonomous Recovery Trigger */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Growth Campaigns</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              3 RUNNING
            </span>
          </div>

          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{c.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    +{c.incentiveDiscount}% Boost
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.conversionsCount} conversions</span>
                  <span className="text-slate-200 font-semibold">
                    ₹{c.revenueGeneratedINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action: Test Abandoned Cart Recovery */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleTriggerRescue}
              disabled={rescuingCart}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{rescuingCart ? 'Simulating Rescue...' : 'Test AI Abandoned Cart Rescue'}</span>
            </button>

            {lastRescue && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                Rescued cart for <strong>{lastRescue.customerEmail}</strong>! Saved ₹{lastRescue.finalRescueValue.toLocaleString('en-IN')}.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Real-time Activity & Telemetry Feed */}
      <div className="p-5 rounded-2xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Audit Stream & Real-Time Razorpay Ingestion</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {auditTrail.length} actions logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {auditTrail.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Waiting for incoming agent or customer actions...
            </div>
          ) : (
            auditTrail.slice(0, 8).map((record) => (
              <div 
                key={record.actionId} 
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    record.decision === 'AUTO_APPROVED' ? 'bg-emerald-400' :
                    record.decision.includes('GATED') ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{record.productName || 'Order'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {record.agentId}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ₹{record.pricing?.finalAmount?.toLocaleString('en-IN')} (Discount: {record.pricing?.discountPercent || 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    record.decision === 'AUTO_APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    record.decision.includes('GATED') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {record.decision}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'now'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

