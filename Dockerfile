# syntax=docker/dockerfile:1
# =============================================
# Multi-stage Dockerfile for @partybooster/backend
# Uses pnpm deploy for production artifact extraction
# =============================================

ARG REDIS_URL=

# =============================================
# Stage 1: Dependencies Installer
# =============================================
FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# =============================================
# Stage 2: Builder
# =============================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./tsconfig.base.json

RUN pnpm turbo run build --filter=@game/shared... --filter=@partybooster/backend...

RUN pnpm --filter=@partybooster/backend deploy --prod /prod/app

# =============================================
# Stage 3: Runner (production image)
# =============================================
FROM node:22-alpine AS runner

ARG REDIS_URL

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodeuser && adduser -S nodeuser -u 1001

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0 \
    REDIS_URL=${REDIS_URL}

WORKDIR /app

COPY --from=builder --chown=nodeuser:nodeuser /prod/app .

USER nodeuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["dumb-init", "node", "dist/server.js"]