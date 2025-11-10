# Multi-stage Docker build for production deployment
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build applications
RUN npm run build

# Stage 3: API Runner
FROM node:18-alpine AS api
WORKDIR /app

# Copy built API
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package*.json ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]

# Stage 4: Web Runner
FROM node:18-alpine AS web
WORKDIR /app

# Copy built web app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/package*.json ./
COPY --from=builder /app/apps/web/public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
