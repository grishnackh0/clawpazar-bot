# ClawPazar API Server – Production Dockerfile
# Single-stage with tsx runtime (TypeScript direct execution)

FROM node:20-alpine
WORKDIR /app

RUN addgroup --system --gid 1001 clawpazar && \
    adduser --system --uid 1001 clawpazar

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY backend/ ./backend/
COPY mcp/ ./mcp/

USER clawpazar

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["npx", "tsx", "backend/api/routes.ts"]
