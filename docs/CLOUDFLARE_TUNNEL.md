# Cloudflare Tunnel + k0s Setup Guide

This guide explains how to expose the game-backend service running on a k0s Raspberry Pi cluster to the internet using a Cloudflare Tunnel (formerly known as Argo Tunnel).

## Architecture Overview

```
Internet Client
       │
       ▼
Cloudflare Edge Network
       │
       ▼ (Cloudflare Tunnel — outbound connection from Pi)
┌──────────────────────────────────────────────────────────────┐
│  Raspberry Pi (k0s cluster)                                  │
│                                                              │
│  ┌──────────────────┐     ┌────────────────────────────────┐│
│  │  cloudflared pod │────▶│  game-service.card-game.svc   ││
│  │  (cloudflare ns) │     │  (ClusterIP → backend:3000)   ││
│  └──────────────────┘     └────────────────────────────────┘│
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────┐     ┌────────────────────────────────┐│
│  │  game-backend pod│◀────│  game-service.card-game.svc   ││
│  │  (card-game ns)  │     └────────────────────────────────┘│
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
```

**Key points:**
- `cloudflared` makes an **outbound-only** connection to Cloudflare. No inbound ports needed.
- No NodePort, LoadBalancer, or Ingress controller required.
- Cloudflare handles SSL termination. Traffic inside the cluster is unencrypted HTTP.
- `<SUBDOMAIN>.<YOUR_DOMAIN>` routes through Cloudflare to the `game-backend` pod.

---

## Prerequisites

Before starting, ensure you have:

- [ ] A Cloudflare account (free tier is sufficient)
- [ ] Domain `rehiletehvac.com` registered at Don Dominio
- [ ] `cloudflared` CLI [installed](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/) on your local machine
- [ ] `kubectl` configured to access your k0s cluster
- [ ] `game-backend` deployed in the `card-game` namespace (see `apps/backend/k8s/deployment.yaml`)

---

## Step 1: Add Domain to Cloudflare

If you haven't added `rehiletehvac.com` to Cloudflare yet:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click **Add a site**.
3. Enter `rehiletehvac.com` and click **Add site**.
4. Choose a plan → select **Free plan**.
5. Cloudflare will show you two nameservers (e.g., `dante.ns.cloudflare.com`, `lara.ns.cloudflare.com`). Copy these.
6. Click **Continue**.

---

## Step 2: Change Don Dominio Nameservers

> **Important:** After changing nameservers, DNS propagation can take anywhere from a few minutes to 48 hours. During this time, your domain may be temporarily unreachable.

1. Log in to your **Don Dominio** account at `https://gestion.dondominio.com`.
2. Go to **Domains** → **Mis Dominios**.
3. Click on **rehiletehvac.com**.
4. Navigate to **DNS / Servidores de nombres** (or similar, depending on your panel layout).
5. Look for an option like **Servers DNS** or **Name Servers**.
6. Select **Usar servidores de nombres personalizados** (Use custom name servers).
7. Enter the two Cloudflare nameservers you copied in Step 1:
   - `dante.ns.cloudflare.com`
   - `lara.ns.cloudflare.com`
8. Click **Guardar** (Save) or **Aplicar cambios**.
9. Wait for propagation. You can check status at [dnschecker.org](https://dnschecker.org/#NS/rehiletehvac.com) by querying NS records for `rehiletehvac.com`.

> **Tip:** Once Cloudflare shows your domain as **Active**, you're ready to proceed.

---

## Step 3: Delete the Old Cloudflare Tunnel (If Exists)

If you previously created a tunnel (e.g., a token-based one for testing), it's best to delete it to avoid confusion.

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks** → **Tunnels**.
3. Find your old tunnel (it may be named `cloudflared` or similar).
4. Click the tunnel name.
5. Click **...** (three dots) → **Delete tunnel**.
6. Confirm the deletion.

This removes the old tunnel from Cloudflare's side. The associated token (if any) will stop working.

---

## Step 4: Create Tunnel and Kubernetes Secret

Run the helper script to authenticate with Cloudflare, create a tunnel, and deploy the credentials as a Kubernetes Secret:

```bash
./scripts/setup-cloudflare-secret.sh
```

### What the script does:

1. **Checks prerequisites** — verifies `cloudflared` and `kubectl` are installed.
2. **Authenticates** — opens browser for Cloudflare login (if not already authenticated).
3. **Creates tunnel** — runs `cloudflared tunnel create partybooster-hpe`.
4. **Routes DNS** — runs `cloudflared tunnel route dns partybooster-hpe api.partybooster-hpe.rehiletehvac.com`.
5. **Creates Secret** — `kubectl create secret generic tunnel-credentials -n cloudflare --from-file=credentials.json=<file>`.
6. **Updates manifest** — replaces `<TUNNEL_UUID>` placeholders in `cloudflared.yaml` automatically.

### Expected output:

```
[INFO] Checking prerequisites...
[INFO] Found cloudflared version 2025.4.1
[INFO] kubectl version: Client Version: v1.35.4+k0s
[INFO] Found existing credentials: /home/user/.cloudflared/a1b2c3d4-...json
[INFO] Creating namespace 'cloudflare'...
namespace/cloudflare created
[INFO] Creating Secret 'tunnel-credentials' in namespace 'cloudflare'...
secret/tunnel-credentials created
[INFO] Updating apps/backend/k8s/cloudflared.yaml with TUNNEL_UUID...

=============================================
  SETUP COMPLETE
=============================================

Next steps:
  1. Verify the manifest is updated:
     grep TUNNEL_UUID apps/backend/k8s/cloudflared.yaml
  2. Apply the manifest:
     kubectl apply -f apps/backend/k8s/cloudflared.yaml
  3. Verify the deployment:
     kubectl get pods -n cloudflare
     kubectl logs -n cloudflare deployment/cloudflared
  4. Test the endpoint:
     curl https://api.partybooster-hpe.rehiletehvac.com/health

Your TUNNEL_UUID: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
=============================================
```

---

## Step 5: Apply the Manifest

```bash
kubectl apply -f apps/backend/k8s/cloudflared.yaml
```

Expected output:
```
namespace/cloudflare created
configmap/cloudflared-config created
secret/tunnel-credentials unchanged
deployment.apps/cloudflared created
```

---

## Step 6: Verify the Deployment

### 6.1 Check Pod Status

```bash
kubectl get pods -n cloudflare -w
```

Wait until the pod shows `Running` and `1/1 Ready`.

### 6.2 Check Logs

```bash
kubectl logs -n cloudflare deployment/cloudflared
```

Look for output like:
```
2026-05-14T12:00:00Z INF Starting tunnel tunnelID=xxxxx
2026-05-14T12:00:00Z INF Connection established connIndex=0 event=connected
2026-05-14T12:00:01Z INF Connected to Cloudflare tunnel zone=api.partybooster-hpe.rehiletehvac.com
```

### 6.3 Check Cloudflare Dashboard

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks** → **Tunnels**.
3. Your tunnel should show status **Healthy** and type **Cloudflared**.
4. Click the tunnel → **Public hostname**. You should see:
   - **Hostname:** `api.partybooster-hpe.rehiletehvac.com`
   - **Service:** `http://game-service.card-game.svc.cluster.local:80`

### 6.4 Test from Inside the Cluster

```bash
kubectl run -it --rm debug --image=busybox:1.36 --restart=Never -n cloudflare -- sh
wget -qO- http://game-service.card-game.svc.cluster.local:80/health
```

Expected: `{"status":"ok","uptime":...}`

### 6.5 Test from Outside (External Access)

From any machine with internet access:

```bash
curl -I https://api.partybooster-hpe.rehiletehvac.com/health
```

Expected HTTP 200 with JSON body.

---

## Files Reference

| File | Purpose |
|---|---|
| `apps/backend/k8s/cloudflared.yaml` | Kubernetes manifest (Namespace, ConfigMap, Secret, Deployment) |
| `scripts/setup-cloudflare-secret.sh` | Helper script to create tunnel and deploy Secret |
| `apps/backend/k8s/deployment.yaml` | game-backend Deployment + Service |

---

## Troubleshooting

### Tunnel shows "Degraded" or "Down"

1. **Check pod logs:** `kubectl logs -n cloudflare deployment/cloudflared`
2. **Verify Secret exists:** `kubectl get secret tunnel-credentials -n cloudflare`
3. **Verify credentials content:**
   ```bash
   kubectl get secret tunnel-credentials -n cloudflare -o jsonpath='{.data.credentials\.json}' | base64 -d
   ```
   Should be valid JSON with `accountTag`, `tunnelId`, `tunnelName`.
4. **Check ConfigMap:**
   ```bash
   kubectl get configmap cloudflared-config -n cloudflare -o yaml
   ```

### DNS not resolving

1. Check [dnschecker.org](https://dnschecker.org/#A/api.partybooster-hpe.rehiletehvac.com) — CNAME or A record should point to Cloudflare.
2. In Cloudflare dashboard, go to **DNS** → **Records**. There should be a CNAME record:
   - **Type:** CNAME
   - **Name:** `api`
   - **Target:** `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx-0.cloudflared.io`
   - **Proxy status:** DNS only (orange cloud) or Proxied (grey cloud)

### Backend health check fails

```bash
# From cloudflare namespace:
kubectl exec -it -n cloudflare deploy/cloudflared -- sh -c "wget -qO- http://game-service.card-game.svc.cluster.local:80/health"

# From card-game namespace:
kubectl get pods -n card-game
kubectl logs -n card-game deployment/game-backend
```

### Permission denied on script

```bash
chmod +x ./scripts/setup-cloudflare-secret.sh
```

---

## Useful Commands

```bash
# Watch tunnel logs
kubectl logs -n cloudflare deployment/cloudflared -f

# Restart the tunnel
kubectl rollout restart deployment/cloudflared -n cloudflare

# Check namespace
kubectl get all -n cloudflare

# Delete everything
kubectl delete -f apps/backend/k8s/cloudflared.yaml
```

---

## Security Notes

- The `cloudflared` Deployment runs as a non-root user inside the container.
- The `tunnel-credentials` Secret contains your tunnel authentication key. Treat it like a password.
- Traffic inside the cluster (between cloudflared and game-backend) is unencrypted HTTP. This is acceptable since it's on a private cluster network.
- For production, consider restricting access to the `card-game` namespace using Kubernetes NetworkPolicies.