#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# ClawPazar – Production Deployment (Self-Host & Managed)
#
# Modes:
#   bash deploy.sh --mode self-host   (default, full VPS setup)
#   bash deploy.sh --mode managed     (+ auto-audit, auto-update, backups)
#   bash deploy.sh --dry-run          (show what would happen, no changes)
#
# Inspired by OpenClaw hosting model:
#   Self-host = full control, full responsibility
#   Managed   = we handle security, updates, backups
# ============================================================

# ── Parse Args ──
MODE="self-host"
DRY_RUN=false
TIER="starter"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --mode) MODE="$2"; shift 2 ;;
        --tier) TIER="$2"; shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "❌ Bilinmeyen parametre: $1"; exit 1 ;;
    esac
done

if [[ "$MODE" != "self-host" && "$MODE" != "managed" ]]; then
    echo "❌ Geçersiz mod: $MODE (self-host veya managed olmalı)"
    exit 1
fi

run_cmd() {
    if $DRY_RUN; then
        echo "  [DRY-RUN] $*"
    else
        "$@"
    fi
}

echo ""
echo "🐾 ClawPazar Production Deployment"
echo "==================================="
echo "  Mod:  $MODE"
echo "  Tier: $TIER"
echo "  Dry:  $DRY_RUN"
echo ""

# ── Self-Host Uyarı ──
if [ "$MODE" = "self-host" ]; then
    echo "┌──────────────────────────────────────────────┐"
    echo "│  ⚠️  SELF-HOST MODU                          │"
    echo "│                                              │"
    echo "│  Güvenlik ve güncelleme sorumluluğu sizde.   │"
    echo "│  OpenClaw vakası: 10.000+ açık instance      │"
    echo "│  tespit edildi (Şubat 2026).                 │"
    echo "│                                              │"
    echo "│  Öneriler:                                   │"
    echo "│  • Haftalık: bash infra/auto-audit.sh        │"
    echo "│  • .env izinleri: chmod 600 .env             │"
    echo "│  • Gereksiz portları kapatın                 │"
    echo "│  • Docker imajlarını güncel tutun            │"
    echo "│                                              │"
    echo "│  Managed moda geçmek için:                   │"
    echo "│  bash deploy.sh --mode managed --tier pro    │"
    echo "└──────────────────────────────────────────────┘"
    echo ""
fi

# ── 1. System Update ──
echo "📦 [1/11] Sistem güncelleniyor..."
run_cmd apt-get update -qq && run_cmd apt-get upgrade -y -qq
run_cmd apt-get install -y -qq curl git ufw fail2ban unzip jq

# ── 2. Docker ──
if ! command -v docker &>/dev/null; then
    echo "🐳 [2/11] Docker kuruluyor..."
    run_cmd bash -c 'curl -fsSL https://get.docker.com | sh'
    run_cmd systemctl enable --now docker
    run_cmd usermod -aG docker "$USER"
else
    echo "🐳 [2/11] Docker zaten yüklü ✓"
fi

# ── 3. Docker Compose ──
if ! command -v docker compose &>/dev/null; then
    echo "📋 [3/11] Docker Compose plugin kuruluyor..."
    run_cmd apt-get install -y -qq docker-compose-plugin
else
    echo "📋 [3/11] Docker Compose zaten yüklü ✓"
fi

# ── 4. Firewall ──
echo "🔒 [4/11] Firewall yapılandırılıyor..."
run_cmd ufw default deny incoming
run_cmd ufw default allow outgoing
run_cmd ufw allow ssh
run_cmd ufw allow 80/tcp
run_cmd ufw allow 443/tcp
run_cmd ufw --force enable

# ── 5. Fail2Ban ──
echo "🛡️ [5/11] Fail2Ban başlatılıyor..."
run_cmd systemctl enable --now fail2ban

# ── 6. Project Setup ──
PROJECT_DIR="/opt/clawpazar"
echo "📂 [6/11] Proje dizini: $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    echo "📥 Proje güncelleniyor..."
    if ! $DRY_RUN; then cd "$PROJECT_DIR" && git pull; fi
else
    echo "📥 Proje klonlanıyor..."
    run_cmd git clone https://github.com/clawpazar/clawpazar.git "$PROJECT_DIR"
    if ! $DRY_RUN; then cd "$PROJECT_DIR"; fi
fi

# ── 7. Environment ──
if [ ! -f ".env" ] || $DRY_RUN; then
    echo "⚙️ [7/11] .env dosyası oluşturuluyor..."
    run_cmd cp .env.example .env
    run_cmd chmod 600 .env

    echo ""
    echo "  ⚠️  ZORUNLU: .env dosyasını düzenleyin!"
    echo "     nano $PROJECT_DIR/.env"
    echo ""
    echo "     Gereken anahtarlar:"
    echo "     - SUPABASE_ANON_KEY"
    echo "     - SUPABASE_SERVICE_KEY"
    echo "     - IYZICO_API_KEY / IYZICO_SECRET_KEY"
    echo "     - JWT_SECRET (openssl rand -hex 32)"
    echo "     - WHATSAPP_VERIFY_TOKEN"
    echo "     - TELEGRAM_BOT_TOKEN"
    echo ""
else
    echo "⚙️ [7/11] .env zaten mevcut ✓"
fi

# ── 8. SSL ──
DOMAIN="${CLAWPAZAR_DOMAIN:-clawpazar.com}"
echo "🔐 [8/11] SSL sertifikası kontrol ediliyor ($DOMAIN)..."

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    run_cmd apt-get install -y -qq certbot
    run_cmd certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "api.$DOMAIN" \
        -d "www.$DOMAIN" \
        --non-interactive --agree-tos \
        --email "admin@$DOMAIN"

    echo "0 3 * * * certbot renew --quiet && docker compose restart nginx" \
        | run_cmd crontab -
else
    echo "🔐 [8/11] SSL sertifikası mevcut ✓"
fi

# ── 9. Hosting Mode Yazılımı ──
echo "📝 [9/11] Hosting modu yapılandırılıyor ($MODE / $TIER)..."

HOSTING_CONFIG="$PROJECT_DIR/.hosting.json"
if ! $DRY_RUN; then
    cat > "$HOSTING_CONFIG" << EOF
{
    "mode": "$MODE",
    "tier": "$TIER",
    "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
    "auto_update": $([ "$MODE" = "managed" ] && echo "true" || echo "false"),
    "auto_audit": $([ "$MODE" = "managed" ] && echo "true" || echo "false"),
    "backup_enabled": $([ "$MODE" = "managed" ] && echo "true" || echo "false")
}
EOF
    chmod 600 "$HOSTING_CONFIG"
fi

# ── 10. Build & Deploy ──
echo "🚀 [10/11] Docker build ve deploy..."
run_cmd docker compose pull 2>/dev/null || true
run_cmd docker compose build --parallel
run_cmd docker compose up -d

# ── 11. Managed-Only: Cron Jobs ──
if [ "$MODE" = "managed" ]; then
    echo "🤖 [11/11] Managed hosting özellikleri etkinleştiriliyor..."

    CRON_INSTALL=""

    # Auto-audit (daily at 04:00)
    CRON_INSTALL+="0 4 * * * bash $PROJECT_DIR/infra/auto-audit.sh --fix >> /var/log/clawpazar-audit.log 2>&1\n"

    # Auto-update (daily at 03:00)
    CRON_INSTALL+="0 3 * * * cd $PROJECT_DIR && git pull && docker compose build --quiet && docker compose up -d >> /var/log/clawpazar-update.log 2>&1\n"

    # Backup based on tier
    case "$TIER" in
        starter)   CRON_INSTALL+="0 2 * * 0 bash $PROJECT_DIR/infra/backup.sh >> /var/log/clawpazar-backup.log 2>&1\n" ;;  # Weekly
        pro)       CRON_INSTALL+="0 2 * * * bash $PROJECT_DIR/infra/backup.sh >> /var/log/clawpazar-backup.log 2>&1\n" ;;  # Daily
        enterprise) CRON_INSTALL+="0 * * * * bash $PROJECT_DIR/infra/backup.sh >> /var/log/clawpazar-backup.log 2>&1\n" ;; # Hourly
    esac

    # SSL renewal
    CRON_INSTALL+="0 3 * * * certbot renew --quiet && docker compose restart nginx 2>&1\n"

    if ! $DRY_RUN; then
        echo -e "$CRON_INSTALL" | crontab -
    else
        echo "  [DRY-RUN] Cron jobs kayıt edilecek:"
        echo -e "$CRON_INSTALL" | sed 's/^/    /'
    fi

    echo ""
    echo "  ✅ Otomatik güvenlik audit (her gün 04:00)"
    echo "  ✅ Otomatik güncelleme (her gün 03:00)"
    echo "  ✅ Otomatik yedekleme ($TIER planına göre)"
    echo "  ✅ SSL auto-renewal"
else
    echo "⏭️ [11/11] Self-host — managed özellikler atlandı"
fi

# ── Health Check ──
echo ""
echo "🏥 Sağlık kontrolü..."
sleep 10

for i in {1..5}; do
    if curl -sf "http://localhost:4000/health" > /dev/null 2>&1; then
        echo "✅ API çalışıyor!"
        break
    fi
    echo "   Bekleniyor... ($i/5)"
    sleep 5
done

# ── Status ──
echo ""
echo "==================================="
echo "🐾 ClawPazar Deployment Tamamlandı!"
echo "==================================="
echo ""
echo "  Mod:     $MODE"
echo "  Tier:    $TIER"
echo "  Domain:  $DOMAIN"
echo ""
echo "Servisler:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
echo ""
echo "URL'ler:"
echo "  🌐 Frontend: https://$DOMAIN"
echo "  🔌 API:      https://api.$DOMAIN"
echo "  📊 Grafana:  http://localhost:3001  (admin/admin)"
echo ""

if [ "$MODE" = "managed" ]; then
    echo "Managed Hosting:"
    echo "  🔒 Auto-audit:  her gün 04:00"
    echo "  📦 Auto-update: her gün 03:00"
    echo "  💾 Backup:      $TIER planına göre"
    echo "  📞 Destek:      admin@$DOMAIN"
    echo ""
fi

echo "Güvenlik Audit (elle çalıştırma):"
echo "  bash $PROJECT_DIR/infra/auto-audit.sh"
echo ""
echo "CLI:"
echo "  clawpazar login -t <token> -u https://api.$DOMAIN"
echo "  clawpazar health"
echo ""
