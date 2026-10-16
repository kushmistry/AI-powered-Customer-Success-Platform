# ---- Frontend Dockerfile (multi-stage for monorepo) ----
# Optimised production build for Next.js with standalone output

# ============================================
# Stage 1 — Install dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy monorepo workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ui ./packages/ui
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies for frontend and its workspace dependencies
RUN pnpm install --filter frontend... --frozen-lockfile=false --ignore-scripts

# ============================================
# Stage 2 — Build the application
# ============================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY --from=deps /app ./
COPY packages/ui ./packages/ui
COPY apps/frontend ./apps/frontend

# Pass build-time environment variables for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/frontend
RUN pnpm build

# ============================================
# Stage 3 — Production runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy runtime assets
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# In Next.js standalone mode with monorepo, output files are located in .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "if [ -f apps/frontend/server.js ]; then node apps/frontend/server.js; else node server.js; fi"]
