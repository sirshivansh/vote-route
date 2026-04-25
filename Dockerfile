FROM node:22-slim

WORKDIR /app

# The 'dist' folder is already built by the cloud build step
COPY . .

# Install ONLY production dependencies to keep things clean
RUN npm install --omit=dev

# Start the app through our resilient bridge
ENV PORT=8080
CMD ["node", "entry.mjs"]
