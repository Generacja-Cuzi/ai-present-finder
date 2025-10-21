# Build stage
FROM node:22-alpine AS builder

ENV CI=true
# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all backend services
COPY backend ./backend
COPY core ./core

# Install dependencies and build all services in one layer to optimize caching
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

# Production stage
FROM node:22-alpine

# Install pnpm and process manager
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate && \
  npm install -g pm2@5.4.2

WORKDIR /app

# Copy built artifacts and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/core ./core

# Copy PM2 ecosystem file
COPY deployment/ecosystem.config.cjs ./ecosystem.config.cjs

# Expose ports (for documentation, not used by Coolify)
EXPOSE 3000 3010 3020 3030 3040 3050 8011 8012 8013 8014

# Health check on main REST API
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start all services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
