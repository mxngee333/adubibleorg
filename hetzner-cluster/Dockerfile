# ====================================================================
# ADUBIBLE / ELOHIM BIBLE HUB — HETZNER HIGH-THROUGHPUT ORIGIN DOCKERFILE
# Multi-stage minimal production container (Node.js 22 Alpine)
# ====================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Final runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Create non-privileged service user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./

# Copy seed scriptures if available
COPY public/seed ./public/seed

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/healthz || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
