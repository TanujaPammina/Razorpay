import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_1234567890',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_abcdef123456',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_xyz789',
    currency: 'INR',
    merchantName: 'RiskSense Nexus Store',
    isSandbox: !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('mock')
  },
  guardrails: {
    maxDiscountPercent: 25.0, // Hard ceiling for agent autonomous negotiations
    minProductMargin: 200,    // Hard price floor above wholesale cost in INR
    gatedThresholdAmount: 50000, // INR value triggering Human-in-the-Loop review
    gatedDiscountThreshold: 18.0, // Discount % triggering Human-in-the-Loop review
    maxDailyAgentBudget: 250000, // Daily budget limit for autonomous promotional credits
    maxVelocityPerMinute: 60     // Rate limiter for AP2 external agent requests
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || null,
    modelName: 'gemini-1.5-flash'
  }
};

