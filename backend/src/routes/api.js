import express from 'express';
import { agentCommerceService } from '../services/agentCommerceService.js';
import { guardrailRiskService } from '../services/guardrailRiskService.js';
import { growthOrchestratorService } from '../services/growthOrchestratorService.js';
import { failureRecoveryService } from '../services/failureRecoveryService.js';
import { razorpayService } from '../services/razorpayService.js';

const router = express.Router();

// Health Check & Status
router.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'RiskSense AI Gateway',
    timestamp: new Date().toISOString(),
    razorpay: razorpayService.getStatus(),
    guardrails: guardrailRiskService.getMetrics()
  });
});

// Products List
router.get('/products', (req, res) => {
  res.json({
    success: true,
    products: agentCommerceService.getRawProducts()
  });
});

// AP2 Machine-Readable Catalog
router.get('/agent/catalog', (req, res) => {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const catalog = agentCommerceService.getMachineReadableCatalog({
    baseUrl: `${protocol}://${host}`
  });
  res.setHeader('Content-Type', 'application/ld+json');
  res.json(catalog);
});

// AP2 Agent Negotiation Bid
router.post('/agent/negotiate', async (req, res) => {
  try {
    const { agentId, agentName, productId, quantity, proposedDiscountPercent } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    const result = await agentCommerceService.processAgentNegotiation({
      agentId,
      agentName,
      productId,
      quantity,
      proposedDiscountPercent,
      clientContext: { ip: clientIp }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AP2 Agent Checkout & Order
router.post('/agent/checkout', async (req, res) => {
  try {
    const { agentId, productId, quantity, finalAmount, discountPercent } = req.body;
    const result = await agentCommerceService.processAgentCheckout({
      agentId,
      productId,
      quantity,
      finalAmount,
      discountPercent
    });

    if (result.x402Headers) {
      Object.entries(result.x402Headers).forEach(([header, value]) => {
        res.setHeader(header, value);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Conversational Shopping Assistant Chat
router.post('/chat/message', (req, res) => {
  try {
    const { message, cart } = req.body;
    const response = growthOrchestratorService.processConversationalPrompt({
      message: message || '',
      cart: cart || []
    });
    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upsell Recommendations
router.post('/growth/upsell', (req, res) => {
  try {
    const { cart } = req.body;
    const recommendations = growthOrchestratorService.getUpsellRecommendations(cart || []);
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay Storefront Order Creation
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, cartItems = [], discountPercent = 0 } = req.body;

    // Check through Guardrail / Risk evaluator first!
    const originalAmount = amount / (1 - (discountPercent || 0) / 100);
    const evaluation = guardrailRiskService.evaluateMoneyAction({
      actionType: 'STOREFRONT_CHECKOUT_ORDER',
      agentId: 'storefront_shopper',
      productId: cartItems[0]?.id || 'multi_item_cart',
      productName: cartItems.map(i => i.name).join(', ') || 'Custom Cart',
      originalPrice: originalAmount,
      wholesaleCost: originalAmount * 0.65,
      requestedDiscountPercent: discountPercent,
      quantity: 1,
      clientIp: req.ip
    });

    if (evaluation.decision === 'REJECTED_BOUNDS_VIOLATION') {
      return res.status(400).json({
        success: false,
        error: 'Order rejected by RiskSense guardrail rules.',
        evaluation
      });
    }

    const orderResult = await razorpayService.createOrder({
      amount: amount,
      receipt: `rec_${Date.now().toString().slice(-8)}`,
      notes: {
        cartCount: cartItems.length,
        discountApplied: `${discountPercent}%`,
        riskScore: evaluation.riskScore,
        auditId: evaluation.actionId
      }
    });

    res.json({
      success: true,
      order: orderResult.order,
      isSandbox: orderResult.isSandbox,
      evaluation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay Payment Verification
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const isValid = razorpayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const payment = await razorpayService.processPaymentCapture({
      orderId,
      paymentId
    });

    res.json({
      success: true,
      verified: true,
      payment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Razorpay Webhooks Endpoint
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const event = req.body.event || 'payment.captured';
    const payload = req.body.payload || {};

    console.log(`[Webhook Receiver] Received event: ${event}`);

    // Verify and handle
    res.status(200).json({ status: 'OK', eventReceived: event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardrails & Audit Trail
router.get('/guardrails/audit-trail', (req, res) => {
  const { limit, filter } = req.query;
  const trail = guardrailRiskService.getAuditTrail({
    limit: limit ? parseInt(limit) : 50,
    filterType: filter
  });
  res.json({ success: true, count: trail.length, auditTrail: trail });
});

router.get('/guardrails/pending-approvals', (req, res) => {
  const pending = guardrailRiskService.getPendingApprovals();
  res.json({ success: true, pending });
});

router.post('/guardrails/resolve-action', (req, res) => {
  const { actionId, approved, reviewerNotes } = req.body;
  const result = guardrailRiskService.resolveGatedAction({
    actionId,
    approved: Boolean(approved),
    reviewerNotes
  });
  res.json(result);
});

router.get('/guardrails/metrics', (req, res) => {
  res.json({
    success: true,
    metrics: guardrailRiskService.getMetrics()
  });
});

// Growth & Campaigns
router.get('/growth/metrics', (req, res) => {
  const data = growthOrchestratorService.getCampaignsAndMetrics();
  res.json({ success: true, ...data });
});

router.post('/growth/rescue-cart', (req, res) => {
  const { customerEmail, cartValue } = req.body;
  const rescue = growthOrchestratorService.triggerAbandonedCartRescue({
    customerEmail,
    cartValue
  });
  res.json({ success: true, rescue });
});

// Failure & Chaos Simulator ("What broke at 2 AM")
router.post('/failure/simulate', (req, res) => {
  const { scenarioType, details } = req.body;
  const report = failureRecoveryService.simulateFailureScenario({
    scenarioType,
    details
  });
  res.json({ success: true, incident: report });
});

router.get('/failure/history', (req, res) => {
  res.json({
    success: true,
    incidents: failureRecoveryService.getIncidentsHistory()
  });
});

export default router;

