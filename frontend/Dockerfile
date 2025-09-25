# Stage 1: Build static assets
FROM node:22.12-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package management files first (for better caching)
COPY package*.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for reproducible builds)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the static assets for production
RUN pnpm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:alpine AS production

# Copy the built static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for optimal serving
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Health check to ensure nginx is serving content properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx to serve the static assets
CMD ["nginx", "-g", "daemon off;"]
