# ====================================================================
# ADUBIBLE PRODUCTION DOCKERFILE (COOLIFY / DOCKER DEPLOYMENT)
# Multi-stage minimal production container (Node.js 22 Alpine)
# ====================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application source & build static distribution + SSG
COPY . ./
RUN npm run build

# Stage 2: Minimal runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Serve compiled static output on port 3000
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
