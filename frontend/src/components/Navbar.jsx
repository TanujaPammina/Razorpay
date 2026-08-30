import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Bot, 
  ShoppingBag, 
  AlertTriangle, 
  Terminal, 
  Zap, 
  Layers,
  Radio,
  FileCode2
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  pendingCount = 0, 
  onOpenArchitecture 
}) {
  const tabs = [
    { id: 'dashboard', label: 'AI Growth & Overview', icon: TrendingUp, track: 'Track 01' },
    { id: 'storefront', label: 'Conversational Store', icon: ShoppingBag, track: 'In-App Checkout' },
    { id: 'arena', label: 'AI Buyer Arena (AP2)', icon: Bot, track: 'Agentic Protocol' },
    { id: 'guardrails', label: 'Risk Guardrails ("The Bar")', icon: ShieldCheck, badge: pendingCount, track: 'Track 02' },
    { id: 'postmortem', label: '2 AM Incident & Pitch', icon: Terminal, track: 'Post-Mortem' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Razorpay Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0c8ce9] via-[#0284c7] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#0c8ce9]/20 font-bold text-white tracking-wider">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    RiskSense
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0c8ce9]/10 text-[#38bdf8] border border-[#0c8ce9]/30 font-semibold">
                    AP2 + UAP
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                  <span>Powered by</span>
                  <span className="text-white font-semibold flex items-center">
                    Razorpay
                    <span className="inline-block w-1 h-1 rounded-full bg-[#0c8ce9] mx-1"></span>
                    Buildathon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0c2340] text-[#38bdf8] shadow-inner border border-[#0c8ce9]/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#38bdf8]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="flex items-center space-x-3">
            {/* Architecture Modal Trigger */}
            <button
              onClick={onOpenArchitecture}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 transition"
              title="View Complete System Architecture Diagram & Protocol Specs"
            >
              <Layers className="w-3.5 h-3.5 text-[#0c8ce9]" />
              <span className="hidden sm:inline">Architecture</span>
            </button>

            {/* Live WebSockets Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 radar-dot' : 'bg-rose-500'}`}></span>
              <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
                {isConnected ? 'LIVE FEED' : 'OFFLINE'}
              </span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  isActive ? 'bg-[#0c2340] text-[#38bdf8] border border-[#0c8ce9]/30' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="px-1 rounded-full text-[9px] bg-amber-500/20 text-amber-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}

