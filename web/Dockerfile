#===============================================================================
# VICARITY WEB DOCKERFILE
#
# Multi-stage build:
# 1. Build React app with Node
# 2. Serve with minimal nginx image
#===============================================================================

# Stage 1: Build React app
FROM node:20-alpine as builder

WORKDIR /app

# Build arguments (passed from docker-compose)
ARG REACT_APP_API_URL=/api

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine as production

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S vicarity && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G vicarity vicarity && \
    chown -R vicarity:vicarity /usr/share/nginx/html && \
    chown -R vicarity:vicarity /var/cache/nginx && \
    chown -R vicarity:vicarity /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R vicarity:vicarity /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/index.html || exit 1

# Run as non-root
USER vicarity

CMD ["nginx", "-g", "daemon off;"]
