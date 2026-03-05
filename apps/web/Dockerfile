FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/
RUN npm install
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
RUN npx turbo build --filter=@nexa-pay/web

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxt
COPY --from=builder --chown=nuxt:nodejs /app/apps/web/.output ./.output
USER nuxt
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
