# ---- Stage 1: Builder ----
# Use a more stable Node.js LTS version
FROM node:22.4.0-alpine AS builder
ARG stage=unstable
# Set working directory
WORKDIR /app

# Install necessary system dependencies (install in advance to optimize caching)
RUN apk update && apk upgrade && \
    apk add --no-cache \
    build-base \
    bash \
    curl \
    git \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Install pnpm and global tools
RUN npm install -g node-gyp nx@21.3.10 corepack@latest
RUN corepack enable && corepack prepare yarn@4.2.2 --activate && corepack prepare pnpm@10.14.0 --activate

# Copy dependency definition files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/host/package.json apps/host/yarn.lock ./apps/host/
COPY apps/futures/package.json ./apps/futures/
COPY libs/design-system/package.json ./libs/design-system/

# Install dependencies
RUN pnpm install
RUN cd apps/host && yarn install

# Copy the rest of the source code
COPY . .

# Add env variable to run plugin
ENV CI_ENVIRONMENT=${stage}

# Build the application
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN pnpm nx build host-app --mode ${stage}

# If you need to build futures-app, uncomment the line below
# RUN pnpm nx build futures-app --configuration=production

# ---- Stage 2: Runner ----
FROM nginx:1.29.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy build artifacts from the builder stage
# Note: Confirm the actual output path
VOLUME /app
COPY --from=builder /app/apps/host/dist /app

# Expose port
EXPOSE 80

# Start Nginx
COPY apps/host/entrypoint.sh /
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
