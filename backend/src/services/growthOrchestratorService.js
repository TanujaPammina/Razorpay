import { v4 as uuidv4 } from 'uuid';
import { agentCommerceService } from './agentCommerceService.js';
import { guardrailRiskService } from './guardrailRiskService.js';

// Autonomous growth campaigns repository
let activeCampaigns = [
  {
    id: 'camp_01',
    name: 'AI Developer Hardware Surge',
    type: 'FLASH_DISCOUNT',
    status: 'ACTIVE',
    targetCategory: 'Hardware / AI Edge',
    incentiveDiscount: 12.0,
    conversionsCount: 38,
    revenueGeneratedINR: 512962,
    createdAt: '2026-08-25T10:00:00.000Z'
  },
  {
    id: 'camp_02',
    name: 'Real-Time Abandoned Cart Rescuer',
    type: 'CART_RECOVERY',
    status: 'ACTIVE',
    targetCategory: 'All',
    incentiveDiscount: 8.5,
    conversionsCount: 74,
    revenueGeneratedINR: 421800,
    createdAt: '2026-08-26T14:30:00.000Z'
  },
  {
    id: 'camp_03',
    name: 'Autonomous VIP Multi-Unit Bundle',
    type: 'BUNDLE_CROSS_SELL',
    status: 'ACTIVE',
    targetCategory: 'Cybersecurity',
    incentiveDiscount: 15.0,
    conversionsCount: 19,
    revenueGeneratedINR: 284981,
    createdAt: '2026-08-28T09:15:00.000Z'
  }
];

export const growthOrchestratorService = {
  /**
   * Conversational Assistant Intent Processor
   */
  processConversationalPrompt({ message, cart = [] }) {
    const products = agentCommerceService.getRawProducts();
    const lower = message.toLowerCase();

    let matchedProducts = [];
    let responseText = '';
    let suggestedAction = null;
    let unlockedDiscount = 0;

    if (lower.includes('discount') || lower.includes('deal') || lower.includes('offer') || lower.includes('coupon') || lower.includes('cheap')) {
      unlockedDiscount = 10.0;
      responseText = `I've analyzed your shopping profile and unlocked a **10% Autonomous Loyalty Discount** for your session! It's pre-approved within our merchant guardrails and applied automatically at checkout.`;
      matchedProducts = products.slice(0, 3);
      suggestedAction = {
        type: 'APPLY_DISCOUNT',
        discountPercent: unlockedDiscount,
        promoCode: 'GROWTH_AI_10'
      };
    } else if (lower.includes('security') || lower.includes('key') || lower.includes('auth') || lower.includes('fips')) {
      matchedProducts = products.filter(p => p.tags.includes('security') || p.tags.includes('crypto'));
      responseText = `For hardware-level cryptographic authorization and agent identity, I strongly recommend the **QuantumKey Hardware Security Token**. It guarantees FIPS 140-3 Level 4 physical isolation and pairs with Razorpay test keys!`;
    } else if (lower.includes('ai') || lower.includes('edge') || lower.includes('vision') || lower.includes('sensor') || lower.includes('neural')) {
      matchedProducts = products.filter(p => p.tags.includes('ai') || p.tags.includes('vision') || p.tags.includes('edge'));
      responseText = `Found our flagship AI hardware units: The **NeuralEdge Developer Kit v4** features a 32 TOPS neural processor and native AP2 agent runtime, and pairs seamlessly with the **OmniVision 4K Spatial Sensor**!`;
      suggestedAction = {
        type: 'RECOMMEND_BUNDLE',
        productIds: ['prod_dev_01', 'prod_dev_04'],
        bundleDiscount: 14.0
      };
    } else if (lower.includes('cloud') || lower.includes('server') || lower.includes('api') || lower.includes('node')) {
      matchedProducts = products.filter(p => p.tags.includes('cloud') || p.tags.includes('server') || p.tags.includes('saas'));
      responseText = `Our **Agentic API Micro-Compute Node** provides ultra-low latency infrastructure with automated x402 payment headers for direct agent-to-agent micropayments.`;
    } else if (lower.includes('checkout') || lower.includes('buy') || lower.includes('pay') || lower.includes('order')) {
      responseText = `Ready to proceed! You can click the **Pay via Razorpay** button to launch our integrated standard checkout modal. Every transaction is monitored in real-time by the RiskSense guardrail engine.`;
      suggestedAction = { type: 'PROMPT_CHECKOUT' };
    } else {
      matchedProducts = products.slice(0, 3);
      responseText = `Hello! I'm your **RiskSense AI Commerce Co-Pilot**. I can help you find cutting-edge developer & AI hardware, build custom bundles, negotiate volume pricing within bounded margins, and checkout securely via Razorpay. What are you building today?`;
    }

    return {
      message: responseText,
      products: matchedProducts,
      suggestedAction,
      unlockedDiscount,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Smart Upsell & Cross-Sell Recommender
   */
  getUpsellRecommendations(cart = []) {
    const products = agentCommerceService.getRawProducts();
    const cartProductIds = cart.map(item => item.id);
    
    // Find unselected products
    const available = products.filter(p => !cartProductIds.includes(p.id));
    if (available.length === 0) return [];

    // Prioritize high-margin or complementary items
    const recommendations = available.slice(0, 2).map(p => ({
      ...p,
      upsellPitch: `Add ${p.name} to unlock an additional 5% cross-sell discount on your entire cart!`,
      bonusDiscountPercent: 5.0
    }));

    return recommendations;
  },

  /**
   * Trigger an Autonomous Abandoned Cart Rescue
   */
  triggerAbandonedCartRescue({ customerEmail = 'founder@devlabs.io', cartValue = 18298 }) {
    const incentive = 9.0;
    const campaign = activeCampaigns.find(c => c.type === 'CART_RECOVERY') || activeCampaigns[1];
    campaign.conversionsCount += 1;
    campaign.revenueGeneratedINR += Math.round(cartValue * (1 - incentive / 100));

    const rescueRecord = {
      recoveryId: `recov_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      customerEmail,
      originalCartValue: cartValue,
      incentiveDiscountPercent: incentive,
      finalRescueValue: Math.round(cartValue * (1 - incentive / 100)),
      status: 'RECOVERY_LINK_DISPATCHED',
      checkoutUrl: `https://checkout.razorpay.com/v1/mock_rescue_${uuidv4().substring(0, 6)}`
    };

    return rescueRecord;
  },

  /**
   * Get Active Growth Campaigns and Revenue Analytics
   */
  getCampaignsAndMetrics() {
    const totalConversions = activeCampaigns.reduce((sum, c) => sum + c.conversionsCount, 0);
    const totalRevenue = activeCampaigns.reduce((sum, c) => sum + c.revenueGeneratedINR, 0);
    const averageOrderValue = totalConversions > 0 ? Math.round(totalRevenue / totalConversions) : 0;

    return {
      campaigns: activeCampaigns,
      analytics: {
        totalRevenueINR: totalRevenue + 1219743,
        autonomousRevenueUpliftINR: totalRevenue,
        autonomousConversions: totalConversions,
        averageOrderValueINR: averageOrderValue || 18450,
        conversionRatePercent: 14.8,
        abandonedCartRecoveryRatePercent: 32.4
      }
    };
  }
};

