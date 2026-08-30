import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import apiRoutes from './routes/api.js';
import { guardrailRiskService } from './services/guardrailRiskService.js';
import { growthOrchestratorService } from './services/growthOrchestratorService.js';
import { agentCommerceService } from './services/agentCommerceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.io for real-time live events & telemetry
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach socket server to guardrail service for instant live event broadcasting
guardrailRiskService.setSocketServer(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/socket.io')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Production Static Serving (Single-Port Full-Stack Deployment)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const altDistPath = path.resolve(__dirname, '../public');

if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving production frontend build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  // Client-side routing fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else if (fs.existsSync(altDistPath)) {
  console.log(`📦 Serving production frontend build from: ${altDistPath}`);
  app.use(express.static(altDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(altDistPath, 'index.html'));
  });
}

// Socket.io Real-time connection handler
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Emit initial state snapshot
  socket.emit('initial_state', {
    guardrailMetrics: guardrailRiskService.getMetrics(),
    growthMetrics: growthOrchestratorService.getCampaignsAndMetrics(),
    recentAuditTrail: guardrailRiskService.getAuditTrail({ limit: 10 }),
    pendingApprovals: guardrailRiskService.getPendingApprovals()
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Periodic background live activity simulator for hackathon demo (generates organic agent traffic)
setInterval(() => {
  if (io.engine.clientsCount > 0) {
    const products = agentCommerceService.getRawProducts();
    if (products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomDiscount = Math.floor(Math.random() * 14) + 2; // 2% to 15% safe discount
      
      guardrailRiskService.evaluateMoneyAction({
        actionType: 'AGENT_BACKGROUND_PROPOSAL',
        agentId: `bot_crawler_${Math.floor(Math.random() * 900) + 100}`,
        productId: randomProduct.id,
        productName: randomProduct.name,
        originalPrice: randomProduct.price,
        wholesaleCost: randomProduct.wholesaleCost,
        requestedDiscountPercent: randomDiscount,
        quantity: Math.floor(Math.random() * 2) + 1
      });
    }
  }
}, 25000);

// Start server
const PORT = process.env.PORT || config.port || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 RiskSense Production Gateway Online!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💳 Razorpay Mode: ${config.razorpay.isSandbox ? 'SANDBOX SIMULATOR' : 'LIVE API'}`);
  console.log(`🛡️  Guardrails: Ceiling ${config.guardrails.maxDiscountPercent}%, Margin Floor ₹${config.guardrails.minProductMargin}`);
  console.log(`🔗 AP2 Machine Catalog: http://localhost:${PORT}/api/agent/catalog`);
  console.log('====================================================');
});
