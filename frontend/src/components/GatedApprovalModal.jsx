import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, ShieldAlert, Cpu, DollarSign, Clock, ArrowRight } from 'lucide-react';

export default function GatedApprovalModal({ action, onResolve, onClose }) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!action) return null;

  const handleDecision = async (approved) => {
    setIsSubmitting(true);
    await onResolve({
      actionId: action.actionId,
      approved,
      reviewerNotes: notes || (approved ? 'Supervisor approved via Gated Portal' : 'Supervisor rejected due to risk policy')
    });
    setIsSubmitting(false);
  };

  const pricing = action.pricing || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d1527] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        
        {/* Header Alert Strip */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-transparent p-5 border-b border-amber-500/30 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  HUMAN-IN-THE-LOOP REQUIRED
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: {action.actionId}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Gated Money Action Intercepted
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Action Context Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-mono">Agent / Origin</span>
              <span className="text-sm font-semibold text-slate-200 truncate block">
                {action.agentId}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-mono">Original Amount</span>
              <span className="text-sm font-semibold text-slate-200">
                ₹{pricing.originalAmount?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-mono">Requested Discount</span>
              <span className="text-sm font-bold text-amber-400">
                {pricing.discountPercent || 0}% (₹{pricing.discountAmount?.toLocaleString('en-IN') || '0'})
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-mono">Final Proposed</span>
              <span className="text-sm font-bold text-emerald-400">
                ₹{pricing.finalAmount?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Risk Factors Triggered */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Risk & Gating Triggers Evaluated</span>
            </h4>
            <div className="space-y-2">
              {action.riskFactors && action.riskFactors.length > 0 ? (
                action.riskFactors.map((rf, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-xs">
                    <span className="font-mono font-bold text-amber-300">[{rf.code}]</span>
                    <span className="text-slate-300">{rf.detail}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400">
                  Standard elevated volume threshold triggered.
                </div>
              )}
            </div>
          </div>

          {/* Explainable Chain of Thought (CoT) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Explainable AI Audit Reasoning (CoT)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
              {action.explanationCoT?.map((step, idx) => (
                <div key={idx} className="leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Note Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Merchant Supervisor Decision Notes (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. VIP partner verified over phone, approve single execution."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-[#0c8ce9]"
            />
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => handleDecision(false)}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-sm font-semibold transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Money Action</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm"
            >
              Review Later
            </button>
            <button
              onClick={() => handleDecision(true)}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Authorize Order</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

