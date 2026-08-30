import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Lock, 
  Cpu, 
  Search, 
  FileText,
  Clock,
  Fingerprint,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

export default function RiskGuardrailsPage({ 
  auditTrail = [], 
  pendingApprovals = [], 
  guardrailMetrics = {},
  onOpenGatedModal,
  onResolveGatedAction 
}) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredTrail = auditTrail.filter(item => {
    if (filter === 'APPROVED' && !item.decision.includes('APPROVED')) return false;
    if (filter === 'GATED' && (!item.decision.includes('GATED') && !item.requiresGatedApproval)) return false;
    if (filter === 'REJECTED' && !item.decision.includes('REJECTED')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.actionId?.toLowerCase().includes(q) ||
        item.productName?.toLowerCase().includes(q) ||
        item.agentId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0d1527] to-slate-900 border border-blue-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
              TRACK 02: AI RISK MANAGER
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              "THE BAR" COMPLIANT
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
            Risk & Guardrails Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Every money action is explainable, bounded and gated. Review the live cryptographic audit trail, tune bounding ceilings, and authorize pending Human-in-the-Loop transactions.
          </p>
        </div>

        {pendingApprovals.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 block">
                {pendingApprovals.length} Gated Action(s) Waiting
              </span>
              <span className="text-[11px] text-slate-400">
                Action required by merchant
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pending Gated Queue Section */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Active Human-in-the-Loop Review Queue ({pendingApprovals.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              High Risk / Outlier Transactions Intercepted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((action) => (
              <div 
                key={action.actionId} 
                className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">ID: {action.actionId}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{action.productName}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PENDING SIGN-OFF
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-lg bg-slate-950">
                  <div>
                    <span className="text-slate-500 block">Proposed Amount:</span>
                    <span className="text-emerald-400 font-bold">
                      ₹{action.pricing?.finalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Requested Discount:</span>
                    <span className="text-amber-400 font-bold">{action.pricing?.discountPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onOpenGatedModal(action)}
                    className="w-full py-2 rounded-lg bg-[#0c8ce9] hover:bg-[#0284c7] text-white text-xs font-semibold shadow-md shadow-[#0c8ce9]/20 transition"
                  >
                    Open Inspection & Decision Modal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guardrail Bounds & Policies Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-mono font-bold">
            <Sliders className="w-4 h-4 text-[#38bdf8]" />
            <span>Discount Ceiling Bound</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">25.0%</span>
            <span className="text-xs text-slate-400 font-mono">Hard limit for agents</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Autonomous negotiations requesting above 25% are automatically bounded or rejected.
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-mono font-bold">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Margin Floor Bound</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">₹200 / unit</span>
            <span className="text-xs text-slate-400 font-mono">Above wholesale cost</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Guarantees merchant profitability on every single negotiated or bundled transaction.
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Gated High-Value Threshold</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400 font-mono">₹50,000</span>
            <span className="text-xs text-slate-400 font-mono">HITL Trigger</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Transactions exceeding ₹50,000 automatically pause for real-time merchant authorization.
          </p>
        </div>
      </div>

      {/* Audit Trail Explorer */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-[#38bdf8]" />
              <span>Explainable Cryptographic Audit Trail (SHA256)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every decision, math equation, and LLM reasoning step permanently logged with tamper-proof signatures
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 pl-8 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#0c8ce9]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-[11px] font-mono">
              {['ALL', 'APPROVED', 'GATED', 'REJECTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filter === f ? 'bg-[#0c8ce9] text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trail Records List */}
        <div className="space-y-3">
          {filteredTrail.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No audit logs match current filters.
            </div>
          ) : (
            filteredTrail.map((record) => {
              const isExpanded = expandedId === record.actionId;
              return (
                <div 
                  key={record.actionId}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden transition"
                >
                  {/* Header Row */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : record.actionId)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/40"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        record.decision === 'AUTO_APPROVED' || record.decision === 'HITL_APPROVED' ? 'bg-emerald-400' :
                        record.decision.includes('GATED') ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-slate-400">{record.actionId}</span>
                          <span className="text-xs font-bold text-white">{record.productName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {record.agentId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Amount: ₹{record.pricing?.finalAmount?.toLocaleString('en-IN')} | Discount: {record.pricing?.discountPercent || 0}% | Risk Score: {record.riskScore}/100
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        record.decision === 'AUTO_APPROVED' || record.decision === 'HITL_APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        record.decision.includes('GATED') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {record.decision}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 text-xs font-mono">
                      
                      {/* Cryptographic Hash */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">SHA256 Audit Signature:</span>
                        <span className="text-[#38bdf8] font-bold">{record.auditHash}</span>
                      </div>

                      {/* Chain of Thought */}
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">
                          Step-by-Step Chain of Thought (CoT) Audit Reasoning:
                        </span>
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-slate-300 text-[11px]">
                          {record.explanationCoT?.map((step, idx) => (
                            <div key={idx} className="leading-relaxed">{step}</div>
                          ))}
                        </div>
                      </div>

                      {/* Economics & Margin Equation */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded bg-slate-900">
                          <span className="text-slate-500 block">Original List:</span>
                          <span className="text-white">₹{record.pricing?.originalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900">
                          <span className="text-slate-500 block">Wholesale Cost:</span>
                          <span className="text-slate-300">₹{record.pricing?.wholesaleCost?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900">
                          <span className="text-slate-500 block">Net Unit Margin:</span>
                          <span className="text-emerald-400 font-bold">₹{record.pricing?.unitMargin?.toFixed(2)}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900">
                          <span className="text-slate-500 block">Decision Risk Level:</span>
                          <span className="text-purple-300 font-bold">{record.riskLevel}</span>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

