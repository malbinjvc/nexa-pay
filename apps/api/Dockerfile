FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/
RUN npm install
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN npx turbo build --filter=@nexa-pay/api

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=hono:nodejs /app/packages/db/dist ./packages/db/dist
USER hono
EXPOSE 8787
CMD ["node", "dist/index.js"]
