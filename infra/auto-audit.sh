#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# ClawPazar – Auto Security Audit
# Managed hosting: daily cron  |  Self-host: manual run
# Usage: bash infra/auto-audit.sh [--fix]
# ============================================================

AUTO_FIX="${1:-}"
REPORT_FILE="/var/log/clawpazar-audit-$(date +%Y%m%d-%H%M%S).log"
PASS=0
WARN=0
FAIL=0

log()  { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$REPORT_FILE" 2>/dev/null || echo "$1"; }
pass() { log "✅ PASS: $1"; ((PASS++)); }
warn() { log "⚠️  WARN: $1"; ((WARN++)); }
fail() { log "❌ FAIL: $1"; ((FAIL++)); }

echo ""
echo "🔒 ClawPazar Security Audit"
echo "==========================="
echo "Tarih: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ── 1. SSL Sertifika Kontrolü ──
log "── SSL Sertifika ──"
DOMAIN="${CLAWPAZAR_DOMAIN:-clawpazar.com}"
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/cert.pem" 2>/dev/null | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

    if [ "$DAYS_LEFT" -gt 30 ]; then
        pass "SSL sertifikası geçerli ($DAYS_LEFT gün kaldı)"
    elif [ "$DAYS_LEFT" -gt 0 ]; then
        warn "SSL sertifikası $DAYS_LEFT gün içinde sona erecek"
        if [ "$AUTO_FIX" = "--fix" ]; then
            log "  → certbot renew çalıştırılıyor..."
            certbot renew --quiet 2>/dev/null && pass "SSL yenilendi" || fail "SSL yenileme başarısız"
        fi
    else
        fail "SSL sertifikası SÜRESI DOLMUŞ!"
    fi
else
    warn "SSL sertifikası bulunamadı ($DOMAIN)"
fi

# ── 2. Açık Port Kontrolü ──
log "── Port Tarama ──"
EXPECTED_PORTS="22 80 443"
if command -v ss &>/dev/null; then
    LISTENING=$(ss -tlnp 2>/dev/null | grep LISTEN | awk '{print $4}' | grep -oP ':\K[0-9]+' | sort -u)
    for port in $LISTENING; do
        if echo "$EXPECTED_PORTS" | grep -qw "$port"; then
            pass "Port $port (beklenen)"
        elif [ "$port" -eq 3000 ] || [ "$port" -eq 4000 ] || [ "$port" -eq 5432 ] || [ "$port" -eq 6379 ]; then
            # Internal service ports — should NOT be exposed externally
            if ufw status 2>/dev/null | grep -q "$port.*DENY"; then
                pass "Port $port (iç servis, firewall ile korunuyor)"
            else
                warn "Port $port açık — firewall kuralı eksik olabilir"
            fi
        else
            warn "Beklenmeyen port $port açık"
        fi
    done
else
    warn "ss komutu bulunamadı, port tarama atlandı"
fi

# ── 3. Docker Güvenlik ──
log "── Docker ──"
if command -v docker &>/dev/null; then
    RUNNING=$(docker ps --format '{{.Names}}' 2>/dev/null | wc -l)
    pass "Docker çalışıyor ($RUNNING container)"

    # Root user kontrolü
    ROOT_CONTAINERS=$(docker ps --format '{{.Names}}' 2>/dev/null | while read c; do
        USER=$(docker inspect --format '{{.Config.User}}' "$c" 2>/dev/null)
        [ -z "$USER" ] || [ "$USER" = "root" ] && echo "$c"
    done)
    if [ -n "$ROOT_CONTAINERS" ]; then
        warn "Root ile çalışan container'lar: $ROOT_CONTAINERS"
    else
        pass "Tüm container'lar non-root user ile çalışıyor"
    fi

    # Eski imaj kontrolü
    OLD_IMAGES=$(docker images --format '{{.Repository}}:{{.Tag}} {{.CreatedSince}}' 2>/dev/null | grep -E '(months|years)' | head -5)
    if [ -n "$OLD_IMAGES" ]; then
        warn "Eski Docker imajları var (güncelleme önerilir)"
    else
        pass "Docker imajları güncel"
    fi
else
    fail "Docker yüklü değil!"
fi

# ── 4. Firewall ──
log "── Firewall ──"
if command -v ufw &>/dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -1)
    if echo "$UFW_STATUS" | grep -qi "active"; then
        pass "UFW aktif"
    else
        fail "UFW aktif değil!"
        if [ "$AUTO_FIX" = "--fix" ]; then
            ufw --force enable 2>/dev/null && pass "UFW etkinleştirildi" || fail "UFW etkinleştirilemedi"
        fi
    fi
else
    warn "UFW yüklü değil"
fi

# ── 5. Fail2Ban ──
log "── Fail2Ban ──"
if command -v fail2ban-client &>/dev/null; then
    if systemctl is-active --quiet fail2ban 2>/dev/null; then
        JAILS=$(fail2ban-client status 2>/dev/null | grep "Jail list" | cut -d: -f2 | tr -d ' ')
        pass "Fail2Ban aktif (jail'ler: $JAILS)"
    else
        fail "Fail2Ban servisi çalışmıyor"
    fi
else
    warn "Fail2Ban yüklü değil"
fi

# ── 6. Disk Kullanımı ──
log "── Disk ──"
DISK_USAGE=$(df -h / 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%')
if [ "${DISK_USAGE:-0}" -lt 80 ]; then
    pass "Disk kullanımı: %$DISK_USAGE"
elif [ "${DISK_USAGE:-0}" -lt 90 ]; then
    warn "Disk kullanımı yüksek: %$DISK_USAGE"
else
    fail "Disk dolmak üzere: %$DISK_USAGE!"
fi

# ── 7. .env Güvenlik ──
log "── .env Güvenlik ──"
ENV_FILE="${CLAWPAZAR_DIR:-/opt/clawpazar}/.env"
if [ -f "$ENV_FILE" ]; then
    PERMS=$(stat -c %a "$ENV_FILE" 2>/dev/null || stat -f %Lp "$ENV_FILE" 2>/dev/null)
    if [ "${PERMS:-644}" = "600" ] || [ "${PERMS:-644}" = "400" ]; then
        pass ".env dosya izinleri güvenli ($PERMS)"
    else
        warn ".env dosya izinleri gevşek ($PERMS) — 600 önerilir"
        if [ "$AUTO_FIX" = "--fix" ]; then
            chmod 600 "$ENV_FILE" 2>/dev/null && pass ".env izinleri düzeltildi" || fail "İzin düzeltme başarısız"
        fi
    fi
else
    warn ".env dosyası bulunamadı ($ENV_FILE)"
fi

# ── 8. API Health ──
log "── API Health ──"
if curl -sf "http://localhost:4000/health" > /dev/null 2>&1; then
    pass "API sağlıklı"
else
    fail "API yanıt vermiyor!"
fi

# ── Rapor ──
echo ""
echo "==========================="
echo "📊 Audit Raporu"
echo "==========================="
echo "  ✅ PASS: $PASS"
echo "  ⚠️  WARN: $WARN"
echo "  ❌ FAIL: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "🔴 KRİTİK SORUNLAR TESPİT EDİLDİ!"
    echo "   '--fix' parametresi ile otomatik düzeltme deneyin."
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "🟡 Uyarılar mevcut — kontrol edin."
    exit 0
else
    echo "🟢 Tüm kontroller başarılı."
    exit 0
fi
