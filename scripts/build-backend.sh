#!/bin/bash
# =============================================
# Backend Build Script
# =============================================
# Builds the game backend Docker image (no push).
# Use for Railway deployment or local testing.
#
# Usage:
#   ./scripts/build-backend.sh [REDIS_URL]
#
# Arguments:
#   REDIS_URL (optional) - If provided, bakes into image at build time
#
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOCAL_IMAGE="partybooster-hpe-backend:latest"
REMOTE_IMAGE="fortisuno/partybooster-hpe-backend:latest"
REDIS_URL="${1:-}"

if [ -n "$REDIS_URL" ]; then
  info "Redis URL provided: $REDIS_URL"
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  err "Docker is not installed or not in PATH."
fi

info "Building Docker image for linux/amd64..."
info "  Image: $LOCAL_IMAGE"
info "  Context: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

BUILD_ARGS="--load"
if [ -n "$REDIS_URL" ]; then
  BUILD_ARGS="$BUILD_ARGS --build-arg REDIS_URL=$REDIS_URL"
fi

docker build \
  -t "$LOCAL_IMAGE" \
  $BUILD_ARGS \
  "$PROJECT_ROOT"

info "Tagging image for registry..."
docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"

info "Pushing image to registry..."
docker push "$REMOTE_IMAGE"

info "Image built and pushed successfully."