# syntax=docker/dockerfile:1

# =============================================
# Stage 1: Builder
# =============================================
FROM node:22-alpine AS builder

# Install pnpm via corepack (official Node.js method, no curl/npm involved)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace definition files first for maximum layer cache efficiency.
# pnpm fetch will download packages into its store; this layer only
# invalidates when lockfile or any package.json changes.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm fetch --frozen-lockfile

# Copy full source (this layer invalidates on any code change)
COPY . .

# Install: links packages from the store without network access if cache is warm.
# The --frozen-lockfile flag guarantees the lockfile is respected.
RUN pnpm install --frozen-lockfile

# Build all packages. Turbo topologically sorts: shared builds first (^build),
# then backend. The --filter scope limits to only what we need.
RUN pnpm turbo run build --filter=@partybooster/backend...

# Deploy extracts the backend package into a standalone production directory.
# - Resolves workspace:* dependencies into real node_modules entries
# - Prunes devDependencies
# - The result at /prod/app is self-contained and portable
RUN pnpm --filter=@partybooster/backend deploy --prod /prod/app

# =============================================
# Stage 2: Runner (production image)
# =============================================
FROM node:22-alpine AS runner

# dumb-init: proper PID 1 signal handling.
# Without it, Node.js doesn't receive SIGTERM correctly on container stop,
# and zombie processes can accumulate.
RUN apk add --no-cache dumb-init

# Create a dedicated non-root user (UID/GID 1001) to avoid running as root.
# This follows security best practices and aligns with Kubernetes/OCP norms.
RUN addgroup -g 1001 -S nodeuser && adduser -S nodeuser -u 1001

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

# Copy only the deployed, production-ready artifact from the builder stage.
# This excludes all source code, build tools, and devDependencies.
COPY --from=builder --chown=nodeuser:nodeuser /prod/app .

# Switch to non-root user for runtime execution.
USER nodeuser

# Document the port the application listens on.
EXPOSE 3000

# Run the application via dumb-init so signals (SIGTERM, SIGINT) propagate
# correctly to the Node.js process. This ensures clean shutdown on container stop.
ENTRYPOINT ["dumb-init", "node", "dist/server.js"]