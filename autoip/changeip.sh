#!/bin/bash
cd "$(dirname "$0")/.." || exit 1

# === Variables ===
NAMESPACE="citysynergy"
BACKEND_SERVICE="citysynergy-backend"
FRONTEND_CONFIG_FILE="k8s/frontend-config.yaml"
BACKEND_SECRET_FILE="k8s/backend-secret.yaml"
BACKEND_PORT="3000"

echo -e "\e[1;34m☸️  Detected EKS environment...\e[0m"

# === Get LoadBalancer hostname for backend ===
BACKEND_HOSTNAME=$(kubectl get svc $BACKEND_SERVICE -n $NAMESPACE \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$BACKEND_HOSTNAME" ]; then
  echo "❌ Error: Could not fetch EKS LoadBalancer hostname!"
  exit 1
fi

BACKEND_URL="http://$BACKEND_HOSTNAME:$BACKEND_PORT"
echo -e "\e[1;32m✅ Backend URL: $BACKEND_URL\e[0m"

# === Update frontend config ===
sed -i.bak -E "s|^[[:space:]]*CORS_ORIGIN:.*|  CORS_ORIGIN: \"$BACKEND_URL\"|" "$BACKEND_SECRET_FILE"
sed -i.bak -E "s|^[[:space:]]*VITE_API_BASE_URL:.*|  VITE_API_BASE_URL: \"$BACKEND_URL\"|" "$FRONTEND_CONFIG_FILE"

echo -e "\e[1;32m✅ Updated frontend & backend YAMLs with LoadBalancer URL\e[0m"

# === Optional: Apply the updates to your cluster ===
kubectl apply -f "$BACKEND_SECRET_FILE" -n "$NAMESPACE"
kubectl apply -f "$FRONTEND_CONFIG_FILE" -n "$NAMESPACE"

echo -e "\e[1;32m🎉 Applied all updates successfully to EKS!\e[0m"

