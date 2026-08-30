import React from 'react';
import { Layers, ShieldCheck, Cpu, Database, Server, Radio, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function ArchitectureModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d1527] border border-[#0c8ce9]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0c2340] p-5 border-b border-[#0c8ce9]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c8ce9]/20 border border-[#0c8ce9]/40 flex items-center justify-center text-[#38bdf8]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0c8ce9]/20 text-[#38bdf8] font-semibold">
                SYSTEM ARCHITECTURE & PROTOCOL
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                RiskSense Dual-Track Autonomous Engine
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Architecture Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          
          {/* Visual Architecture Layers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Layer 1: Ingestion & Protocols */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-[#38bdf8] font-bold text-xs uppercase tracking-wider font-mono">
                <Radio className="w-4 h-4" />
                <span>1. Ingestion Layer</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">AP2 / x402 Protocol:</strong>
                  Machine-readable JSON-LD catalog & agent negotiation socket.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Conversational Storefront:</strong>
                  Natural language & voice intent parsing for human buyers.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Growth Orchestrator:</strong>
                  Abandoned cart triggers & dynamic surge pricing.
                </li>
              </ul>
            </div>

            {/* Layer 2: RiskSense Guardrails ("The Bar") */}
            <div className="p-4 rounded-xl bg-[#0c2340]/40 border border-[#0c8ce9]/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Risk & Guardrails Gate</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Bounded Rules:</strong>
                  Max discount ceiling (25%) & wholesale cost floor margins.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Gated Approval Engine:</strong>
                  Instant HITL WebSocket modal for orders &gt; ₹50,000.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Explainable Audit Ledger:</strong>
                  SHA256 hashed CoT decision trail for every money action.
                </li>
              </ul>
            </div>

            {/* Layer 3: Razorpay Settlement & Recovery */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Server className="w-4 h-4" />
                <span>3. Settlement & Recovery</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Razorpay Orders & Checkout:</strong>
                  Standard checkout modal, UPI intents, HMAC signatures.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">2 AM Circuit Breaker:</strong>
                  Automatic timeout capture, deduplication & fallback links.
                </li>
                <li className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <strong className="text-white block font-mono">Zero Data Loss:</strong>
                  Reconciliation against idempotent order UUID ledger.
                </li>
              </ul>
            </div>

          </div>

          {/* AP2 Protocol Schema Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider mb-2">
              AP2 (Agent Payments Protocol) & NPCI UAP Endpoint Schema
            </h4>
            <pre className="text-[11px] font-mono text-emerald-400 bg-black/60 p-3 rounded-lg overflow-x-auto border border-slate-800">
{`// GET /api/agent/catalog (Schema.org + AP2)
{
  "@context": "https://schema.org",
  "protocol": "AP2/Agentic-Commerce-v1.0",
  "merchant": { "settlementGateway": "Razorpay", "currency": "INR" },
  "items": [
    {
      "sku": "prod_dev_01",
      "name": "NeuralEdge Developer Kit v4",
      "offers": { "listPrice": 14999, "minAcceptablePrice": 10000, "maxAgentDiscount": 20.0 }
    }
  ]
}

// POST /api/agent/negotiate -> RiskSense Evaluator -> Bounded Quote / Gated HITL
// POST /api/agent/checkout -> Razorpay Order Creation + X-Payment-Required Headers`}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
}

