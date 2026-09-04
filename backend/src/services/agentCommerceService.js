import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { razorpayService } from './razorpayService.js';
import { guardrailRiskService } from './guardrailRiskService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let productsData = [];

// Load products
try {
  const fileContent = await readFile(join(__dirname, '../data/products.json'), 'utf-8');
  productsData = JSON.parse(fileContent);
} catch (e) {
  console.warn('[AgentCommerceService] Could not read products.json:', e.message);
}

export const agentCommerceService = {
  getRawProducts() {
    return productsData;
  },

  getProductById(id) {
    return productsData.find(p => p.id === id);
  },

  /**
   * Generates AP2 / JSON-LD Agent-Readable Machine Catalog
   */
  getMachineReadableCatalog({ baseUrl = 'http://localhost:5000' } = {}) {
    return {
      "@context": "https://schema.org",
      "@type": "DataCatalog",
      "protocol": "AP2/Agentic-Commerce-v1.0",
      "standard": "NPCI-UAP-Compatible",
      "merchant": {
        "@type": "Organization",
        "name": "RiskSense Autonomous Storefront",
        "settlementGateway": "Razorpay",
        "currency": "INR",
        "negotiationEndpoint": `${baseUrl}/api/agent/negotiate`,
        "checkoutEndpoint": `${baseUrl}/api/agent/checkout`,
        "supportedPaymentMethods": ["razorpay_order", "x402_micropayment", "upi_intent", "tokenized_mandate"]
      },
      "agentGuardrails": {
        "maxNegotiableDiscountPercent": 25.0,
        "requiresHitlAboveAmountINR": 50000,
        "idempotencyEnforced": true
      },
      "items": productsData.map(product => ({
        "@type": "Product",
        "sku": product.id,
        "name": product.name,
        "category": product.category,
        "description": product.description,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "listPrice": product.price,
          "minAcceptablePrice": Math.round(product.wholesaleCost + 200),
          "inventoryLevel": product.stock,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "negotiationAllowed": product.agentNegotiable,
          "maxAgentDiscount": product.maxCustomDiscount
        },
        "semanticTags": product.tags,
        "rating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewsCount
        }
      }))
    };
  },

  /**
   * Process an AP2 Agent Negotiation Bid
   */
  async processAgentNegotiation({
    agentId = 'autonomous_buyer_agent_42',
    agentName = 'AutoProcure AI',
    productId,
    quantity = 1,
    proposedDiscountPercent = 10,
    requestedDiscountPercent,
    clientContext = {}
  }) {
    const discount = Number(requestedDiscountPercent !== undefined ? requestedDiscountPercent : proposedDiscountPercent);
    const product = this.getProductById(productId);
    if (!product) {
      return {
        status: 'ERROR',
        message: `Product ID "${productId}" not found in agent catalog.`
      };
    }

    // Evaluate against Risk & Guardrails engine
    const evaluation = guardrailRiskService.evaluateMoneyAction({
      actionType: 'AGENT_DISCOUNT_PROPOSAL',
      agentId,
      productId: product.id,
      productName: product.name,
      originalPrice: product.price,
      wholesaleCost: product.wholesaleCost,
      requestedDiscountPercent: discount,
      quantity: Number(quantity),
      clientIp: clientContext.ip || '127.0.0.1'
    });

    let negotiationResult = {
      negotiationId: `neg_${uuidv4().substring(0, 10)}`,
      agentId,
      agentName,
      productId: product.id,
      productName: product.name,
      quantity: Number(quantity),
      requestedDiscountPercent: discount,
      evaluation
    };

    if (evaluation.decision === 'AUTO_APPROVED') {
      negotiationResult.status = 'ACCEPTED';
      negotiationResult.agreedDiscountPercent = discount;
      negotiationResult.agreedTotalAmount = evaluation.pricing.finalAmount;
      negotiationResult.quoteToken = `quote_${uuidv4().replace(/-/g, '')}`;
      negotiationResult.validUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      negotiationResult.nextAction = {
        endpoint: '/api/agent/checkout',
        method: 'POST',
        payload: {
          quoteToken: negotiationResult.quoteToken,
          productId: product.id,
          quantity: Number(quantity),
          finalAmount: negotiationResult.agreedTotalAmount,
          agentId
        }
      };
    } else if (evaluation.decision === 'GATED_PENDING_HITL') {
      negotiationResult.status = 'HELD_FOR_MERCHANT_REVIEW';
      negotiationResult.message = 'Bid exceeds autonomous risk threshold; routed to merchant supervisor for 60s real-time review.';
      negotiationResult.actionId = evaluation.actionId;
    } else {
      // REJECTED_BOUNDS_VIOLATION -> formulate smart autonomous counter-offer
      const safeMaxDiscount = Math.min(product.maxCustomDiscount, 15.0);
      const safeFinalAmount = (product.price * Number(quantity)) * (1 - safeMaxDiscount / 100);

      negotiationResult.status = 'COUNTER_OFFER';
      negotiationResult.rejectionReason = evaluation.rejectionReason;
      negotiationResult.counterProposal = {
        counterDiscountPercent: safeMaxDiscount,
        counterTotalAmount: safeFinalAmount,
        reasoning: `Your requested discount breached profit margin boundaries. We offer our best bounded rate of ${safeMaxDiscount}% with instant Razorpay checkout.`
      };
    }

    return negotiationResult;
  },

  /**
   * Process Agentic Checkout & Razorpay Order Generation
   */
  async processAgentCheckout({
    agentId = 'autonomous_buyer_agent_42',
    productId,
    quantity = 1,
    finalAmount,
    discountPercent = 0,
    notes = {}
  }) {
    const product = this.getProductById(productId);
    const amountToCharge = finalAmount || (product ? product.price * quantity : 5000);

    // Create Razorpay Order
    const orderResult = await razorpayService.createOrder({
      amount: amountToCharge,
      receipt: `rcpt_agent_${uuidv4().substring(0, 8)}`,
      notes: {
        ...notes,
        agentId,
        productId: product ? product.id : productId,
        productName: product ? product.name : 'Custom Item',
        quantity,
        discountPercent,
        protocol: 'AP2/x402-Razorpay'
      }
    });

    // Record in Risk & Audit Engine as Order Creation
    guardrailRiskService.evaluateMoneyAction({
      actionType: 'ORDER_EXECUTION',
      agentId,
      productId: product ? product.id : productId,
      productName: product ? product.name : 'Custom Item',
      originalPrice: product ? product.price : amountToCharge,
      wholesaleCost: product ? product.wholesaleCost : amountToCharge * 0.6,
      requestedDiscountPercent: Number(discountPercent),
      quantity: Number(quantity)
    });

    return {
      success: true,
      protocol: 'AP2-Razorpay-Checkout',
      order: orderResult.order,
      isSandbox: orderResult.isSandbox,
      x402Headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Gateway': 'Razorpay',
        'X-Payment-Order-Id': orderResult.order.id,
        'X-Payment-Amount': orderResult.order.amount,
        'X-Payment-Currency': 'INR'
      }
    };
  }
};

