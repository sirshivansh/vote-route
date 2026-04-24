# Build Stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install all dependencies (including devDeps for build)
RUN npm install

# Copy source code
COPY . .

# Build the production application
RUN npm run build

# ---
# Production Stage
FROM node:20-slim

WORKDIR /app

# Copy the built output and necessary production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run uses the PORT environment variable
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# For TanStack Start, we use the preview command which serves the production build,
# or we point to the Nitro entry point if configured.
# Given this setup, 'vite preview' is the most robust way to serve the production dist.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
