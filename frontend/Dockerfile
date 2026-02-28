# ClawPazar Frontend – Next.js Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=build-placeholder-key
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_WS_URL=ws://localhost:4000

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 clawpazar && \
    adduser --system --uid 1001 clawpazar

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER clawpazar
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
