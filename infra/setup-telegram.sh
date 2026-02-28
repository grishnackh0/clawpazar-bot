#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ClawPazar — Telegram Bot Webhook Setup
# ═══════════════════════════════════════════════════════════════
#
# Kullanım:
#   1. @BotFather'dan bot oluştur → token al
#   2. .env'e TELEGRAM_BOT_TOKEN=<token> ekle
#   3. Bu scripti çalıştır
#
# Gereksinimler:
#   - TELEGRAM_BOT_TOKEN (.env'den okunur)
#   - WEBHOOK_URL (public HTTPS URL)
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# .env dosyasını yükle
if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
fi

# Token kontrolü
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN bulunamadı."
    echo ""
    echo "Adımlar:"
    echo "  1. Telegram'da @BotFather'a git"
    echo "  2. /newbot komutu ile bot oluştur"
    echo "  3. Aldığın token'ı .env'e ekle:"
    echo "     TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
    exit 1
fi

# Webhook URL
WEBHOOK_URL="${1:-${API_EXTERNAL_URL:-}}"

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ Webhook URL gerekli."
    echo ""
    echo "Kullanım:"
    echo "  ./setup-telegram.sh https://your-domain.com"
    echo ""
    echo "  veya .env'de API_EXTERNAL_URL ayarla"
    exit 1
fi

FULL_URL="${WEBHOOK_URL}/api/webhooks/telegram"

echo "🤖 Telegram Bot Webhook Kurulumu"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Bot Token: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "Webhook:   $FULL_URL"
echo ""

# Bot bilgilerini al
echo "📡 Bot bilgileri alınıyor..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")
BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | head -1 | cut -d'"' -f4)
BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BOT_USERNAME" ]; then
    echo "❌ Bot bilgileri alınamadı. Token'ı kontrol et."
    echo "$BOT_INFO"
    exit 1
fi

echo "  Bot: $BOT_NAME (@$BOT_USERNAME)"
echo ""

# Webhook kur
echo "🔗 Webhook kuruluyor..."
RESULT=$(curl -s -X POST \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
        \"url\": \"$FULL_URL\",
        \"allowed_updates\": [\"message\", \"callback_query\"],
        \"drop_pending_updates\": true,
        \"max_connections\": 40
    }")

OK=$(echo "$RESULT" | grep -o '"ok":true')

if [ -n "$OK" ]; then
    echo "✅ Webhook başarıyla kuruldu!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Bot linki: https://t.me/$BOT_USERNAME"
    echo ""
    echo "Artık Telegram'da @$BOT_USERNAME ile konuşabilirsin."
    echo "Bot /start komutuyla başlar."
else
    echo "❌ Webhook kurulumu başarısız:"
    echo "$RESULT"
    exit 1
fi

# Bot komutlarını ayarla
echo ""
echo "📋 Bot komutları ayarlanıyor..."
curl -s -X POST \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands" \
    -H "Content-Type: application/json" \
    -d '{
        "commands": [
            {"command": "start", "description": "🐾 ClawPazar'a hoş geldin"},
            {"command": "basla", "description": "🐾 Yeni sohbet başlat"},
            {"command": "sil", "description": "🗑️ Sohbet geçmişini temizle"},
            {"command": "yardim", "description": "❓ Yardım menüsü"}
        ]
    }' > /dev/null

echo "✅ Bot komutları ayarlandı."
echo ""
echo "🎉 Kurulum tamamlandı!"
