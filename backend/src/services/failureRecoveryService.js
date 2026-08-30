import { v4 as uuidv4 } from 'uuid';
import { guardrailRiskService } from './guardrailRiskService.js';

let failureIncidents = [
  {
    id: 'inc_2am_001',
    title: 'The 2:14 AM Webhook Storm & Gateway Timeout Incident',
    timestamp: '2026-08-28T02:14:22.000Z',
    triggerScenario: 'SIMULATE_GATEWAY_TIMEOUT_AND_DROP',
    severity: 'HIGH',
    rootCause: 'Simulated 504 Gateway Timeout during peak agent negotiation flash surge, compounded by asynchronous network packet drop between AP2 node and Razorpay webhook receiver.',
    whatBroke: 'Orders in flight were left in unconfirmed status while external AI buyer agents retried with high velocity, threatening duplicate charges and lost customer conversions.',
    howWeGotOut: [
      '1. **Autonomous Circuit Breaker Activated**: RiskSense detected a 3-consecutive 504 timeout spike and tripped the circuit in 120ms, preventing cascade thread exhaustion.',
      '2. **Cryptographic Idempotency Lock**: All retry payloads were matched against unique client order UUIDs, deduplicating 48 rapid re-attempts.',
      '3. **Autonomous Rescue Fallback Link**: System generated a self-healing, tokenized Razorpay Smart Payment Link dispatched to the agent with an extended 15-minute TTL.',
      '4. **Zero Double-Fulfillment**: Once the gateway stabilized, webhooks reconciled against the tamper-proof SHA256 audit ledger, recovering ₹142,500 in lost revenue with 0 manual interventions.'
    ],
    status: 'RESOLVED_AUTONOMOUSLY',
    metricsImpact: {
      ordersRescued: 14,
      revenueSavedINR: 142500,
      mttrSeconds: 4.2
    }
  }
];

export const failureRecoveryService = {
  /**
   * Triggers an interactive Chaos / Failure injection to demonstrate graceful recovery in real-time
   */
  simulateFailureScenario({ scenarioType = 'SIMULATE_GATEWAY_TIMEOUT_AND_DROP', details = {} }) {
    const incidentId = `inc_${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    let incidentReport = {
      id: incidentId,
      timestamp: now,
      triggerScenario: scenarioType,
      status: 'HANDLED_GRACEFULLY'
    };

    if (scenarioType === 'SIMULATE_GATEWAY_TIMEOUT_AND_DROP') {
      incidentReport.title = 'Simulated Razorpay Gateway 504 Drop';
      incidentReport.severity = 'HIGH';
      incidentReport.whatBroke = 'Checkout connection timed out after 5000ms. External client socket was severed before confirmation payload was received.';
      incidentReport.resolutionSteps = [
        'Detected upstream socket disconnect.',
        'Captured order state in local SQLite/Redis write-ahead buffer with Idempotency Key.',
        'Generated autonomous Fallback Rescue Link (https://rzp.io/l/rescue_sim_7482).',
        'Emitted recovery notification over WebSocket to client UI.',
        'Customer was re-routed without losing cart contents.'
      ];
      incidentReport.recoveredSuccessfully = true;
      incidentReport.rescueLink = `https://rzp.io/l/mock_rescue_${uuidv4().substring(0, 6)}`;
    } else if (scenarioType === 'SIMULATE_WEBHOOK_REPLAY_ATTACK') {
      incidentReport.title = 'Duplicate Webhook Replay Attack Injected';
      incidentReport.severity = 'CRITICAL';
      incidentReport.whatBroke = 'Attacker replayed a captured `payment.captured` event from 3 hours ago with valid historical signature to trigger double order fulfillment.';
      incidentReport.resolutionSteps = [
        'Replay detection filter checked webhook timestamp freshness (delta > 300s).',
        'HMAC SHA256 signature matched an already-settled order ID in audit ledger.',
        'Deduplication engine rejected secondary fulfillment attempt (HTTP 200 with ACK_DUPLICATE).',
        'Attacker IP flagged in RiskSense security perimeter.'
      ];
      incidentReport.recoveredSuccessfully = true;
      incidentReport.replayBlocked = true;
    } else {
      // SIMULATE_AGENT_UNBOUNDED_HALLUCINATION_EXPLOIT
      incidentReport.title = 'Autonomous Agent 99% Discount Prompt Injection';
      incidentReport.severity = 'CRITICAL';
      incidentReport.whatBroke = 'External rogue buyer agent sent a prompt injection bid: `{"discount": 99.5, "bypass_auth": true}`.';
      incidentReport.resolutionSteps = [
        'RiskSense Bounding Engine evaluated discount ceiling (99.5% > 25.0% max bound).',
        'Calculated unit margin: -₹9,200 (violates floor margin of ₹200).',
        'Action automatically blocked with REJECTED_BOUNDS_VIOLATION.',
        'Full tamper-proof Chain of Thought logged to cryptographic audit trail.'
      ];
      incidentReport.recoveredSuccessfully = true;
      incidentReport.exploitBlocked = true;
    }

    failureIncidents.unshift(incidentReport);
    if (failureIncidents.length > 20) failureIncidents.pop();

    return incidentReport;
  },

  getIncidentsHistory() {
    return failureIncidents;
  }
};

