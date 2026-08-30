import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Building, 
  Lock, 
  ArrowRight,
  ExternalLink,
  Receipt
} from 'lucide-react';

export default function RazorpayCheckoutModal({ orderData, totalAmount, onSuccess, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('agent.commerce@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const order = orderData?.order || {};

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    
    // Simulate gateway handoff latency
    setTimeout(async () => {
      try {
        const res = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentId: `pay_mock_${Date.now().toString().slice(-10)}`,
            signature: 'mock_sig_verified_by_risksense'
          })
        });
        const data = await res.json();
        
        setIsProcessing(false);
        setPaymentSuccess(data.payment);
        
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (onSuccess) onSuccess(data.payment);
      } catch (err) {
        setIsProcessing(false);
        alert('Payment processing error: ' + err.message);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d1527] border border-[#0c8ce9]/40 rounded-2xl shadow-2xl shadow-[#0c8ce9]/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0c2340] p-4 border-b border-[#0c8ce9]/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c8ce9] flex items-center justify-center text-white font-bold text-sm">
              ₹
            </div>
            <div>
              <div className="text-xs font-mono text-[#38bdf8] flex items-center space-x-1">
                <span>Razorpay Standard Checkout</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                RiskSense Nexus Merchant
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Payment Authorized & Captured
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                ₹{((paymentSuccess.amount || totalAmount * 100) / 100).toLocaleString('en-IN')}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-white font-semibold">{paymentSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-slate-300">{paymentSuccess.order_id || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="text-emerald-400 uppercase font-semibold">{paymentSuccess.method || 'UPI Intent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RiskSense Audit Hash:</span>
                <span className="text-[#38bdf8] truncate max-w-[160px]">
                  {orderData?.evaluation?.auditHash?.substring(0, 16)}...
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0c8ce9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white text-sm font-semibold shadow-lg shadow-[#0c8ce9]/20 transition"
            >
              Done & Return to Store
            </button>
          </div>
        ) : (
          /* Payment Selection View */
          <div className="p-6 space-y-5">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Amount Payable</span>
                <span className="text-2xl font-extrabold text-white">
                  ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TEST MODE / VERIFIED
                </span>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">
                  Order: {order.id || 'order_init'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Select Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition ${
                    selectedMethod === 'upi'
                      ? 'bg-[#0c2340] border-[#0c8ce9] text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#38bdf8]" />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition ${
                    selectedMethod === 'card'
                      ? 'bg-[#0c2340] border-[#0c8ce9] text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#38bdf8]" />
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition ${
                    selectedMethod === 'netbanking'
                      ? 'bg-[#0c2340] border-[#0c8ce9] text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 text-[#38bdf8]" />
                  <span className="text-xs">Netbanking</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {selectedMethod === 'upi' && (
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-[#0c8ce9] font-mono text-xs"
                />
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0c8ce9] via-[#0284c7] to-[#0369a1] hover:from-[#0284c7] hover:to-[#0c8ce9] text-white font-semibold text-sm shadow-lg shadow-[#0c8ce9]/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Authorizing with Razorpay...' : `Pay ₹${Number(totalAmount).toLocaleString('en-IN')}`}</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit Encrypted & RiskSense Guardrail Protected</span>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

