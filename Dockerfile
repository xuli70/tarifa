# Build stage
FROM node:20-alpine AS builder

# Set CI environment for non-interactive pnpm
ENV CI=true

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline || pnpm install

# Copy source code
COPY . .

# Build for production
RUN pnpm build:prod

# Production stage - nginx for static serving
FROM nginx:alpine AS production

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check (use 127.0.0.1 to force IPv4)
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Use custom entrypoint to inject PIN_CODE env var
ENTRYPOINT ["/docker-entrypoint.sh"]
