#!/bin/bash

# Variables
EC2_ID="i-00af193d8398c8c89"          # Replace with your backend EC2 ID
FRONTEND_CONFIG_FILE="k8s/frontend-config.yaml"
BACKEND_PORT="3000"
BACKEND_SECRET_FILE="k8s/backend-secret.yaml"

# Step 1: Get EC2 public IP
BACKEND_IP=$(aws ec2 describe-instances \
  --instance-ids $EC2_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [ -z "$BACKEND_IP" ]; then
  echo "Error: Could not fetch EC2 IP!"
  exit 1
fi

echo "Backend IP: $BACKEND_IP"

# Step 2: Update frontend-config.yaml
# Replace the VITE_API_BASE_URL line
sed -i.bak "s|^\s*VITE_API_BASE_URL:.*|  VITE_API_BASE_URL: \"http://$BACKEND_IP:$BACKEND_PORT\"|" $FRONTEND_CONFIG_FILE

echo "Updated $FRONTEND_CONFIG_FILE with new backend IP: $BACKEND_IP"

# Replace only the CORS_ORIGIN line, leave other secrets unaffected
sed -i.bak "s|^\s*CORS_ORIGIN:.*|  CORS_ORIGIN: \"http://$BACKEND_IP:$BACKEND_PORT\"|" "$BACKEND_SECRET_FILE"

echo "Updated $BACKEND_SECRET_FILE with new backend IP: $BACKEND_IP"
