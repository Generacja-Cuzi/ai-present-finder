# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package files
COPY frontend/package.json ./frontend/

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile --filter frontend...

# Copy frontend source files
COPY frontend ./frontend

# Build the frontend application
RUN pnpm --filter frontend build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
