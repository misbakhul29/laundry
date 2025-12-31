# Multi-stage Dockerfile for Next.js (production)
# Uses a builder stage to install deps and build, then a slim runtime image

FROM node:24-alpine AS builder
WORKDIR /app

# Install deps based on package.json
# Copy package files first to leverage cache
COPY package*.json ./

# Copy remaining files, excluding node_modules (add node_modules to .dockerignore)
COPY . .
RUN npm ci --legacy-peer-deps

# Copy rest of the sources and build
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the assets we need to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Expose default Next.js port
EXPOSE 3333

# Ensure runtime env for Next
ENV PORT=3333

CMD ["npm", "run", "start"]
