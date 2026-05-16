#!/bin/bash
# =============================================
# Backend Deployment Script
# =============================================
# Deploys the game backend Docker image to Kubernetes.
# Optionally configures Redis by setting the REDIS_URL env var.
#
# Usage:
#   ./scripts/deploy-backend.sh [REDIS_URL]
#
# Arguments:
#   REDIS_URL (optional)
#
# Examples:
#   # In-memory storage (default):
#   ./scripts/deploy-backend.sh
#
#   # Redis with password:
#   ./scripts/deploy-backend.sh "redis://:mypassword@redis.upstash.io:6379"
#
# Note:
#   Build the image first with: ./scripts/build-backend.sh
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"

IMAGE_NAME="fortisuno/game-backend:latest"
NAMESPACE="card-game"
DEPLOYMENT_NAME="game-backend"
HEALTH_URL="http://api-partybooster-hpe.rehiletehvac.com/health"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

REDIS_URL="${1:-}"

if [ -n "$REDIS_URL" ]; then
  info "Redis URL provided: $REDIS_URL"
else
  warn "No REDIS_URL provided. Backend will use in-memory storage."
fi

if ! command -v kubectl &> /dev/null; then
  err "kubectl is not installed or not in PATH."
fi

DEPLOYMENT_EXISTS=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" 2>/dev/null && echo "yes" || echo "no")

if [ "$DEPLOYMENT_EXISTS" = "no" ]; then
  warn "Deployment '$DEPLOYMENT_NAME' not found in namespace '$NAMESPACE'."
  info "Attempting to apply backend manifest..."

  MANIFEST_FILE="$BACKEND_DIR/k8s/deployment.yaml"
  if [ -f "$MANIFEST_FILE" ]; then
    kubectl apply -f "$MANIFEST_FILE"
    info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=180s || true
  else
    err "Manifest file not found at $MANIFEST_FILE. Please deploy the backend first."
  fi
fi

info "Updating Kubernetes deployment environment..."

if [ -n "$REDIS_URL" ]; then
  info "Setting REDIS_URL on deployment '$DEPLOYMENT_NAME'..."
  kubectl set env deployment/"$DEPLOYMENT_NAME" \
    -n "$NAMESPACE" \
    "REDIS_URL=$REDIS_URL"
else
  info "Clearing REDIS_URL on deployment '$DEPLOYMENT_NAME' (in-memory fallback)..."
  kubectl set env deployment/"$DEPLOYMENT_NAME" \
    -n "$NAMESPACE" \
    "REDIS_URL-"
fi

info "Restarting deployment '$DEPLOYMENT_NAME' in namespace '$NAMESPACE'..."

kubectl rollout restart deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=120s

info "Deployment rolled out successfully."

info "Verifying backend health..."

for i in 1 2 3; do
  sleep 3
  if curl -s "$HEALTH_URL" &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    info "Health check passed: $HEALTH_RESPONSE"
    break
  else
    if [ "$i" -eq 3 ]; then
      warn "Health check failed after 3 attempts. The pod may still be starting."
      warn "  URL: $HEALTH_URL"
      warn "  Check logs: kubectl logs -n $NAMESPACE deployment/$DEPLOYMENT_NAME"
    else
      warn "Health check attempt $i failed, retrying..."
    fi
  fi
done

echo ""
info "============================================="
info "  DEPLOYMENT COMPLETE"
info "============================================="
info ""
info "Image:     $IMAGE_NAME"
if [ -n "$REDIS_URL" ]; then
  info "Storage:   Redis ($REDIS_URL)"
else
  info "Storage:   In-memory (ephemeral)"
fi
info "Namespace: $NAMESPACE"
info "Health:    $HEALTH_URL"
info ""
info "Verify pods:"
info "  kubectl get pods -n $NAMESPACE"
info ""
info "View logs:"
info "  kubectl logs -n $NAMESPACE deployment/$DEPLOYMENT_NAME -f"
info "============================================="