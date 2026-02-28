// ClawPazar – Cloudflare Worker for API Proxy
// Serves as backend API when deployed on Cloudflare Workers (free tier)
// This is a lightweight proxy that routes to the real backend or handles
// LLM chat directly when backend is not available.
//
// Deploy: wrangler deploy
// Env vars needed: ZHIPU_API_KEY, ZHIPU_API_BASE, ZHIPU_MODEL

export interface Env {
    ZHIPU_API_KEY: string;
    ZHIPU_API_BASE: string;
    ZHIPU_MODEL: string;
    BACKEND_URL: string;
    DB: D1Database;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Health check
            if (path === '/health') {
                return json({ status: 'ok', platform: 'cloudflare-workers', timestamp: new Date().toISOString() });
            }

            // LLM Chat — handle directly on edge
            if (path === '/api/chat' && request.method === 'POST') {
                return handleChat(request, env);
            }

            // WhatsApp webhook verification
            if (path === '/api/webhooks/whatsapp' && request.method === 'GET') {
                const challenge = url.searchParams.get('hub.challenge');
                return new Response(challenge || '', { status: 200 });
            }

            // WhatsApp webhook — receive messages
            if (path === '/api/webhooks/whatsapp' && request.method === 'POST') {
                const body = await request.json() as Record<string, unknown>;
                console.log('[WhatsApp Webhook]', JSON.stringify(body));
                // TODO: Route to backend when available
                return json({ status: 'received' });
            }

            // Telegram webhook — receive messages
            if (path === '/api/webhooks/telegram' && request.method === 'POST') {
                const body = await request.json() as Record<string, unknown>;
                console.log('[Telegram Webhook]', JSON.stringify(body));
                // TODO: Route to backend when available
                return json({ status: 'received' });
            }

            // Proxy all other /api/* routes to backend
            if (path.startsWith('/api/') && env.BACKEND_URL) {
                const backendUrl = `${env.BACKEND_URL}${path}${url.search}`;
                const proxyResponse = await fetch(backendUrl, {
                    method: request.method,
                    headers: request.headers,
                    body: request.method !== 'GET' ? request.body : undefined,
                });
                const responseHeaders = new Headers(proxyResponse.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => responseHeaders.set(k, v));
                return new Response(proxyResponse.body, {
                    status: proxyResponse.status,
                    headers: responseHeaders,
                });
            }

            return json({ error: 'Not Found' }, 404);
        } catch (err) {
            console.error('[Worker Error]', err);
            return json({ error: 'Internal Server Error' }, 500);
        }
    },
};

// ── LLM Chat Handler ──

async function handleChat(request: Request, env: Env): Promise<Response> {
    const apiKey = env.ZHIPU_API_KEY;
    const apiBase = env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
    const model = env.ZHIPU_MODEL || 'glm-4-flash';

    if (!apiKey) {
        return json({ error: 'ZHIPU_API_KEY not configured' }, 500);
    }

    const body = await request.json() as { messages: { role: string; content: string }[] };

    const SYSTEM_PROMPT = `Sen ClawPazar Ajanısın — Türkiye'nin en güvenilir ikinci el alışveriş platformunun AI asistanı.
Adın: ClawPazar Ajan. Görevin: Kullanıcılara ikinci el ürün satmaları konusunda adım adım yardımcı olmak.
Kişiliğin: Samimi, profesyonel, hızlı. Türkçe yanıt ver.
Aynı soruyu ASLA tekrarlama. Hızlı ve net ol.
İlan oluşturma: Ürün → Marka → Durum → Fiyat → Konum → Fotoğraf sırası.
Kargo: PTT (39.90₺), MNG (49.90₺), Yurtiçi (54.90₺).
Escrow hatırlat. Sahtekarlık uyarısı yap.`;

    const llmMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...body.messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'agent' ? 'assistant' : m.role,
            content: m.content,
        })),
    ];

    const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: llmMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1024,
        }),
    });

    if (!response.ok || !response.body) {
        return json({ error: `LLM API error: ${response.status}` }, 502);
    }

    // Stream SSE back to client
    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            ...CORS_HEADERS,
        },
    });
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
}
