# Multi-stage Dockerfile for Next.js (standalone output)

# 1) Build stage
FROM node:18-bullseye AS builder
WORKDIR /app

# Install deps
COPY package*.json ./

# Configure npm registry and timeouts (can be overridden at build time)
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm config set registry $NPM_REGISTRY \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 120000 \
    && npm -v \
    && node -v

# Install deps with fallback to official registry if mirror is flaky
RUN npm ci || (npm config set registry https://registry.npmjs.org && npm ci)

# Copy source
COPY . .

# Build production
RUN npm run build

# 2) Runtime stage (minimal)
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone output and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose default Next.js port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]