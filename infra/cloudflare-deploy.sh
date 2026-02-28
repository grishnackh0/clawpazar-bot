#!/bin/bash
# ClawPazar — Cloudflare Pages Deploy Script
# Deploys the Next.js frontend to Cloudflare Pages (free tier)
#
# Prerequisites:
#   1. npm install -g wrangler
#   2. wrangler login
#   3. Set environment vars in Cloudflare dashboard after first deploy
#
# Usage:
#   chmod +x infra/cloudflare-deploy.sh
#   ./infra/cloudflare-deploy.sh

set -euo pipefail

PROJECT_NAME="clawpazar"
FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

echo "╔══════════════════════════════════════╗"
echo "║   ClawPazar — Cloudflare Deploy      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Check wrangler ──
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler CLI bulunamadı."
    echo "   Yüklemek için: npm install -g wrangler"
    echo "   Sonra: wrangler login"
    exit 1
fi

# ── Step 2: Build ──
echo "📦 Frontend build başlıyor..."
cd "$FRONTEND_DIR"

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "📥 npm install..."
    npm ci
fi

# Build Next.js
echo "🔨 next build..."
npx @cloudflare/next-on-pages@latest

echo "✅ Build tamamlandı."

# ── Step 3: Deploy ──
echo ""
echo "🚀 Cloudflare Pages'a deploy ediliyor..."
wrangler pages deploy .vercel/output/static \
    --project-name "$PROJECT_NAME" \
    --branch main \
    --commit-dirty

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   ✅ Deploy Başarılı!                ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "🌐 URL: https://${PROJECT_NAME}.pages.dev"
echo ""
echo "⚠️  Ortam değişkenlerini Cloudflare Dashboard'dan ayarlayın:"
echo "   Settings → Environment Variables → Production"
echo ""
echo "   ZHIPU_API_KEY          = (Zhipu API anahtarınız)"
echo "   ZHIPU_API_BASE         = https://open.bigmodel.cn/api/paas/v4"
echo "   ZHIPU_MODEL            = glm-4-flash"
echo "   NEXT_PUBLIC_API_URL    = https://api.clawpazar.com"
echo "   NEXT_PUBLIC_WS_URL     = wss://api.clawpazar.com"
echo ""
