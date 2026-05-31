# Base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies required by Prisma & node-gyp
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Image ---
FROM node:20-alpine AS production

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy Prisma schema, config, and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Hugging Face Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

# Start the application using migrate deploy to ensure DB is up-to-date
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
