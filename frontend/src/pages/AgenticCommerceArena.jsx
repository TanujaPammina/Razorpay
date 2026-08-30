import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Terminal, 
  Cpu, 
  Send, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  FileCode2,
  Lock,
  RefreshCw
} from 'lucide-react';

export default function AgenticCommerceArena({ onTriggerCheckoutWithOrder }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(2);
  const [discountBid, setDiscountBid] = useState(12.0);
  const [agentName, setAgentName] = useState('AutoProcure AI Agent (AP2)');
  const [negotiationState, setNegotiationState] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [catalogJson, setCatalogJson] = useState(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct(data.products[0]);
        }
      })
      .catch(e => console.error(e));

    fetch('/api/agent/catalog')
      .then(res => res.json())
      .then(data => setCatalogJson(data))
      .catch(e => console.error(e));
  }, []);

  const handleSendAgentBid = async () => {
    if (!selectedProduct) return;
    setIsExecuting(true);
    setNegotiationState(null);

    try {
      const res = await fetch('/api/agent/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'agent_ap2_ext_99',
          agentName,
          productId: selectedProduct.id,
          quantity: Number(quantity),
          proposedDiscountPercent: Number(discountBid)
        })
      });
      const data = await res.json();
      setNegotiationState(data);
    } catch (err) {
      alert('Negotiation request failed: ' + err.message);
    }
    setIsExecuting(false);
  };

  const handleExecuteAgentCheckout = async () => {
    if (!negotiationState) return;
    setIsExecuting(true);

    try {
      const res = await fetch('/api/agent/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: negotiationState.agentId,
          productId: negotiationState.productId,
          quantity: negotiationState.quantity,
          finalAmount: negotiationState.agreedTotalAmount || (selectedProduct.price * quantity * (1 - discountBid/100)),
          discountPercent: negotiationState.agreedDiscountPercent || discountBid
        })
      });
      const data = await res.json();
      setIsExecuting(false);

      if (data.success && onTriggerCheckoutWithOrder) {
        onTriggerCheckoutWithOrder(data, data.order?.amount ? data.order.amount / 100 : 5000);
      }
    } catch (err) {
      setIsExecuting(false);
      alert('Agent checkout failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#0d1527] to-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
              TRACK 01: AGENT-TO-AGENT COMMERCE
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              AP2 / ACP / x402
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
            Autonomous AI Buyer Arena & Protocol Terminal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Simulate external AI buyer agents interacting with RiskSense over AP2. Watch real-time mathematical margin verification, bounded counter-offers, and instant Razorpay Order generation.
          </p>
        </div>

        <button
          onClick={() => setShowCatalogModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-mono font-semibold border border-purple-500/40 transition shrink-0"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Inspect AP2 JSON-LD Catalog</span>
        </button>
      </div>

      {/* Main Grid: Left Bot Config, Right Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): AI Buyer Bot Setup */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Bot className="w-5 h-5 text-purple-400" />
              <span>External AI Buyer Agent Configuration</span>
            </div>

            {/* Agent Identity */}
            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1">
                Agent Name / Identity Token:
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Product Target */}
            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1">
                Target Product to Procure:
              </label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const found = products.find(p => p.id === e.target.value);
                  setSelectedProduct(found);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (List: ₹{p.price.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Discount Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">
                  Quantity: <span className="text-white font-bold">{quantity}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">
                  Discount Bid: <span className="text-purple-300 font-bold">{discountBid}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.5"
                  value={discountBid}
                  onChange={(e) => setDiscountBid(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* Quick Strategy Presets */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-500 block uppercase">
                Strategy Test Presets:
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => { setQuantity(1); setDiscountBid(10.0); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-center"
                >
                  🟢 Safe Bid (10%)
                </button>
                <button
                  type="button"
                  onClick={() => { setQuantity(3); setDiscountBid(19.0); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-center"
                >
                  🟡 Gated HITL (19%)
                </button>
                <button
                  type="button"
                  onClick={() => { setQuantity(1); setDiscountBid(32.0); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 text-center"
                >
                  🔴 Bound Breach (32%)
                </button>
              </div>
            </div>

            {/* Submit Bid Button */}
            <button
              onClick={handleSendAgentBid}
              disabled={isExecuting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs font-mono shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isExecuting ? 'Transmitting AP2 Packet...' : 'Transmit AP2 Negotiation Payload'}</span>
            </button>

          </div>

          {/* Product Margin Context Card */}
          {selectedProduct && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Merchant Unit Margin Economics
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">List Price:</span>
                <span className="text-white">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wholesale Cost:</span>
                <span className="text-slate-300">₹{selectedProduct.wholesaleCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Configured Discount:</span>
                <span className="text-emerald-400 font-bold">{selectedProduct.maxCustomDiscount}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Real-Time AP2 Protocol Terminal */}
        <div className="lg:col-span-7 flex flex-col h-[650px] glass-panel rounded-2xl overflow-hidden">
          
          {/* Terminal Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">AP2 Protocol Live Inspector</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LISTENING ON /api/agent/negotiate</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs bg-slate-950/90 text-slate-300 space-y-4">
            
            {!negotiationState ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <Bot className="w-10 h-10 text-slate-600" />
                <p>No active negotiation payload in transit.</p>
                <p className="text-[11px] text-slate-600 max-w-sm">
                  Configure your AI Buyer on the left and click "Transmit AP2 Negotiation Payload" to watch the protocol handshake.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Handshake Status Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      negotiationState.status === 'ACCEPTED' ? 'bg-emerald-400' :
                      negotiationState.status === 'HELD_FOR_MERCHANT_REVIEW' ? 'bg-amber-400' : 'bg-purple-400'
                    }`} />
                    <span className="font-bold text-white">
                      Status: {negotiationState.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ID: {negotiationState.negotiationId}
                  </span>
                </div>

                {/* Chain of Thought (CoT) Breakdown */}
                {negotiationState.evaluation?.explanationCoT && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-purple-300 font-bold flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>RiskSense Guardrail Evaluation Reasoning (CoT)</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      {negotiationState.evaluation.explanationCoT.map((step, i) => (
                        <div key={i} className="leading-relaxed">{step}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON Wire Payload */}
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block mb-1">
                    Raw Wire Response Payload (AP2 Format):
                  </span>
                  <pre className="p-3 rounded-xl bg-black/80 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(negotiationState, null, 2)}
                  </pre>
                </div>

                {/* Action Trigger for Accepted Status */}
                {negotiationState.status === 'ACCEPTED' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-300 font-bold block text-xs">
                        Bid Accepted & Signed!
                      </span>
                      <span className="text-[11px] text-slate-300">
                        Agreed Price: ₹{negotiationState.agreedTotalAmount?.toLocaleString('en-IN')} (Quote Token Valid 15m)
                      </span>
                    </div>
                    <button
                      onClick={handleExecuteAgentCheckout}
                      disabled={isExecuting}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Execute Razorpay Order</span>
                    </button>
                  </div>
                )}

                {/* Counter Offer Box */}
                {negotiationState.status === 'COUNTER_OFFER' && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <span className="text-purple-300 font-bold block text-xs">
                      Bounded Counter-Proposal Offered
                    </span>
                    <p className="text-[11px] text-slate-300">
                      {negotiationState.counterProposal?.reasoning}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white font-bold">
                        Offered Amount: ₹{negotiationState.counterProposal?.counterTotalAmount?.toLocaleString('en-IN')} ({negotiationState.counterProposal?.counterDiscountPercent}% OFF)
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* AP2 Machine Catalog Modal */}
      {showCatalogModal && catalogJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#0d1527] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-[#0c2340] border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Machine-Readable Catalog (/api/agent/catalog)
                </h3>
              </div>
              <button 
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-400">
              <pre>{JSON.stringify(catalogJson, null, 2)}</pre>
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

