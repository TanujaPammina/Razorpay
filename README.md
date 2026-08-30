# 🚀 RiskSense — Autonomous Agentic Commerce & Real-Time AI Risk Gateway

### Razorpay AI Buildathon 2026 Flagship Project (Track 01 & Track 02)

> **"What we read instead of your resume: A repo that actually runs, a 5-minute video of it working, what broke at 2 AM and how you got out."**

RiskSense is a full-stack, real-time autonomous commerce platform and AI risk controller built on **Razorpay APIs**. It powers the future of **Agent-to-Agent Commerce (AP2, ACP, x402)** while strictly enforcing **"The Bar"** — ensuring every money action is explainable, bounded, and gated.

---

## 🌟 Key Capabilities & Features

### 1. 🤖 Track 01: AI Growth & Agentic Commerce (AP2 / ACP / x402)

- **Machine-Readable Catalog (`GET /api/agent/catalog`)**: Full schema.org + AP2 JSON-LD specification with price ceilings, wholesale margin floors, and vector metadata.
- **Autonomous Negotiation Engine (`POST /api/agent/negotiate`)**: External AI buyers send dynamic discount bids; RiskSense computes unit economics and generates mathematical counter-offers in real-time.
- **Conversational In-App Smart Checkout**: Natural language & voice shopping co-pilot with intelligent upselling, cross-selling, and instant Razorpay checkout modal launches.
- **AI Growth & Campaign Orchestrator**: Self-driving revenue engine with real-time abandoned cart rescue links and flash surge promotions.

### 2. 🛡️ Track 02: AI Risk Manager ("The Bar")

- **Every Action Bounded**: Mathematical price floors (min ₹200 unit margin), hard discount ceilings (25%), and request velocity rate-limiters.
- **Every Action Gated**: High-value transactions (> ₹50,000) or outlier discounts trigger instant **Human-in-the-Loop (HITL)** approval alerts over WebSockets.
- **Every Action Explainable**: Complete Chain-of-Thought (CoT) reasoning logged with tamper-proof SHA256 cryptographic signatures.

### 3. 🔥 "What Broke at 2 AM and How We Got Out"

- **Graceful Failure Handler**: Interactive Chaos simulator demonstrating 504 Gateway drops, duplicate webhook replay attacks, and prompt injection exploits.
- **Autonomous Recovery**: 120ms Circuit Breaker, Idempotency token locking, and automated Smart Rescue Fallback links with zero lost merchant revenue.

---

## ⚡ Quick Start & How to Run

### Prerequisites

- Node.js (v18 or higher) & npm

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

_Backend runs on `http://localhost:5000` with WebSocket telemetry._

### 2. Start Frontend UI

```bash
cd frontend
npm install
npm run dev
```

_Frontend runs on `http://localhost:5173` with instant dark-mode Razorpay UI._

---

## 📐 System Architecture

```
[ External AI Buyers (AP2) ] <--- JSON-LD ---> [ Ingestion Gateway ]
[ Conversational Shoppers  ] <--- Socket.io -> [ RiskSense Core  ]
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼                                               ▼
               [ Risk & Guardrails Gate ]                      [ AI Growth Orchestrator ]
               - Max Discount Ceilings                         - Dynamic Upsell Engine
               - Min Margin Floors                             - Abandoned Cart Rescuer
               - Gated HITL Approval Queue                     - Campaign Telemetry
               - SHA256 CoT Audit Ledger                             │
                             │                                       ▼
                             └───────────────────────┬───────────────┘
                                                     ▼
                                     [ Razorpay Settlement Layer ]
                                     - Orders API & Standard Checkout
                                     - 120ms Circuit Breaker
                                     - Idempotency Webhook Deduplication
```

---

## 📁 Repository Structure

```
risksense/
├── backend/
│   ├── src/
│   │   ├── config.js                     # Environment & Guardrails config
│   │   ├── data/products.json            # Machine catalog with margins
│   │   ├── routes/api.js                 # REST & AP2 endpoints
│   │   ├── services/
│   │   │   ├── razorpayService.js        # Razorpay Orders & Verification
│   │   │   ├── agentCommerceService.js   # AP2 Protocol & Negotiations
│   │   │   ├── guardrailRiskService.js   # Bounded, Gated & Explainable CoT
│   │   │   ├── growthOrchestratorService.js # AI Co-Pilot & Campaigns
│   │   │   └── failureRecoveryService.js # 2 AM Incident & Circuit Breaker
│   │   └── server.js                     # Express & Socket.io server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                   # Navbar, Gated Modal, Checkout Modal
│   │   ├── pages/                        # Dashboard, Storefront, Arena, Guardrails, PostMortem
│   │   ├── App.jsx                       # State & WebSocket listener
│   │   └── index.css                     # Razorpay dark theme styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── POST_MORTEM_2AM.md                    # Detailed post-mortem report
├── DEMO_SCRIPT.md                        # 5-minute video pitch script
└── README.md
```
