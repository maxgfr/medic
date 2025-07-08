# Dockerfile pour l'application Next.js medic

# Étape 1: Base image avec Node.js
FROM node:20-alpine AS base

# Installation des dépendances nécessaires
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installation de Bun
RUN npm install -g bun

# Étape 2: Installation des dépendances
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Étape 3: Build de l'application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1

# Build de l'application
RUN bun run build

# Étape 4: Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
