# ClawPazar – Lessons Learned

> Her kullanıcı düzeltmesinde bu dosyayı güncelle. Aynı hatayı önleyen kural yaz.

---

## Mimari Kararlar

1. **NanoClaw + IronClaw hibrit model**: NanoClaw TypeScript ile hızlı prototipleme, IronClaw Rust/WASM ile güvenli sandbox. İkisini aynı orkestrasyon katmanında birleştir, fork'larken upstream uyumluluğu koru.
2. **MercurJS seçim gerekçesi**: Medusa.js üzerine kurulu, multi-vendor hazır. Sıfırdan yazmak yerine extend et.
3. **iyzico escrow**: `PRODUCT` payment group ile otomatik escrow. subMerchantKey her satıcı için unique. Webhook retry: 15dk aralıkla 3 deneme, 2xx dönülmeli.
4. **Express.js tercih gerekçesi**: NanoClaw zaten Node.js tabanlı. Framework karmaşıklığından kaçınmak için Express + native ws kullanıldı. Toplamda sadece 3 runtime dependency.

## Güvenlik

1. **gVisor overhead**: %10-30 performans kaybı beklenen. Agent sandbox'larında kullan, DB pod'larında kullanma.
2. **KVKK**: Her veri toplama noktasında açık rıza + aydınlatma metni zorunlu. Veri minimizasyonu prensibi.
3. **Timing-safe comparison**: Webhook HMAC doğrulamasında `crypto.timingSafeEqual` kullan. Timing attack'lara karşı koruma.
4. **Kart verisi**: Asla raw kart numarası saklanmamalı. Sadece BIN (ilk 6) ve son 4 hane. iyzico tokenizasyon kullanır.
5. **Consent immutability**: Admin bile consent kayıtlarını değiştiremez. Sadece SELECT, INSERT. UPDATE yok.

## Backend Tasarım Kuralları

1. **Anonymize, don't delete**: KVKK veri silme taleplerinde hard-delete yerine anonimleştirme yap.
2. **Idempotency key**: Her webhook handler'da idempotency key kontrolü olmalı.
3. **High-value trigger**: >10.000 TL ilan fiyatlarında otomatik `pending_review` durumu.
4. **Steganographic watermark**: Zero-width Unicode karakterlerle görünmeyen watermark.
5. **Agent timeout**: Her agent tipi için ayrı timeout süresi.

## Frontend Kuralları

1. **Dark mode default**: Gen-Z kitleye uygun (18-34 yaş). `color-scheme: dark` HTML düzeyinde set et.
2. **Max-w-lg container**: Mobil-first. Desktop'ta centered yaparak tutarlı tasarım sağla.
3. **Glassmorphism = backdrop-blur + transparency**: `backdrop-filter: blur(20px)` performans etkisi yüksek — gereksiz yerde kullanma, fixed header ve bottom nav ile sınırla.
4. **Zustand > Context**: Global state için `zustand` seçildi. Boilerplate yok, selector bazlı re-render.
5. **IntersectionObserver > onScroll**: İnfinite scroll'da IntersectionObserver kullan, scroll event listener'ını asla tercih etme.
6. **WebSocket singleton**: App-wide tek socket instance. Her component kendi event listener'ını ekleyip temizlemeli.
7. **PWA manifest.json**: `display: standalone` + `viewport-fit: cover` + safe-area paddingleri. Notch'lu cihazlarda test et.
8. **Turkish locale everywhere**: `Intl.NumberFormat('tr-TR')` ve `toLocaleDateString('tr-TR')`. Hardcoded format kullanma.

## Kanal Entegrasyonu

1. **WhatsApp Cloud API**: Template mesajlar Meta onayından geçmeli. Freeform mesajlar 24-saat penceresi kuralına tabi.
2. **Telegram bot komutları**: `/` ile başlamalı, Türkçe alternatifler de ekle (`/baslat`). Inline keyboard callback_data 64 byte ile sınırlı.
3. **Kanal-agnostik ajan routing**: Her kanaldan gelen mesaj aynı swarm'a yönlendirilmeli. `userId` prefixi ile kanal bilgisi koru (`wa_`, `tg_`).

## MCP & Agent Interface Kuralları

1. **MCP protocolVersion**: `2024-11-05` kullan (Anthropic standardı). Client info header'ını kabul et ama zorunlu tutma.
2. **Tool inputSchema**: Tüm tool'lar `inputSchema.type = "object"` ile tanımlanmalı. `required` array'i belirle, opsiyonel parametrelere default değer ver.
3. **stdio transport**: MCP server stdin/stdout üzerinden iletişim kurar. Buffer'ı satır bazlı parse et (`readline`). stderr'i log/ready sinyali için kullan.
4. **Turkish tool descriptions**: Ajan keşfi için tool açıklamaları Türkçe yaz. Ajan Türkçe kullanıcıya Türkçe yanıt verebilmeli.
5. **Config file pattern**: CLI config `~/.clawpazar.json`'da sakla. Env var > config file > default sıralamasıyla override et.
6. **Zero dependency CLI**: Node.js `parseArgs` (v18.3+) kullan. chalk, commander, yargs gibi paketlere ihtiyaç yok.

## Production Deployment Kuralları

1. **Rate limiting**: API (30r/s), Auth (5r/m), Webhook (60r/s) ayrı zone'larda tanımla. burst parametresini unutma.
2. **SSL auto-renewal**: certbot + cron (03:00 daily) ile Let's Encrypt sertifikalarını yenile. Renewal sonrası nginx reload.
3. **UFW + Fail2Ban**: SSH (22), HTTP (80), HTTPS (443) dışında tüm portları kapat. Fail2Ban ile brute-force koruması.
4. **Grafana dashboard**: Her metrik için threshold tanımla (error rate >%5 → kırmızı). Custom metric'ler (`clawpazar_*`) için backend'de Prometheus exporter ekle.
5. **Commission invariant**: `commission + subMerchantPrice == totalAmount` her zaman doğru olmalı. Kuruş hassasiyeti: `Math.round(x * 100) / 100`.
6. **Multi-stage Docker build**: `node:20-alpine` + standalone output. Non-root user zorunlu (`adduser --system`).

## Hosting & İş Modeli (OpenClaw Dersleri)

1. **Dual-mode deploy**: `--mode self-host` (varsayılan) ve `--mode managed` ayrımı net olmalı. Managed = otomatik audit + update + backup.
2. **Self-host uyarı**: Her self-host kurulumda güvenlik checklist banner'ı göster. OpenClaw vakası: 10.000+ yanlış yapılandırılmış instance açığa çıktı (Şubat 2026).
3. **Tier SLA**: Her tier için uptime, destek süresi ve yedekleme frekansı açıkça tanımla. JSON schema ile validate et.
4. **Auto-audit cron**: Managed modda günlük security audit. SSL expiry, açık portlar, Docker root konteynerler, disk kullanımı, .env izinleri kontrol edilmeli.
5. **Skill Marketplace**: Ajan skill'leri için %15 komisyon. Skill'ler MCP tool tanımı formında paketlenmeli.
6. **.hosting.json**: Deployment metadata'sını `.hosting.json` dosyasında sakla (mod, tier, versiyon, deploy tarihi). Runtime'da okuyarak özellik kısıtlamaları uygula.
7. **Dry-run**: Her deploy script'inde `--dry-run` flag'i zorunlu. Gerçek değişiklik yapmadan çıktı göstermeli.
8. **Backup tier'lar**: Starter=haftalık, Pro=günlük, Enterprise=saatlik. Backup script ayrı dosya, deploy.sh içine gömme.

## Kargo Kuralları

1. **Opsiyonel kargo**: Yüz yüze teslim varsayılan. Kargo ajan tarafından önerilir, zorunlu değil.
2. **Tek gateway**: Birden fazla kargo özel API yerine tek gateway (Geliver.io veya benzeri) kullan. Demo modda mock dön.
3. **Volumetric weight**: `(L×W×H)/3000` vs. gerçek ağırlık — büyük olanı ücretlendir.
4. **Escrow-delivery link**: `confirmDelivery` → `iyzico.approveEscrow` otomatik zincirlenmeli. İkisini ayrı çağırma.
5. **KVKK adres**: Adres verileri sadece işlem için tutulur. Teslimden 30 gün sonra `anonymizeAddress()` çalışır.
6. **Carrier comparison**: Her zaman fiyata göre sırala, en ucuzu öner ama kullanıcıya seçim bırak.
7. **Tracking events**: Kargo durumu değiştiğinde webhook ile güncelle. WhatsApp/web'de aynı bilgi gösterilmeli.

## Genel Kurallar

1. Plan first, code second. `tasks/todo.md` güncel tutulmalı.
2. Her PR'da "Staff engineer onaylar mı?" sorusu sorulmalı.
3. Over-engineer etme: MVP için gerekli minimum ile başla, scale ettiğinde genişlet.
4. Zero external dependencies prensibi: Native modülleri tercih et.
5. SQL migration'lar numbered ve idempotent olmalı.

