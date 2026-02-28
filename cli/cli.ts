#!/usr/bin/env node

// ClawPazar CLI – Agent & Human Interface
// Zero external dependencies. Uses Node.js native parseArgs.
// Usage: clawpazar <command> [options]

import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ============================================================
// CONFIG
// ============================================================

const CONFIG_PATH = join(homedir(), '.clawpazar.json');
const VERSION = '1.0.0';

interface Config {
    apiUrl: string;
    token: string;
}

function loadConfig(): Config {
    const defaults: Config = {
        apiUrl: process.env.CLAWPAZAR_API_URL || 'http://localhost:4000',
        token: process.env.CLAWPAZAR_TOKEN || '',
    };

    if (existsSync(CONFIG_PATH)) {
        try {
            return { ...defaults, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) };
        } catch {
            return defaults;
        }
    }
    return defaults;
}

function saveConfig(config: Partial<Config>): void {
    const existing = loadConfig();
    writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...config }, null, 2));
}

// ============================================================
// API HELPER
// ============================================================

async function api(method: string, path: string, body?: object): Promise<unknown> {
    const config = loadConfig();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.token) headers['Authorization'] = `Bearer ${config.token}`;

    const res = await fetch(`${config.apiUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(`❌ API ${res.status}: ${(err as Record<string, string>).error || res.statusText}`);
    }

    return res.json();
}

// ============================================================
// FORMATTERS
// ============================================================

function formatPrice(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(amount);
}

function print(data: unknown): void {
    if (typeof data === 'string') {
        console.log(data);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

function printTable(rows: Record<string, unknown>[], columns: string[]): void {
    if (rows.length === 0) {
        console.log('Sonuç bulunamadı.');
        return;
    }

    const widths = columns.map((col) =>
        Math.max(col.length, ...rows.map((r) => String(r[col] || '').slice(0, 40).length))
    );

    const header = columns.map((col, i) => col.padEnd(widths[i])).join(' │ ');
    const sep = widths.map((w) => '─'.repeat(w)).join('─┼─');
    console.log(header);
    console.log(sep);

    for (const row of rows) {
        const line = columns.map((col, i) => String(row[col] || '—').slice(0, 40).padEnd(widths[i])).join(' │ ');
        console.log(line);
    }
}

// ============================================================
// COMMANDS
// ============================================================

const COMMANDS: Record<string, { description: string; run: (args: string[]) => Promise<void> }> = {
    'create-listing': {
        description: 'Yeni ilan oluştur',
        run: async (args) => {
            const { values } = parseArgs({
                args,
                options: {
                    price: { type: 'string', short: 'p' },
                    category: { type: 'string', short: 'c' },
                    images: { type: 'string', short: 'i', multiple: true },
                },
                allowPositionals: true,
            });

            const message = values.price
                ? `${args.filter((a) => !a.startsWith('-')).join(' ')} - ${values.price} TL`
                : args.filter((a) => !a.startsWith('-')).join(' ');

            console.log('🤖 İlan oluşturuluyor...');
            const result = await api('POST', '/api/listings', {
                message,
                images: values.images || [],
                channel: 'cli',
            });
            print(result);
        },
    },

    'search': {
        description: 'İlan ara',
        run: async (args) => {
            const { values, positionals } = parseArgs({
                args,
                options: {
                    city: { type: 'string' },
                    'min-price': { type: 'string' },
                    'max-price': { type: 'string' },
                    sort: { type: 'string' },
                    limit: { type: 'string', default: '10' },
                },
                allowPositionals: true,
            });

            const params = new URLSearchParams();
            if (positionals.length) params.set('search', positionals.join(' '));
            if (values.city) params.set('city', values.city);
            if (values['min-price']) params.set('minPrice', values['min-price']);
            if (values['max-price']) params.set('maxPrice', values['max-price']);
            if (values.sort) params.set('sort', values.sort);
            params.set('limit', values.limit || '10');

            const result = await api('GET', `/api/listings?${params}`) as {
                listings: Array<{ id: string; title: string; price: number; city: string; condition: string }>;
                total: number;
            };

            console.log(`📦 ${result.total} ilan bulundu:\n`);
            printTable(result.listings.map((l) => ({
                id: l.id.slice(0, 8),
                baslik: l.title,
                fiyat: formatPrice(l.price),
                sehir: l.city,
                durum: l.condition,
            })), ['id', 'baslik', 'fiyat', 'sehir', 'durum']);
        },
    },

    'get-auctions': {
        description: 'Aktif mezatları listele',
        run: async () => {
            const result = await api('GET', '/api/auctions') as Array<{
                id: string; current_price: number; bid_count: number; ends_at: string;
                listings?: { title: string };
            }>;

            console.log(`🔨 ${result.length} aktif mezat:\n`);
            printTable(result.map((a) => ({
                id: a.id.slice(0, 8),
                baslik: a.listings?.title || '—',
                fiyat: formatPrice(a.current_price),
                teklif: a.bid_count,
                bitis: new Date(a.ends_at).toLocaleString('tr-TR'),
            })), ['id', 'baslik', 'fiyat', 'teklif', 'bitis']);
        },
    },

    'place-bid': {
        description: 'Mezata teklif ver',
        run: async (args) => {
            const [auctionId, amountStr] = args;
            if (!auctionId || !amountStr) {
                console.error('Kullanım: clawpazar place-bid <auction-id> <tutar>');
                process.exit(1);
            }

            const amount = Number(amountStr);
            console.log(`🔨 ${formatPrice(amount)} teklif veriliyor...`);
            const result = await api('POST', `/api/auctions/${auctionId}/bid`, { amount });
            console.log('✅ Teklif verildi!');
            print(result);
        },
    },

    'start-negotiation': {
        description: 'Pazarlık başlat',
        run: async (args) => {
            const [listingId, amountStr] = args;
            if (!listingId || !amountStr) {
                console.error('Kullanım: clawpazar start-negotiation <listing-id> <tutar>');
                process.exit(1);
            }

            console.log(`💬 ${formatPrice(Number(amountStr))} teklif ile pazarlık başlatılıyor...`);
            const result = await api('POST', '/api/negotiations', {
                listingId,
                offerAmount: Number(amountStr),
            });
            console.log('✅ Pazarlık başladı!');
            print(result);
        },
    },

    'status': {
        description: 'Task durumu sorgula',
        run: async (args) => {
            const [taskId] = args;
            if (!taskId) {
                console.error('Kullanım: clawpazar status <task-id>');
                process.exit(1);
            }

            const result = await api('GET', `/api/agents/tasks/${taskId}`);
            print(result);
        },
    },

    'health': {
        description: 'Platform sağlık durumu',
        run: async () => {
            const result = await api('GET', '/health');
            console.log('🏥 Platform Durumu:');
            print(result);
        },
    },

    'login': {
        description: 'API token ile giriş yap',
        run: async (args) => {
            const { values } = parseArgs({
                args,
                options: {
                    token: { type: 'string', short: 't' },
                    url: { type: 'string', short: 'u' },
                },
            });

            if (values.token) saveConfig({ token: values.token });
            if (values.url) saveConfig({ apiUrl: values.url });

            console.log('✅ Konfigürasyon kaydedildi:', CONFIG_PATH);
            console.log('   API:', loadConfig().apiUrl);
            console.log('   Token:', loadConfig().token ? '●●●●●●●●' : 'yok');
        },
    },
};

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === '--help' || command === '-h') {
        console.log(`
🐾 ClawPazar CLI v${VERSION}
   Türkiye'nin ajan-yönelimli C2C marketplace'i

Komutlar:
${Object.entries(COMMANDS).map(([name, cmd]) => `  ${name.padEnd(22)} ${cmd.description}`).join('\n')}

Seçenekler:
  --help, -h             Bu yardım mesajını göster
  --version, -v          Versiyon bilgisi

Örnekler:
  clawpazar create-listing "iPhone 15 Pro, az kullanılmış" -p 28000
  clawpazar search "ayakkabı" --city istanbul --max-price 5000
  clawpazar place-bid abc123 5500
  clawpazar get-auctions
  clawpazar login -t <jwt-token> -u https://api.clawpazar.com
`);
        return;
    }

    if (command === '--version' || command === '-v') {
        console.log(`clawpazar v${VERSION}`);
        return;
    }

    const cmd = COMMANDS[command];
    if (!cmd) {
        console.error(`❌ Bilinmeyen komut: ${command}\n   Yardım için: clawpazar --help`);
        process.exit(1);
    }

    try {
        await cmd.run(args.slice(1));
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
}

main();
