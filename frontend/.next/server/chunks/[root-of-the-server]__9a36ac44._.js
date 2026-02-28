module.exports = [
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/.next-internal/server/app/api/chat/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClawPazar – Server-side LLM proxy for Agent Chat
// Uses Zhipu AI GLM-5.0-72B via OpenAI-compatible endpoint
// Streams responses back to the client via SSE
__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/server.js [app-route] (ecmascript)");
;
/* ── System Prompt ── */ const SYSTEM_PROMPT = `Sen ClawPazar Ajanısın — Türkiye'nin en güvenilir ikinci el alışveriş platformunun AI asistanı.

## KİMLİĞİN
- Adın: ClawPazar Ajan
- Görevin: Kullanıcılara ikinci el ürün satmaları konusunda adım adım yardımcı olmak
- Kişiliğin: Samimi, profesyonel, hızlı ve güvenilir. Emoji kullan ama abartma.

## TEMEL KURALLAR
1. **Aynı soruyu ASLA tekrarlama.** Kullanıcının daha önce verdiği bilgileri hatırla ve tekrar sorma.
2. **Hızlı ve net ol.** Gereksiz uzun cümleler kurma. Her mesajında bir sonraki adımı belirt.
3. **Türkçe yanıt ver.** Doğal, konuşma dilinde Türkçe kullan.

## İLAN OLUŞTURMA AKIŞI
Bilgi toplama sırası (eksik olanları sor, tamamlanmış olanları tekrar sorma):
1. **Ürün**: Ne satılıyor?
2. **Marka/Model**: Hangi marka, hangi model?
3. **Durum**: Sıfır / İyi / Orta / Kullanılmış
4. **Fiyat**: Kaç TL isteniyor?
5. **Konum**: Hangi şehir?
6. **Fotoğraf**: "Kamera butonuyla fotoğraf ekleyebilirsiniz" hatırlat

Her adımda sadece eksik bilgileri sor. Birden fazla bilgi gelirse hepsini kaydet.

## İLAN TASLAĞI
Tüm bilgiler toplandığında şu formatta ilan taslağı sun:
📋 **İlan Taslağı**
📦 Ürün: [ürün adı]
🏷️ Marka/Model: [marka - model]
📊 Durum: [durum]
💰 Fiyat: [fiyat]₺
📍 Konum: [şehir]

Sonra "İlanı yayınlayayım mı?" diye sor.

## KARGO AKIŞI
Kullanıcı ilanı onayladıktan sonra:
- "📦 Kargoyu ben ayarlayayım mı? ClawPazar güvenli kargo sistemiyle ürününüz sigortalı gönderilir."
- Kargo seçenekleri sun: PTT (39.90₺), MNG (49.90₺), Yurtiçi (54.90₺)
- Alıcı ödemeli / satıcı ödemeli seçeneği belirt

## GÜVENLİK
- **Escrow hatırlat**: "ClawPazar'da ödemeler escrow (güvenli havuz) sistemiyle korunur. Alıcı ürünü teslim alana kadar paranız güvende."
- **Sahtekarlık uyarısı**: Şüpheli fiyatlar (çok düşük), platform dışı ödeme talepleri, kişisel bilgi istekleri konusunda kullanıcıyı uyar.
- Asla kullanıcının kişisel bilgilerini (TC, banka bilgisi vb.) isteme.

## YANITLAMA STİLİ
- Kısa paragraflar kullan
- Madde işaretleriyle bilgileri listele (• veya - kullan, markdown tablo kullanma)
- Emoji ile görselleştir ama her cümleye emoji koyma
- Fiyat ve ürün bilgilerini kalın yap`;
async function POST(req) {
    const apiKey = process.env.ZHIPU_API_KEY;
    const apiBase = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
    const model = process.env.ZHIPU_MODEL || 'glm-5.0-72b';
    if (!apiKey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'LLM API key yapılandırılmamış. .env dosyasına ZHIPU_API_KEY ekleyin.'
        }, {
            status: 500
        });
    }
    let body;
    try {
        body = await req.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Geçersiz istek gövdesi'
        }, {
            status: 400
        });
    }
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'messages dizisi gerekli'
        }, {
            status: 400
        });
    }
    // Build messages array with system prompt + conversation history
    const llmMessages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT
        },
        ...body.messages.map((m)=>({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }))
    ];
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), 60_000); // 60s timeout
        const response = await fetch(`${apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: llmMessages,
                stream: true,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) {
            const errText = await response.text().catch(()=>'Unknown error');
            console.error(`[LLM] API error ${response.status}: ${errText}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `LLM API hatası (${response.status}): ${errText}`
            }, {
                status: 502
            });
        }
        if (!response.body) {
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'LLM yanıt stream yok'
            }, {
                status: 502
            });
        }
        // Stream the SSE response back to client
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const readable = new ReadableStream({
            async start (streamController) {
                const reader = response.body.getReader();
                let buffer = '';
                try {
                    while(true){
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, {
                            stream: true
                        });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';
                        for (const line of lines){
                            const trimmed = line.trim();
                            if (!trimmed || !trimmed.startsWith('data: ')) continue;
                            const data = trimmed.slice(6);
                            if (data === '[DONE]') {
                                streamController.enqueue(encoder.encode('data: [DONE]\n\n'));
                                continue;
                            }
                            try {
                                const json = JSON.parse(data);
                                const content = json.choices?.[0]?.delta?.content;
                                if (content) {
                                    streamController.enqueue(encoder.encode(`data: ${JSON.stringify({
                                        content
                                    })}\n\n`));
                                }
                            } catch  {
                            // Skip malformed JSON chunks
                            }
                        }
                    }
                } catch (err) {
                    console.error('[LLM] Stream read error:', err);
                } finally{
                    streamController.close();
                }
            }
        });
        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        });
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'LLM isteği zaman aşımına uğradı (60s)'
            }, {
                status: 504
            });
        }
        console.error('[LLM] Unexpected error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Beklenmeyen LLM hatası'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9a36ac44._.js.map