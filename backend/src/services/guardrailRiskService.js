import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

// In-memory persistent collections
const auditLogTrail = [];
const pendingGatedApprovals = new Map();
const velocityTracker = new Map(); // ip/agentId -> [timestamps]

let socketServer = null;

export const guardrailRiskService = {
  setSocketServer(io) {
    socketServer = io;
  },

  /**
   * Evaluates a money action (Discount, Negotiation, Order, Refund)
   * Enforces strict Bounded limits, Gated approval triggers, and produces Explainable CoT
   */
  evaluateMoneyAction({
    actionType = 'AGENT_DISCOUNT_PROPOSAL',
    agentId = 'agent_external_001',
    productId,
    productName,
    originalPrice,
    wholesaleCost = 0,
    requestedDiscountPercent = 0,
    quantity = 1,
    clientIp = '127.0.0.1'
  }) {
    const totalOriginalAmount = originalPrice * quantity;
    const requestedDiscountAmount = (totalOriginalAmount * requestedDiscountPercent) / 100;
    const finalProposedAmount = totalOriginalAmount - requestedDiscountAmount;
    const totalWholesaleCost = wholesaleCost * quantity;
    const netProfitMargin = finalProposedAmount - totalWholesaleCost;
    const unitMargin = quantity > 0 ? netProfitMargin / quantity : 0;

    // Track velocity
    const now = Date.now();
    const agentHistory = velocityTracker.get(agentId) || [];
    const recentRequests = agentHistory.filter(t => now - t < 60000);
    recentRequests.push(now);
    velocityTracker.set(agentId, recentRequests);

    const velocitySpike = recentRequests.length > config.guardrails.maxVelocityPerMinute;

    // Risk factors evaluation
    const riskFactors = [];
    let riskScore = 10; // baseline low risk

    // 1. Check Ceiling Bound
    const exceedsMaxDiscount = requestedDiscountPercent > config.guardrails.maxDiscountPercent;
    if (exceedsMaxDiscount) {
      riskFactors.push({
        code: 'BOUND_DISCOUNT_CEILING_EXCEEDED',
        severity: 'CRITICAL',
        detail: `Requested discount ${requestedDiscountPercent}% exceeds hard ceiling of ${config.guardrails.maxDiscountPercent}%`
      });
      riskScore += 50;
    }

    // 2. Check Floor Bound (Margin Protection)
    const violatesMarginFloor = unitMargin < config.guardrails.minProductMargin;
    if (violatesMarginFloor) {
      riskFactors.push({
        code: 'BOUND_MARGIN_FLOOR_VIOLATION',
        severity: 'CRITICAL',
        detail: `Unit profit margin (₹${unitMargin.toFixed(2)}) is below mandatory floor (₹${config.guardrails.minProductMargin})`
      });
      riskScore += 45;
    }

    // 3. Check High-Value Threshold
    const isHighValue = finalProposedAmount >= config.guardrails.gatedThresholdAmount;
    if (isHighValue) {
      riskFactors.push({
        code: 'GATED_HIGH_VALUE_TRANSACTION',
        severity: 'MEDIUM',
        detail: `Transaction amount ₹${finalProposedAmount.toLocaleString('en-IN')} exceeds auto-approval threshold of ₹${config.guardrails.gatedThresholdAmount.toLocaleString('en-IN')}`
      });
      riskScore += 30;
    }

    // 4. Check Discount Gating
    const isGatedDiscount = requestedDiscountPercent >= config.guardrails.gatedDiscountThreshold && !exceedsMaxDiscount;
    if (isGatedDiscount) {
      riskFactors.push({
        code: 'GATED_HIGH_DISCOUNT_PERCENT',
        severity: 'MEDIUM',
        detail: `Discount ${requestedDiscountPercent}% is within absolute bounds but requires merchant human sign-off (threshold: ${config.guardrails.gatedDiscountThreshold}%)`
      });
      riskScore += 25;
    }

    // 5. Velocity Check
    if (velocitySpike) {
      riskFactors.push({
        code: 'VELOCITY_ANOMALY_SPIKE',
        severity: 'HIGH',
        detail: `Agent ${agentId} triggered ${recentRequests.length} actions in 60s (threshold: ${config.guardrails.maxVelocityPerMinute})`
      });
      riskScore += 35;
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    // Decision Logic
    let decision = 'AUTO_APPROVED';
    let rejectionReason = null;
    let requiresGatedApproval = false;

    if (exceedsMaxDiscount || violatesMarginFloor) {
      decision = 'REJECTED_BOUNDS_VIOLATION';
      rejectionReason = violatesMarginFloor 
        ? `Transaction would breach merchant unit floor margin of ₹${config.guardrails.minProductMargin}`
        : `Requested discount ${requestedDiscountPercent}% exceeds safe ceiling of ${config.guardrails.maxDiscountPercent}%`;
    } else if (isHighValue || isGatedDiscount || riskScore >= 45) {
      decision = 'GATED_PENDING_HITL';
      requiresGatedApproval = true;
    }

    // Generate Chain of Thought (CoT) Explanation
    const explanationCoT = [
      `[Step 1 - Parameter Ingestion]: Received proposal for "${productName}" (qty: ${quantity}) at original ₹${totalOriginalAmount.toLocaleString('en-IN')}, requested discount ${requestedDiscountPercent}%.`,
      `[Step 2 - Margin Equation]: Wholesale cost = ₹${totalWholesaleCost.toLocaleString('en-IN')}. Proposed net = ₹${finalProposedAmount.toLocaleString('en-IN')}. Expected unit margin = ₹${unitMargin.toFixed(2)} vs minimum floor ₹${config.guardrails.minProductMargin}.`,
      `[Step 3 - Risk & Boundary Check]: Ceiling check (${requestedDiscountPercent}% <= ${config.guardrails.maxDiscountPercent}%): ${!exceedsMaxDiscount ? 'PASSED' : 'FAILED'}. Floor check: ${!violatesMarginFloor ? 'PASSED' : 'FAILED'}. Risk score computed: ${riskScore}/100.`,
      `[Step 4 - Policy Execution]: ${
        decision === 'AUTO_APPROVED' 
          ? `Within all safe operational boundaries. Auto-approved for Razorpay order generation.`
          : decision === 'GATED_PENDING_HITL'
          ? `Triggered Gated Approval queue due to high value / elevated risk indicators. Held for merchant supervisor sign-off.`
          : `Hard boundary breach. Proposal rejected immediately to protect merchant treasury.`
      }`
    ];

    const actionId = `act_${uuidv4().substring(0, 10)}`;
    const auditRecord = {
      actionId,
      timestamp: new Date().toISOString(),
      actionType,
      agentId,
      productId,
      productName,
      pricing: {
        originalAmount: totalOriginalAmount,
        discountPercent: requestedDiscountPercent,
        discountAmount: requestedDiscountAmount,
        finalAmount: finalProposedAmount,
        wholesaleCost: totalWholesaleCost,
        netProfitMargin,
        unitMargin
      },
      riskScore,
      riskLevel: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'ELEVATED' : 'LOW',
      riskFactors,
      decision,
      rejectionReason,
      requiresGatedApproval,
      explanationCoT,
      auditHash: crypto
        .createHash('sha256')
        .update(`${actionId}|${agentId}|${finalProposedAmount}|${decision}|${new Date().toISOString()}`)
        .digest('hex')
    };

    // Store in audit trail (keep last 500 items)
    auditLogTrail.unshift(auditRecord);
    if (auditLogTrail.length > 500) auditLogTrail.pop();

    // If gated, queue for Human-in-the-Loop review
    if (requiresGatedApproval) {
      pendingGatedApprovals.set(actionId, {
        ...auditRecord,
        status: 'PENDING',
        createdAt: Date.now()
      });

      if (socketServer) {
        socketServer.emit('gated_approval_required', {
          actionId,
          record: auditRecord
        });
      }
    }

    // Real-time broadcast
    if (socketServer) {
      socketServer.emit('audit_log_created', auditRecord);
    }

    return auditRecord;
  },

  /**
   * Merchant Human-in-the-Loop Approval / Rejection
   */
  resolveGatedAction({ actionId, approved = true, reviewerNotes = 'Approved via Merchant Portal' }) {
    const pendingItem = pendingGatedApprovals.get(actionId);
    if (!pendingItem) {
      return { success: false, message: 'Approval item not found or already processed' };
    }

    pendingItem.status = approved ? 'APPROVED_BY_MERCHANT' : 'REJECTED_BY_MERCHANT';
    pendingItem.decision = approved ? 'HITL_APPROVED' : 'HITL_REJECTED';
    pendingItem.reviewerNotes = reviewerNotes;
    pendingItem.resolvedAt = new Date().toISOString();

    // Update in audit log trail
    const auditIndex = auditLogTrail.findIndex(a => a.actionId === actionId);
    if (auditIndex !== -1) {
      auditLogTrail[auditIndex].decision = pendingItem.decision;
      auditLogTrail[auditIndex].reviewerNotes = reviewerNotes;
      auditLogTrail[auditIndex].explanationCoT.push(
        `[Step 5 - HITL Resolution]: Merchant Supervisor manually ${approved ? 'APPROVED' : 'REJECTED'} action. Notes: "${reviewerNotes}".`
      );
    }

    pendingGatedApprovals.delete(actionId);

    if (socketServer) {
      socketServer.emit('gated_approval_resolved', {
        actionId,
        approved,
        record: pendingItem
      });
      socketServer.emit('audit_log_updated', auditLogTrail[auditIndex]);
    }

    return {
      success: true,
      actionId,
      approved,
      record: pendingItem
    };
  },

  getAuditTrail({ limit = 50, filterType } = {}) {
    let list = auditLogTrail;
    if (filterType) {
      list = list.filter(i => i.actionType === filterType || i.decision === filterType);
    }
    return list.slice(0, limit);
  },

  getPendingApprovals() {
    return Array.from(pendingGatedApprovals.values());
  },

  getMetrics() {
    const total = auditLogTrail.length;
    const approved = auditLogTrail.filter(a => a.decision.includes('APPROVED')).length;
    const gated = auditLogTrail.filter(a => a.decision.includes('GATED') || a.requiresGatedApproval).length;
    const rejected = auditLogTrail.filter(a => a.decision.includes('REJECTED')).length;
    const totalVolumeProtected = auditLogTrail
      .filter(a => a.decision.includes('REJECTED'))
      .reduce((sum, a) => sum + (a.pricing?.originalAmount || 0), 0);

    return {
      totalActionsEvaluated: total,
      autoApprovedCount: approved,
      gatedApprovalCount: gated,
      rejectedCount: rejected,
      pendingQueueSize: pendingGatedApprovals.size,
      totalVolumeProtectedINR: totalVolumeProtected,
      currentCeilingPercent: config.guardrails.maxDiscountPercent,
      currentFloorMarginINR: config.guardrails.minProductMargin
    };
  }
};

