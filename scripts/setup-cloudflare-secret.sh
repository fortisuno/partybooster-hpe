#!/bin/bash
# =============================================
# Cloudflare Tunnel Credentials Setup Script
# =============================================
# This script:
#   1. Verifies cloudflared CLI is installed
#   2. Creates a Cloudflare Tunnel if no credentials exist
#   3. Creates the tunnel-credentials Kubernetes Secret
#   4. Prints the TUNNEL_UUID to use in cloudflared.yaml
#
# Usage:
#   ./scripts/setup-cloudflare-secret.sh
#
# Prerequisites:
#   - cloudflared CLI installed (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/)
#   - kubectl configured to access your k0s cluster
#   - Cloudflare account with 'rehiletehvac.com' domain added
# =============================================

set -e

TUNNEL_NAME="partybooster-hpe"
NAMESPACE="cloudflare"
SECRET_NAME="tunnel-credentials"

# ---- Color output helpers ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()     { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ---- Check prerequisites ----
info "Checking prerequisites..."

if ! command -v cloudflared &> /dev/null; then
  err "cloudflared CLI is not installed.\n  Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/"
fi

CLOUDFLARED_VERSION=$(cloudflared --version)
info "Found $CLOUDFLARED_VERSION"

if ! command -v kubectl &> /dev/null; then
  err "kubectl is not installed or not in PATH."
fi

info "kubectl version: $(kubectl version --client 2>/dev/null | head -1)"

# ---- Check for existing tunnel credentials ----
CREDENTIALS_FILE=""
for f in ~/.cloudflared/*.json; do
  if [ -f "$f" ]; then
    CREDENTIALS_FILE="$f"
    break
  fi
done

if [ -z "$CREDENTIALS_FILE" ]; then
    warn "No existing tunnel credentials found in ~/.cloudflared/"
    info "You will need to authenticate with Cloudflare."

    # ---- Authenticate ----
    info "Starting Cloudflare authentication..."
    info "A browser window should open. If not, visit: https://dash.cloudflare.com/overview"
    cloudflared tunnel login

    # After login, cloudflared saves cert.pem (account-level credentials)
    # Run tunnel create to generate the tunnel-specific *.json file
    CERT_FILE="$HOME/.cloudflared/cert.pem"
    if [ -f "$CERT_FILE" ]; then
      info "Authentication successful (cert.pem found)."

      # ---- Create tunnel ----
      info "Creating tunnel '$TUNNEL_NAME'..."
      TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
      info "$TUNNEL_OUTPUT"

      TUNNEL_UUID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}' | head -1)
      if [ -z "$TUNNEL_UUID" ]; then
        err "Failed to parse tunnel UUID from output."
      fi

      info "Tunnel created with UUID: $TUNNEL_UUID"

      # ---- Route DNS ----
      info "Routing DNS: $TUNNEL_HOSTNAME -> tunnel $TUNNEL_NAME"
      cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME"

      CREDENTIALS_FILE="$HOME/.cloudflared/$TUNNEL_UUID.json"
    else
      err "Authentication failed or cancelled. Please re-run this script."
    fi
else
  info "Found existing credentials: $CREDENTIALS_FILE"

  # Extract UUID from filename
  TUNNEL_UUID=$(basename "$CREDENTIALS_FILE" .json)

  # Check if this credentials file already has a DNS route
  info "Checking if DNS route exists for $TUNNEL_HOSTNAME..."
  EXISTING_ROUTE=$(cloudflared tunnel route dns list 2>/dev/null | grep "$TUNNEL_HOSTNAME" || true)
  if [ -z "$EXISTING_ROUTE" ]; then
    info "Adding DNS route: $TUNNEL_HOSTNAME -> tunnel"
    cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME"
  else
    info "DNS route already exists: $EXISTING_ROUTE"
  fi
fi

# ---- Create Kubernetes namespace (if needed) ----
info "Ensuring namespace '$NAMESPACE' exists..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ---- Create Kubernetes Secret ----
info "Creating Secret '$SECRET_NAME' in namespace '$NAMESPACE'..."

# Delete existing secret if it exists (it may have stale data)
kubectl delete secret "$SECRET_NAME" -n "$NAMESPACE" --ignore-not-found=true

kubectl create secret generic "$SECRET_NAME" \
  -n "$NAMESPACE" \
  --from-file=credentials.json="$CREDENTIALS_FILE"

info "Secret created successfully."

# ---- Load environment variables from k8s.env ----
ENV_FILE="apps/backend/k8s/k8s.env"
if [ -f "$ENV_FILE" ]; then
  info "Loading environment from $ENV_FILE..."
  set -a
  source "$ENV_FILE"
  set +a
else
  warn "No k8s.env found at $ENV_FILE. Create it from k8s.env.example with TUNNEL_UUID and TUNNEL_HOSTNAME."
fi

# ---- Create cloudflare-tunnel-config Secret with UUID and hostname ----
if [ -n "$TUNNEL_UUID" ] && [ -n "$TUNNEL_HOSTNAME" ]; then
  info "Creating Secret 'cloudflare-tunnel-config' in namespace '$NAMESPACE'..."

  kubectl delete secret cloudflare-tunnel-config -n "$NAMESPACE" --ignore-not-found=true

  kubectl create secret generic cloudflare-tunnel-config \
    -n "$NAMESPACE" \
    --from-literal=tunnel-uuid="$TUNNEL_UUID" \
    --from-literal=tunnel-hostname="$TUNNEL_HOSTNAME"

  info "Secret 'cloudflare-tunnel-config' created."
else
  warn "TUNNEL_UUID or TUNNEL_HOSTNAME not set in k8s.env. Skipping cloudflare-tunnel-config Secret."
  warn "  TUNNEL_UUID=$TUNNEL_UUID"
  warn "  TUNNEL_HOSTNAME=$TUNNEL_HOSTNAME"
fi

# ---- Update cloudflared.yaml with the UUID ----
MANIFEST_FILE="apps/backend/k8s/cloudflared.yaml"
if [ -f "$MANIFEST_FILE" ]; then
  info "Updating $MANIFEST_FILE with TUNNEL_UUID..."

  # Replace placeholder in ConfigMap
  sed -i.bak "s/<TUNNEL_UUID>/$TUNNEL_UUID/g" "$MANIFEST_FILE"

  # Remove backup
  rm -f "${MANIFEST_FILE}.bak"

  info "Manifest updated. ConfigMap and Deployment args now use UUID: $TUNNEL_UUID"
else
  warn "Manifest file '$MANIFEST_FILE' not found. Please manually replace <TUNNEL_UUID> in:"
  warn "  - ConfigMap 'cloudflared-config' (key: tunnel)"
  warn "  - Deployment args (last argument)"
fi

# ---- Done ----
echo ""
info "============================================="
info "  SETUP COMPLETE"
info "============================================="
info ""
info "Next steps:"
info "  1. Verify the manifest is updated:"
info "     grep TUNNEL_UUID apps/backend/k8s/cloudflared.yaml"
info ""
info "  2. Apply the manifest:"
info "     kubectl apply -f apps/backend/k8s/cloudflared.yaml"
info ""
info "  3. Verify the deployment:"
info "     kubectl get pods -n $NAMESPACE"
info "     kubectl logs -n $NAMESPACE deployment/cloudflared"
info ""
info "  4. Test the endpoint:"
info "     curl https://$TUNNEL_HOSTNAME/health"
info ""
info "Your TUNNEL_UUID: $TUNNEL_UUID"
info "============================================="