# 🚀 RiskSense — Production Deployment Guide

RiskSense is architected for **zero-friction, 1-click deployment** across all major cloud providers.

---

## ⚡ Option 1: Render (Recommended — Free Tier Web Service)

1. Push your repository to **GitHub**.
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](./render.yaml). If setting up manually:
   - **Environment:** `Node`
   - **Build Command:** `npm run postinstall`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add (optional for live keys, defaults to mock test mode):
   - `RAZORPAY_KEY_ID`: `your_key_id`
   - `RAZORPAY_KEY_SECRET`: `your_key_secret`
   - `RAZORPAY_WEBHOOK_SECRET`: `your_webhook_secret`
6. Click **Create Web Service**. Your live URL will be generated!

---

## ⚡ Option 2: Railway (1-Click Fullstack)

1. Go to [railway.app](https://railway.app/) → **New Project** → **Deploy from GitHub repo**.
2. Select your repository.
3. Railway will automatically detect the [`Procfile`](./Procfile) and [`package.json`](./package.json).
4. Click **Deploy**.

---

## ⚡ Option 3: Docker & Docker Compose

Deploy on any Cloud VPS (AWS EC2, DigitalOcean, Hetzner, GCP) with a single command:

```bash
# Clone repository
git clone https://github.com/your-username/risksense.git
cd risksense

# Build and run the container
docker compose up -d --build
```
*Your entire app will be live at `http://YOUR_SERVER_IP:5000`.*

---

## ⚡ Option 4: Vercel

1. Import the repository in [vercel.com](https://vercel.com).
2. Vercel will automatically configure routing using [`vercel.json`](./vercel.json).
3. Click **Deploy**.

---

## 📋 Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port number assigned by the host |
| `NODE_ENV` | `production` | Production environment flag |
| `RAZORPAY_KEY_ID` | `rzp_test_mock_...` | Razorpay Test/Live Key ID |
| `RAZORPAY_KEY_SECRET` | `mock_secret_...` | Razorpay Test/Live Secret |
| `RAZORPAY_WEBHOOK_SECRET` | `webhook_secret_...` | Secret for webhook signature verification |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key for dynamic LLM reasoning |

---

## 🧪 Production Verification Check
Once deployed, verify your endpoints:
- **UI:** `https://your-domain.com/`
- **Health Check:** `https://your-domain.com/api/health`
- **AP2 Machine Catalog:** `https://your-domain.com/api/agent/catalog`
