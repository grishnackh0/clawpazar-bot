// ClawPazar – Server-side LLM proxy for Agent Chat
// Uses Zhipu AI GLM-5.0-72B via OpenAI-compatible endpoint
// Streams responses back to the client via SSE

import { NextRequest, NextResponse } from 'next/server';

/* ── System Prompt ── */

const SYSTEM_PROMPT = `Sen ClawPazar'sın — Türkiye'nin en hızlı ve en güvenilir ikinci el alışveriş platformunun AI satış koçu.

SEN CHATBOT DEĞİLSİN. Sen gerçek bir pazaryeri asistanısın. Kullanıcıya satış heyecanı ver, alışveriş enerjisi kat.

## KİŞİLİĞİN
- Enerjik, samimi, güven veren. Arkadaşına tavsiye verir gibi konuş.
- "Bu fırsat kaçmaz!", "Harika seçim!", "Bunu hızlı kapan kazanır!" gibi ifadeler kullan.
- Her mesajın sonunda kullanıcıyı bir sonraki adıma yönlendir.
- Kısa ve vurucu cümleler. Max 3-4 satır.

## SATIŞ AKIŞI (form değil, doğal sohbet)
Kullanıcı ürün satmak istediğinde:
1. Heyecanla karşıla: "Harika! [ürün] şu an çok aranan bir ürün 🔥"
2. Eksik bilgileri DOĞAL şekilde sor — form gibi değil, sohbet gibi
3. Fiyat önerisi ver: "Piyasada bu model 25-30K arası gidiyor, senin fiyatın çok iyi!"
4. İlan taslağını heyecanla sun ve "Bu ilan saatler içinde 500+ kişiye ulaşacak! Yayınlayalım mı? 🚀" de

## ALICI AKIŞI
- "Hemen bakalım! Harika fırsatlar var" ile başla
- Bütçe ve tercih sor, uygun öneriler sun

## KARGO & GÜVENLİK
- İlan sonrası doğal hatırlat: "Kargo ve ödeme konusunda endişelenme. Güvenli kargo sistemiyle ürünün sigortalı gönderiliyor 📦"
- Kargo seçenekleri: Sürat 40₺, Aras 42₺, Yurtiçi 45₺
- Escrow: "Paranız güvende tutulur. Alıcı onaylayana kadar kimse dokunmaz ✅"

## YASAKLAR
- Aynı soruyu ASLA tekrarlama
- Form dolduruyor hissi verme
- Robotik konuşma
- TC, IBAN, banka bilgisi ASLA isteme
- Şüpheli fiyat/ödeme talebi varsa uyar`;

/* ── Types ── */

interface ChatRequestBody {
  messages: { role: string; content: string }[];
}

/* ── Route Handler ── */

export async function POST(req: NextRequest) {
  const apiKey = process.env.ZHIPU_API_KEY;
  const apiBase = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
  const model = process.env.ZHIPU_MODEL || 'glm-5.0-72b';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'LLM API key yapılandırılmamış. .env dosyasına ZHIPU_API_KEY ekleyin.' },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages dizisi gerekli' }, { status: 400 });
  }

  // Build messages array with system prompt + conversation history
  const llmMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...body.messages.map((m) => ({
      role: m.role === 'agent' ? 'assistant' : m.role,
      content: m.content,
    })),
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

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
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      console.error(`[LLM] API error ${response.status}: ${errText}`);
      return NextResponse.json(
        { error: `LLM API hatası (${response.status}): ${errText}` },
        { status: 502 }
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: 'LLM yanıt stream yok' }, { status: 502 });
    }

    // Stream the SSE response back to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async start(streamController) {
        const reader = response.body!.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
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
                  streamController.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        } catch (err) {
          console.error('[LLM] Stream read error:', err);
        } finally {
          streamController.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'LLM isteği zaman aşımına uğradı (60s)' }, { status: 504 });
    }
    console.error('[LLM] Unexpected error:', err);
    return NextResponse.json({ error: 'Beklenmeyen LLM hatası' }, { status: 500 });
  }
}
