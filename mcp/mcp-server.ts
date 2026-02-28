#!/usr/bin/env node

// ClawPazar MCP Server – stdio JSON-RPC
// Agent-accessible interface for AI agents (Claude, GPT, etc.)
// Protocol: Model Context Protocol (MCP) over stdio
// Reference: Anthropic MCP Spec 2025-11-05

import { createInterface } from 'readline';
import type {
    JsonRpcRequest, JsonRpcResponse, McpToolDefinition,
    McpToolResult, McpServerInfo,
} from './mcp-types';

// ============================================================
// CONFIG
// ============================================================

const API_BASE = process.env.CLAWPAZAR_API_URL || 'http://localhost:4000';
const AUTH_TOKEN = process.env.CLAWPAZAR_TOKEN || '';

const SERVER_INFO: McpServerInfo = {
    name: 'clawpazar-mcp',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    capabilities: {
        tools: { listChanged: false },
    },
};

// ============================================================
// TOOL DEFINITIONS (8 tools)
// ============================================================

const TOOLS: McpToolDefinition[] = [
    {
        name: 'create_listing',
        description: 'Yeni ilan oluştur. Ajan, ürün açıklamasını yazar, kategori belirler, fiyat önerir. Sesli mesaj veya metin girişi kabul eder.',
        inputSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'Ürün açıklaması veya kullanıcı mesajı ("iPhone 15 Pro, az kullanılmış, 28.000 TL")' },
                images: { type: 'array', description: 'Ürün fotoğraf URL listesi', items: { type: 'string' } },
                channel: { type: 'string', description: 'Kaynak kanal', enum: ['mcp', 'web', 'whatsapp', 'telegram'], default: 'mcp' },
            },
            required: ['message'],
        },
    },
    {
        name: 'search_listings',
        description: 'İlanları ara. Metin araması, kategori, şehir, fiyat aralığı ve sıralama filtreleri destekler.',
        inputSchema: {
            type: 'object',
            properties: {
                search: { type: 'string', description: 'Arama terimi' },
                category: { type: 'string', description: 'Kategori filtresi' },
                city: { type: 'string', description: 'Şehir filtresi' },
                minPrice: { type: 'number', description: 'Minimum fiyat (₺)' },
                maxPrice: { type: 'number', description: 'Maksimum fiyat (₺)' },
                sort: { type: 'string', description: 'Sıralama', enum: ['price_asc', 'price_desc', 'newest'] },
                page: { type: 'number', description: 'Sayfa numarası', default: 1 },
                limit: { type: 'number', description: 'Sayfa başı sonuç', default: 10 },
            },
        },
    },
    {
        name: 'get_listing',
        description: 'Tek bir ilanın tam detayını getir: fiyat, açıklama, satıcı, fotoğraflar, AI watermark durumu.',
        inputSchema: {
            type: 'object',
            properties: {
                listing_id: { type: 'string', description: 'İlan UUID' },
            },
            required: ['listing_id'],
        },
    },
    {
        name: 'get_auctions',
        description: 'Aktif ve planlanmış mezatları listele. Güncel fiyat, teklif sayısı, bitiş zamanı dahil.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'place_bid',
        description: 'Aktif bir mezata teklif ver. Anti-sniping: son 30 saniyede teklif gelirse süre uzar.',
        inputSchema: {
            type: 'object',
            properties: {
                auction_id: { type: 'string', description: 'Mezat UUID' },
                amount: { type: 'number', description: 'Teklif tutarı (₺)' },
            },
            required: ['auction_id', 'amount'],
        },
    },
    {
        name: 'start_negotiation',
        description: 'Bir ilan için pazarlık başlat. AI ajan otomatik karşı teklif üretir.',
        inputSchema: {
            type: 'object',
            properties: {
                listing_id: { type: 'string', description: 'İlan UUID' },
                offer_amount: { type: 'number', description: 'İlk teklif tutarı (₺)' },
            },
            required: ['listing_id', 'offer_amount'],
        },
    },
    {
        name: 'check_task_status',
        description: 'Ajan task durumunu sorgula (queued, running, completed, failed). create_listing sonrası takip için kullanılır.',
        inputSchema: {
            type: 'object',
            properties: {
                task_id: { type: 'string', description: 'Task UUID' },
            },
            required: ['task_id'],
        },
    },
    {
        name: 'get_platform_health',
        description: 'Platform sağlık durumu: API, swarm manager, IronClaw bridge, veritabanı bağlantısı.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];

// ============================================================
// API CLIENT (internal)
// ============================================================

async function apiRequest(method: string, path: string, body?: object): Promise<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(`API ${res.status}: ${(err as Record<string, string>).error || res.statusText}`);
    }

    return res.json();
}

// ============================================================
// TOOL HANDLERS
// ============================================================

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    try {
        let result: unknown;

        switch (name) {
            case 'create_listing':
                result = await apiRequest('POST', '/api/listings', {
                    message: args.message,
                    images: args.images || [],
                    channel: args.channel || 'mcp',
                });
                break;

            case 'search_listings': {
                const params = new URLSearchParams();
                for (const [k, v] of Object.entries(args)) {
                    if (v !== undefined && v !== null) params.set(k, String(v));
                }
                result = await apiRequest('GET', `/api/listings?${params}`);
                break;
            }

            case 'get_listing':
                result = await apiRequest('GET', `/api/listings/${args.listing_id}`);
                break;

            case 'get_auctions':
                result = await apiRequest('GET', '/api/auctions');
                break;

            case 'place_bid':
                result = await apiRequest('POST', `/api/auctions/${args.auction_id}/bid`, {
                    amount: args.amount,
                });
                break;

            case 'start_negotiation':
                result = await apiRequest('POST', '/api/negotiations', {
                    listingId: args.listing_id,
                    offerAmount: args.offer_amount,
                });
                break;

            case 'check_task_status':
                result = await apiRequest('GET', `/api/agents/tasks/${args.task_id}`);
                break;

            case 'get_platform_health':
                result = await apiRequest('GET', '/health');
                break;

            default:
                return {
                    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
            }],
        };
    } catch (err) {
        return {
            content: [{
                type: 'text',
                text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            }],
            isError: true,
        };
    }
}

// ============================================================
// JSON-RPC DISPATCHER
// ============================================================

async function handleRequest(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = req;

    switch (method) {
        case 'initialize':
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    ...SERVER_INFO,
                    instructions: 'ClawPazar MCP Server — Türkiye\'nin ajan-yönelimli C2C marketplace\'i. İlan oluştur, mezata katıl, pazarlık yap.',
                },
            };

        case 'tools/list':
            return {
                jsonrpc: '2.0',
                id,
                result: { tools: TOOLS },
            };

        case 'tools/call': {
            const toolName = (params as Record<string, unknown>)?.name as string;
            const toolArgs = ((params as Record<string, unknown>)?.arguments || {}) as Record<string, unknown>;
            const result = await handleToolCall(toolName, toolArgs);
            return { jsonrpc: '2.0', id, result };
        }

        case 'ping':
            return { jsonrpc: '2.0', id, result: {} };

        default:
            return {
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: `Method not found: ${method}` },
            };
    }
}

// ============================================================
// STDIO TRANSPORT
// ============================================================

const rl = createInterface({ input: process.stdin, terminal: false });

let buffer = '';

rl.on('line', async (line: string) => {
    buffer += line;

    try {
        const req = JSON.parse(buffer) as JsonRpcRequest;
        buffer = '';

        if (req.jsonrpc !== '2.0') {
            const errResp: JsonRpcResponse = {
                jsonrpc: '2.0',
                id: req.id || 0,
                error: { code: -32600, message: 'Invalid JSON-RPC version' },
            };
            process.stdout.write(JSON.stringify(errResp) + '\n');
            return;
        }

        const response = await handleRequest(req);
        process.stdout.write(JSON.stringify(response) + '\n');
    } catch {
        // Incomplete JSON — wait for more data (Content-Length framing)
        // If it's a parse error on complete input, report it
        if (buffer.trim().length > 0 && !buffer.trim().endsWith('}')) return;

        if (buffer.trim().length > 0) {
            const errResp: JsonRpcResponse = {
                jsonrpc: '2.0',
                id: 0,
                error: { code: -32700, message: 'Parse error' },
            };
            process.stdout.write(JSON.stringify(errResp) + '\n');
            buffer = '';
        }
    }
});

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Announce ready on stderr (Claude Desktop convention)
process.stderr.write('ClawPazar MCP Server ready\n');
