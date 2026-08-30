import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import ConversationalStorefront from './pages/ConversationalStorefront.jsx';
import AgenticCommerceArena from './pages/AgenticCommerceArena.jsx';
import RiskGuardrailsPage from './pages/RiskGuardrailsPage.jsx';
import TwoAmPostMortem from './pages/TwoAmPostMortem.jsx';
import GatedApprovalModal from './components/GatedApprovalModal.jsx';
import RazorpayCheckoutModal from './components/RazorpayCheckoutModal.jsx';
import ArchitectureModal from './components/ArchitectureModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // Global State
  const [auditTrail, setAuditTrail] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [growthMetrics, setGrowthMetrics] = useState(null);
  const [guardrailMetrics, setGuardrailMetrics] = useState(null);

  // Modals
  const [activeGatedAction, setActiveGatedAction] = useState(null);
  const [checkoutOrderData, setCheckoutOrderData] = useState(null);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState(0);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  useEffect(() => {
    // Initial fetch of data
    fetch('/api/guardrails/audit-trail')
      .then(res => res.json())
      .then(data => { if (data.auditTrail) setAuditTrail(data.auditTrail); })
      .catch(e => console.error(e));

    fetch('/api/guardrails/pending-approvals')
      .then(res => res.json())
      .then(data => { if (data.pending) setPendingApprovals(data.pending); })
      .catch(e => console.error(e));

    fetch('/api/growth/metrics')
      .then(res => res.json())
      .then(data => { setGrowthMetrics(data); })
      .catch(e => console.error(e));

    fetch('/api/guardrails/metrics')
      .then(res => res.json())
      .then(data => { if (data.metrics) setGuardrailMetrics(data.metrics); })
      .catch(e => console.error(e));

    // Connect WebSocket
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('[WebSocket] Connected to RiskSense Gateway');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    s.on('initial_state', (snapshot) => {
      if (snapshot.recentAuditTrail) setAuditTrail(snapshot.recentAuditTrail);
      if (snapshot.pendingApprovals) setPendingApprovals(snapshot.pendingApprovals);
      if (snapshot.growthMetrics) setGrowthMetrics(snapshot.growthMetrics);
      if (snapshot.guardrailMetrics) setGuardrailMetrics(snapshot.guardrailMetrics);
    });

    s.on('audit_log_created', (newRecord) => {
      setAuditTrail(prev => [newRecord, ...prev.slice(0, 99)]);
      if (newRecord.requiresGatedApproval) {
        setPendingApprovals(prev => [newRecord, ...prev]);
        setActiveGatedAction(newRecord); // Auto-prompt modal for immediate review!
      }
    });

    s.on('gated_approval_required', (payload) => {
      if (payload.record) {
        setActiveGatedAction(payload.record);
      }
    });

    s.on('gated_approval_resolved', (payload) => {
      setPendingApprovals(prev => prev.filter(p => p.actionId !== payload.actionId));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Handle Resolving a Gated Approval
  const handleResolveGatedAction = async ({ actionId, approved, reviewerNotes }) => {
    try {
      const res = await fetch('/api/guardrails/resolve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, approved, reviewerNotes })
      });
      const data = await res.json();
      
      // Update local state
      setPendingApprovals(prev => prev.filter(a => a.actionId !== actionId));
      setActiveGatedAction(null);
    } catch (e) {
      alert('Error resolving action: ' + e.message);
    }
  };

  // Trigger Checkout from Storefront or Arena
  const handleCheckoutOrder = async ({ amount, cartItems = [], discountPercent = 0 }) => {
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, cartItems, discountPercent })
      });
      const data = await res.json();
      
      if (data.success) {
        setCheckoutOrderData(data);
        setCheckoutTotalAmount(amount);
      } else {
        alert(data.error || 'Checkout initialization failed');
      }
    } catch (e) {
      alert('Checkout error: ' + e.message);
    }
  };

  const handleCheckoutWithExistingOrder = (orderData, amount) => {
    setCheckoutOrderData(orderData);
    setCheckoutTotalAmount(amount);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        pendingCount={pendingApprovals.length}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            auditTrail={auditTrail}
            growthMetrics={growthMetrics}
            guardrailMetrics={guardrailMetrics}
            onNavigateToArena={() => setActiveTab('arena')}
            onNavigateToStore={() => setActiveTab('storefront')}
          />
        )}

        {activeTab === 'storefront' && (
          <ConversationalStorefront
            onCheckoutOrder={handleCheckoutOrder}
          />
        )}

        {activeTab === 'arena' && (
          <AgenticCommerceArena
            onTriggerCheckoutWithOrder={handleCheckoutWithExistingOrder}
          />
        )}

        {activeTab === 'guardrails' && (
          <RiskGuardrailsPage
            auditTrail={auditTrail}
            pendingApprovals={pendingApprovals}
            guardrailMetrics={guardrailMetrics}
            onOpenGatedModal={(action) => setActiveGatedAction(action)}
            onResolveGatedAction={handleResolveGatedAction}
          />
        )}

        {activeTab === 'postmortem' && (
          <TwoAmPostMortem />
        )}
      </main>

      {/* Gated Human-in-the-Loop Modal */}
      {activeGatedAction && (
        <GatedApprovalModal
          action={activeGatedAction}
          onResolve={handleResolveGatedAction}
          onClose={() => setActiveGatedAction(null)}
        />
      )}

      {/* Razorpay Standard Checkout Modal */}
      {checkoutOrderData && (
        <RazorpayCheckoutModal
          orderData={checkoutOrderData}
          totalAmount={checkoutTotalAmount}
          onClose={() => setCheckoutOrderData(null)}
          onSuccess={(payment) => {
            console.log('Payment captured:', payment);
          }}
        />
      )}

      {/* System Architecture Modal */}
      {showArchitectureModal && (
        <ArchitectureModal
          onClose={() => setShowArchitectureModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-[#080c14] text-center text-xs font-mono text-slate-500">
        RiskSense © 2026 — Built for Razorpay AI Buildathon | AP2, ACP & UAP Autonomous Commerce Standard
      </footer>

    </div>
  );
}

