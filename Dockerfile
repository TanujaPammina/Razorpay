# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Setup the Node.js Production Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets to the expected location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Start the full-stack server
CMD ["node", "backend/src/server.js"]
