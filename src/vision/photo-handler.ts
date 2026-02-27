/**
 * ClawPazar — Vision AI (GLM-4V-Flash)
 */
import { LLM_KEY, LLM_BASE, BOT_TOKEN, TG } from '../config.js';
import type { PhotoAnalysis } from '../types.js';

const VISION_MODEL = 'glm-4v-flash';

export const VISION_SYSTEM = `Sen ClawPazar'ın ürün analiz uzmanısın. Fotoğrafı analiz edip JSON döndür.

KURALLAR:
- SADECE JSON döndür, başka bir şey yazma
- format: {"model": "...", "durum": "sıfır|az kullanılmış|iyi|kullanılmış", "fiyat_min": 0, "fiyat_max": 0, "kategori": "phone|laptop|gaming|fashion|camera|home|other", "aciklama": "kısa 1 cümle"}
- Fiyatları TL cinsinden ver, gerçekçi piyasa fiyatı
- Model bilgisi yoksa "Bilinmiyor" yaz`;

export const pendingPhotos = new Map<number, PhotoAnalysis>();

export async function visionLLM(system: string, imageUrl: string, userText: string): Promise<string> {
    const res = await fetch(`${LLM_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_KEY}` },
        body: JSON.stringify({
            model: VISION_MODEL,
            messages: [
                { role: 'system', content: system },
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        { type: 'text', text: userText },
                    ],
                },
            ],
            temperature: 0.7,
            max_tokens: 300,
        }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Vision LLM ${res.status}: ${errText.slice(0, 100)}`);
    }
    const data = await res.json() as any;
    return (data.choices?.[0]?.message?.content || '').trim();
}

export async function getPhotoUrl(fileId: string): Promise<string> {
    const res = await fetch(`${TG}/getFile?file_id=${fileId}`);
    const data = await res.json() as any;
    if (!data.ok) throw new Error('Fotoğraf alınamadı');
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
}
