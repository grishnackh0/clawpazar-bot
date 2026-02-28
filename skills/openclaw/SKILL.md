---
name: openclaw-marketplace
description: ClawPazar MCP skill — Ajan-yönelimli C2C marketplace. İlan oluştur, mezata katıl, pazarlık yap.
---

# OpenClaw – ClawPazar MCP Skill

> **Build. For. Agents.** — Bu skill, herhangi bir MCP-uyumlu ajanın ClawPazar marketplace'ine erişmesini sağlar.

## Kurulum

### Claude Desktop (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "clawpazar": {
      "command": "node",
      "args": ["path/to/clawpazar/mcp/mcp-server.ts"],
      "env": {
        "CLAWPAZAR_API_URL": "https://api.clawpazar.com",
        "CLAWPAZAR_TOKEN": "your-jwt-token"
      }
    }
  }
}
```

### Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|-----------|
| `CLAWPAZAR_API_URL` | API base URL | `http://localhost:4000` |
| `CLAWPAZAR_TOKEN` | JWT auth token | — |

## Araçlar (Tools)

### 1. `create_listing`
Yeni ilan oluştur. Ajan ürün detaylarını mesaj olarak yazar, swarm işler.

**Girdi:**
- `message` (string, zorunlu): Ürün açıklaması
- `images` (string[], opsiyonel): Fotoğraf URL'leri
- `channel` (string): "mcp" | "web" | "whatsapp" | "telegram"

**Çıktı:** `{ taskId, status, message }`

**Örnek:**
```
Kullanıcı: "Az kullanılmış iPhone 15 Pro Max, 256 GB, siyah, 28.000 TL"
Ajan → create_listing(message: "Az kullanılmış iPhone 15 Pro Max, 256 GB, siyah, 28.000 TL")
Yanıt: { taskId: "abc-123", status: "processing" }
```

### 2. `search_listings`
İlan ara. Filtreler: kategori, şehir, fiyat aralığı, sıralama.

**Girdi:** `search`, `category`, `city`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`

### 3. `get_listing`
Tek ilan detayı. Fiyat, açıklama, satıcı, fotoğraflar, AI watermark.

**Girdi:** `listing_id` (string, zorunlu)

### 4. `get_auctions`
Aktif ve planlanmış mezatlar. Güncel fiyat, teklif sayısı, bitiş zamanı.

### 5. `place_bid`
Mezata teklif ver. Anti-sniping: son 30 sn'de teklif → süre uzar.

**Girdi:** `auction_id`, `amount` (₺)

### 6. `start_negotiation`
Pazarlık başlat. AI ajan otomatik karşı teklif üretir.

**Girdi:** `listing_id`, `offer_amount` (₺)

### 7. `check_task_status`
Task durumu sorgula: queued → running → completed | failed

**Girdi:** `task_id` (string)

### 8. `get_platform_health`
Platform sağlık durumu: API, swarm, IronClaw, DB.

## Auth Akışı

1. Kullanıcı `/auth` sayfasından telefon + OTP ile giriş yapar
2. JWT token alır
3. Token'ı `CLAWPAZAR_TOKEN` olarak MCP config'e ekler
4. Ajan artık authenticated tool call yapabilir

## Kullanım Senaryoları

### Senaryo 1: Ajan ile İlan Oluşturma
```
Kullanıcı: "PlayStation 5 satmak istiyorum, kutusu dahil"
Ajan:
  1. create_listing(message: "PlayStation 5, kutusu dahil") → taskId
  2. check_task_status(task_id: taskId) → status: completed
  3. "İlanınız oluşturuldu! Yayınlamak ister misiniz?"
```

### Senaryo 2: Otomatik Fiyat Karşılaştırması
```
Ajan:
  1. search_listings(search: "PlayStation 5", sort: "price_asc", limit: 5)
  2. Fiyat analizi yapar: "Piyasa ortalaması 12.500 ₺, sizinki 12.000 ₺ ile rekabetçi"
```

### Senaryo 3: Mezat Takibi
```
Ajan:
  1. get_auctions() → aktif mezatlar
  2. Kullanıcıya ilginç mezatları sunar
  3. place_bid(auction_id, amount) → teklif verir
  4. "Teklifiniz verildi! Güncel en yüksek teklif sizsiniz 🎉"
```
