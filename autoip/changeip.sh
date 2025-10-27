#!/bin/bash
set -e
cd "$(dirname "$0")/.." || exit 1

# =========================================
# CONFIG
# =========================================
EC2_ID="i-00af193d8398c8c89"       # Your EC2 backend ID (for EC2 mode)
FRONTEND_CONFIG_FILE="k8s/frontend-config.yaml"
BACKEND_SECRET_FILE="k8s/backend-secret.yaml"
BACKEND_PORT="3000"
NAMESPACE="citysynergy"
BACKEND_SERVICE="citysynergy-backend"
FRONTEND_SERVICE="citysynergy-frontend"
MAX_RETRIES=10
SLEEP_TIME=10

# =========================================
# COLORS
# =========================================
GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

# =========================================
# FUNCTION: Check if EKS is active
# =========================================
if kubectl version --short &>/dev/null; then
  IS_EKS=true
else
  IS_EKS=false
fi

# =========================================
# MODE 1: EC2 BACKEND
# =========================================
if [ "$IS_EKS" = false ]; then
  echo -e "${YELLOW}🖥️  Detected EC2 environment...${NC}"

  BACKEND_IP=$(aws ec2 describe-instances \
    --instance-ids "$EC2_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

  if [ -z "$BACKEND_IP" ]; then
    echo -e "${RED}❌ Error: Could not fetch EC2 IP!${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Backend IP: $BACKEND_IP${NC}"

  sed -i.bak -E "s|^[[:space:]]*VITE_API_BASE_URL:.*|  VITE_API_BASE_URL: \"http://$BACKEND_IP:$BACKEND_PORT\"|" "$FRONTEND_CONFIG_FILE"
  sed -i.bak -E "s|^[[:space:]]*CORS_ORIGIN:.*|  CORS_ORIGIN: \"http://$BACKEND_IP:$BACKEND_PORT\"|" "$BACKEND_SECRET_FILE"

  echo -e "${GREEN}✅ Updated frontend & backend YAMLs for EC2 mode${NC}"

# =========================================
# MODE 2: EKS BACKEND
# =========================================
else
  echo -e "${YELLOW}☸️  Detected EKS environment...${NC}"

  # Wait for frontend and backend LoadBalancer URLs
  for ((i=1; i<=MAX_RETRIES; i++)); do
    FRONTEND_URL=$(kubectl get svc "$FRONTEND_SERVICE" -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
    BACKEND_URL=$(kubectl get svc "$BACKEND_SERVICE" -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)

    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
      echo -e "${GREEN}✅ Found LoadBalancer URLs${NC}"
      break
    fi

    echo -e "${YELLOW}⏳ Waiting for LoadBalancer URLs... Attempt $i/$MAX_RETRIES${NC}"
    sleep "$SLEEP_TIME"
  done

  if [ -z "$FRONTEND_URL" ] || [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Error: Could not fetch LoadBalancer URLs after $MAX_RETRIES attempts.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Frontend LB: $FRONTEND_URL${NC}"
  echo -e "${GREEN}✅ Backend LB: $BACKEND_URL${NC}"

  # Update YAML files
  sed -i.bak -E "s|^[[:space:]]*VITE_API_BASE_URL:.*|  VITE_API_BASE_URL: \"http://$BACKEND_URL:$BACKEND_PORT\"|" "$FRONTEND_CONFIG_FILE"
  sed -i.bak -E "s|^[[:space:]]*CORS_ORIGIN:.*|  CORS_ORIGIN: \"http://$FRONTEND_URL\"|" "$BACKEND_SECRET_FILE"

  echo -e "${GREEN}✅ Updated frontend & backend YAMLs for EKS mode${NC}"
fi

echo -e "${GREEN}🎉 All updates completed successfully!${NC}"

