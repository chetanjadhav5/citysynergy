#!/bin/bash
cd "$(dirname "$0")/.." || exit 1

# === Variables ===
NAMESPACE="citysynergy"
BACKEND_SERVICE="citysynergy-backend"
FRONTEND_SERVICE="citysynergy-frontend"  # 👈 Added this
FRONTEND_CONFIG_FILE="k8s/frontend-config.yaml"
BACKEND_SECRET_FILE="k8s/backend-secret.yaml"
BACKEND_PORT="3000"
FRONTEND_PORT="80"  # 👈 Added this

echo -e "\e[1;34m☸️  Detected EKS environment...\e[0m"

# === Get LoadBalancer hostnames ===
BACKEND_HOSTNAME=$(kubectl get svc $BACKEND_SERVICE -n $NAMESPACE \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

FRONTEND_HOSTNAME=$(kubectl get svc $FRONTEND_SERVICE -n $NAMESPACE \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$BACKEND_HOSTNAME" ] || [ -z "$FRONTEND_HOSTNAME" ]; then
  echo "❌ Error: Could not fetch EKS LoadBalancer hostnames!"
  exit 1
fi

BACKEND_URL="http://$BACKEND_HOSTNAME:$BACKEND_PORT"
FRONTEND_URL="http://$FRONTEND_HOSTNAME"  # Port 80 is default for HTTP

echo -e "\e[1;32m✅ Backend URL: $BACKEND_URL\e[0m"
echo -e "\e[1;32m✅ Frontend URL: $FRONTEND_URL\e[0m"

# === Update configs CORRECTLY ===
# Backend CORS should allow the FRONTEND URL (where browser requests come from)
sed -i.bak -E "s|^[[:space:]]*CORS_ORIGIN:.*|  CORS_ORIGIN: \"$FRONTEND_URL\"|" "$BACKEND_SECRET_FILE"

# Frontend should call the BACKEND URL for API requests
sed -i.bak -E "s|^[[:space:]]*VITE_API_BASE_URL:.*|  VITE_API_BASE_URL: \"$BACKEND_URL\"|" "$FRONTEND_CONFIG_FILE"

echo -e "\e[1;32m✅ Updated configs:\e[0m"
echo -e "   📡 CORS_ORIGIN → $FRONTEND_URL"
echo -e "   🔗 VITE_API_BASE_URL → $BACKEND_URL"

# === Apply the updates ===
kubectl apply -f "$BACKEND_SECRET_FILE" -n "$NAMESPACE"
kubectl apply -f "$FRONTEND_CONFIG_FILE" -n "$NAMESPACE"

# === Restart deployments to pick up new configs ===
echo -e "\e[1;34m🔄 Restarting deployments...\e[0m"
kubectl rollout restart deployment/citysynergy-backend -n "$NAMESPACE"
kubectl rollout restart deployment/citysynergy-frontend -n "$NAMESPACE"

echo -e "\e[1;32m🎉 All updates applied successfully!\e[0m"

