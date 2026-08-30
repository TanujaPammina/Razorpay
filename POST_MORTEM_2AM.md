# 🕒 Post-Mortem Incident Report: What Broke at 2 AM & How We Got Out

**Date:** August 28, 2026, 02:14:22 UTC+05:30  
**Severity:** SEV-1 (Payment Gateway Disconnect & Asynchronous Webhook Replay Storm)  
**System:** RiskSense Autonomous Commerce & Settlement Gateway  
**MTTR (Mean Time to Recovery):** 4.2 seconds (Autonomous Self-Healing)  
**Total Financial Impact:** ₹0 Lost (₹142,500 in At-Risk Cart Volume Rescued)

---

## 1. Executive Summary

At 2:14 AM, during an autonomous flash procurement surge from external AP2 AI buyers, upstream network congestion caused consecutive 504 Gateway Timeouts on in-flight Razorpay order captures. Simultaneously, retry loops generated duplicate webhook replays.

Without human intervention, the **RiskSense Autonomous Circuit Breaker** tripped in 120ms, enforced cryptographic UUID idempotency locking, deduplicated all replayed events, and generated tokenized fallback rescue links, restoring full operational consistency with zero data loss.

---

## 2. What Broke at 2 AM

1. **Upstream Socket Timeout:** 14 high-value orders in flight suffered TCP socket severing before receipt confirmation arrived.
2. **Cascading Retry Storm:** Autonomous buyer agents dispatched rapid retries at 180 req/min, threatening database thread exhaustion and duplicate credit capture.
3. **Webhook Replay Vulnerability:** Replayed past `payment.captured` signatures arrived with valid legacy hashes.

---

## 3. How We Got Out (Self-Healing Architecture)

### Step 1: Autonomous Circuit Breaker (120ms)

- RiskSense detected three consecutive 504 timeout errors and automatically tripped the upstream payment circuit breaker.
- Shifted all active checkouts to an asynchronous write-ahead buffer.

### Step 2: Cryptographic Idempotency Lock

- Every order and negotiation bid was tied to a unique SHA256 idempotency key:
  $$\text{IdempotencyKey} = \text{HMAC-SHA256}(\text{orderId} \parallel \text{agentId} \parallel \text{timestamp})$$
- 48 duplicate agent retry requests were safely deduplicated with instant cached status responses.

### Step 3: Automated Smart Rescue Link Dispatch

- For interrupted buyer sessions, RiskSense generated a tokenized, self-healing Razorpay Smart Payment Link dispatched directly via AP2 protocol headers and email, preserving cart state and applied discounts.

### Step 4: Webhook Replay Filter & Ledger Reconciliation

- Incoming webhooks were verified for timestamp freshness ($\Delta t < 300\text{s}$). Stale replays were logged and rejected with HTTP 200 `ACK_DUPLICATE`.
- Once the gateway recovered, all buffered transactions reconciled against the tamper-proof SHA256 audit ledger.

---

## 4. Verification & Defense Guarantees

- **Zero Double-Fulfillment:** Cryptographic ledger verified 100% deduplication.
- **Explainable Audit Trail:** The entire incident trajectory, recovery triggers, and math equations are permanently stored in the audit ledger with tamper-proof signatures.
