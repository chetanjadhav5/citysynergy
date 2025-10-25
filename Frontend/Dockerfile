# Stage 1: Build the React app using Node.js
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM nginx:stable-alpine

# Copy the build folder from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Add custom Nginx config for SPA routing (not required if default works)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose default HTTP port inside container
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

