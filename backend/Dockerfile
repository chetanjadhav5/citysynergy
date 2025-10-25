# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy app source
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

COPY wait-for-mysql.sh /wait-for-mysql.sh

CMD ["/wait-for-mysql.sh", "node", "index.js"]
