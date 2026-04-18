FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate
RUN pnpm build

FROM node:20-slim AS runner
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs nodeuser

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

RUN node_modules/.bin/prisma generate
RUN chown -R nodeuser:nodejs /app

USER nodeuser
EXPOSE 3002

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.js"]
