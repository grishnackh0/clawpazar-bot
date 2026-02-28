/**
 * ClawPazar — Main Bot Entry Point
 * Imports all modules and runs Telegram polling + webhook server
 */
import '../config.js';
import { TG, LLM_KEY, LLM_BASE, LLM_MODEL, BOT_TOKEN, WA_ACCESS_TOKEN, WA_PHONE_ID, WA_VERIFY_TOKEN, IYZICO_API_KEY, supabase } from '../config.js';
import type { Msg, AgentType, InlineKeyboard, PhotoAnalysis } from '../types.js';
import { eventStore } from '../core/event-store.js';
import { memory, protocol, trustEngine, collusionDetector, kvkkManager } from '../agents/trust-engine.js';
import { visionLLM, getPhotoUrl, VISION_SYSTEM, pendingPhotos } from '../vision/photo-handler.js';
import { db, formatListing, formatAuction } from '../db/data-layer.js';
import { escrowService, HIGH_VALUE_THRESHOLD } from '../payment/escrow-service.js';
import { wa, waSend } from '../messaging/whatsapp-client.js';

// ═══════════════════════════════════════════════════════════════
// AGENT PROMPTS
// ═══════════════════════════════════════════════════════════════

const PROMPTS: Record<AgentType, string> = {
    listing: `Sen bir pazar yeri asistanısın. İlan oluşturmaya yardım ediyorsun.\nKURALLAR:\n- Max 1-2 cümle! Kısa ve esprili.\n- SADECE TÜRKÇE konuş.\n- İç sistem isimlerini ASLA söyleme.\n- Kullanıcıya "harika seçim!", "bu uçar gider!" gibi motivasyon ver.`,
    buyer: `Sen bir pazar yeri asistanısın. Ürün aramaya yardım ediyorsun.\nKURALLAR:\n- Max 1-2 cümle!\n- SADECE TÜRKÇE konuş.\n- İç sistem isimlerini ASLA söyleme.\n- Ürün öner, fiyat bilgisi ver.`,
    negotiator: `Sen bir pazar yeri asistanısın. Pazarlık yapılıyor.\nKURALLAR:\n- Max 1-2 cümle! Stratejik ol.\n- SADECE TÜRKÇE konuş.\n- İç sistem isimlerini ASLA söyleme.`,
    auctioneer: `Sen bir pazar yeri asistanısın. Mezat yönetiyorsun.\nKURALLAR:\n- Max 1-2 cümle! Heyecan kat.\n- SADECE TÜRKÇE konuş.\n- İç sistem isimlerini ASLA söyleme.`,
    shipping: `Sen bir pazar yeri asistanısın. Kargo işlemi yapılıyor.\nKURALLAR:\n- Max 1-2 cümle!\n- SADECE TÜRKÇE konuş.`,
    compliance: `Sen bir pazar yeri güvenlik asistanısın.\nKURALLAR:\n- Max 1-2 cümle!\n- Platform dışı ödeme uyar.\n- SADECE TÜRKÇE konuş.`,
    general: `Sen ClawPazar asistanısın. Kullanıcılara alım-satım konusunda yardım ediyorsun.\nKURALLAR:\n- Max 1-2 cümle! Samimi, kısa.\n- SADECE TÜRKÇE konuş, başka dil YASAK!\n- İç sistem isimlerini ASLA söyleme (ajan adı, modül adı vb).\n- Kullanıcıyı sat/al/keşfet aksiyonlarına yönlendir.`,
};

// Locale-safe Turkish lowercase
function trLower(s: string): string {
    return s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş').replace(/Ç/g, 'ç').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ğ/g, 'ğ').toLowerCase();
}

// ═══════════════════════════════════════════════════════════════
// LISTING DRAFT STATE MACHINE
// ═══════════════════════════════════════════════════════════════

interface ListingDraft {
    category?: string;
    model?: string;
    condition?: string;
    price?: number;
    city?: string;
    step: 'category' | 'model' | 'condition' | 'price' | 'city' | 'confirm';
}

const listingDrafts = new Map<number, ListingDraft>();

function getDraft(chatId: number): ListingDraft {
    if (!listingDrafts.has(chatId)) listingDrafts.set(chatId, { step: 'category' });
    return listingDrafts.get(chatId)!;
}

// Persist draft to Supabase (async, non-blocking)
async function saveDraftToDB(chatId: number) {
    if (!supabase) return;
    const d = listingDrafts.get(chatId);
    if (!d) return;
    await supabase.from('listing_drafts').upsert({
        chat_id: chatId, category: d.category || null, model: d.model || null,
        condition: d.condition || null, price: d.price || null,
        city: d.city || null, step: d.step, updated_at: new Date().toISOString(),
    }).then(({ error }) => { if (error) console.error('[Draft] save:', error.message); });
}

async function deleteDraftFromDB(chatId: number) {
    listingDrafts.delete(chatId);
    if (supabase) await supabase.from('listing_drafts').delete().eq('chat_id', chatId).then(() => { });
}

async function loadDraftsFromDB() {
    if (!supabase) return;
    const { data } = await supabase.from('listing_drafts').select('*');
    if (!data) return;
    for (const row of data) {
        listingDrafts.set(row.chat_id, {
            category: row.category, model: row.model, condition: row.condition,
            price: row.price ? Number(row.price) : undefined, city: row.city, step: row.step,
        });
    }
    console.log(`[Drafts] Loaded ${data.length} drafts from Supabase`);
}

function draftSummary(d: ListingDraft): string {
    const cat: Record<string, string> = { Telefon: '📱', Bilgisayar: '💻', Gaming: '🎮', Giyim: '👟', Kamera: '📸', Ev: '🏠' };
    const emoji = cat[d.category || ''] || '📦';
    let s = `${emoji} *İlan Taslağı*\n\n`;
    if (d.model) s += `📌 *Ürün:* ${d.model}\n`;
    if (d.category) s += `🏷️ *Kategori:* ${d.category}\n`;
    if (d.condition) s += `✨ *Durum:* ${d.condition}\n`;
    if (d.price) s += `💰 *Fiyat:* ${d.price.toLocaleString('tr-TR')} ₺\n`;
    if (d.city) s += `📍 *Şehir:* ${d.city}\n`;
    return s;
}

async function handleListingStep(chatId: number, text: string, firstName: string) {
    const draft = getDraft(chatId);

    switch (draft.step) {
        case 'category':
            // Category is set by button callback, if user types text treat as model+category
            const signals = extractSignals(text);
            if (signals.category) {
                draft.category = signals.category;
                draft.model = text.trim();
                draft.step = 'condition';
                saveDraftToDB(chatId);
                await send(chatId, `${text} — harika seçim! ✨\n\nDurumu ne?`, KB.condition);
            } else {
                draft.model = text.trim();
                draft.step = 'condition';
                saveDraftToDB(chatId);
                await send(chatId, `${text} — güzel ürün! 🔥\n\nDurumu ne?`, KB.condition);
            }
            return true;

        case 'model':
            draft.model = text.trim();
            draft.step = 'condition';
            saveDraftToDB(chatId);
            await send(chatId, `${draft.model} — bu uçar gider! 🚀\n\nDurumu ne?`, KB.condition);
            return true;

        case 'condition':
            // Condition usually set by button, but handle text too
            draft.condition = text.trim();
            draft.step = 'price';
            saveDraftToDB(chatId);
            await send(chatId, `Fiyat ne kadar? (TL olarak yaz)\n\n💡 Örnek: 12000`);
            return true;

        case 'price': {
            const priceMatch = text.match(/(\d[\d.,]*)/);
            if (priceMatch) {
                draft.price = parseInt(priceMatch[1].replace(/[.,]/g, ''));
                draft.step = 'city';
                saveDraftToDB(chatId);
                await send(chatId, `💰 ${draft.price.toLocaleString('tr-TR')} ₺ — iyi fiyat!\n\nŞehir? (İstanbul, Ankara, İzmir...)`);
            } else {
                await send(chatId, `Rakam olarak yaz: örn. 12000`);
            }
            return true;
        }

        case 'city':
            draft.city = text.trim();
            draft.step = 'confirm';
            saveDraftToDB(chatId);
            await send(chatId, `${draftSummary(draft)}\n\nYayınlayalım mı? 🔥`, KB.confirm);
            return true;

        case 'confirm':
            return false; // Let button handler take over
    }
    return false;
}

function buildPrompt(agent: AgentType, userId: number): string {
    const userContext = memory.summarize(userId);
    const coordination = protocol.getCoordinationContext(agent, userId);
    return `${PROMPTS[agent]}\n\n[KULLANICI PROFİLİ]\n${userContext}\n${coordination}`;
}

// ═══════════════════════════════════════════════════════════════
// TELEGRAM UX (Keyboards)
// ═══════════════════════════════════════════════════════════════

const KB = {
    main: (userId: number): InlineKeyboard => {
        const profile = memory.get(userId);
        if (profile.sellerScore > 0.7) return [
            [{ text: '📦 Yeni İlan Oluştur', callback_data: 'sell' }, { text: '🛒 Ürün Ara', callback_data: 'buy' }],
            [{ text: '⚡ Mezat Aç', callback_data: 'auction' }, { text: '📊 İstatistiklerim', callback_data: 'stats' }],
        ];
        if (profile.buyerScore > 0.7) return [
            [{ text: '🛒 Ürün Ara', callback_data: 'buy' }, { text: '📦 Satmak İstiyorum', callback_data: 'sell' }],
            [{ text: '🔔 Fırsatlar', callback_data: 'deals' }, { text: '⚡ Mezatlar', callback_data: 'auction' }],
        ];
        return [
            [{ text: '📦 Satmak İstiyorum', callback_data: 'sell' }, { text: '🛒 Almak İstiyorum', callback_data: 'buy' }],
            [{ text: '⚡ Mezat', callback_data: 'auction' }, { text: '🔍 Keşfet', callback_data: 'explore' }],
        ];
    },
    categories: [
        [{ text: '📱 Telefon', callback_data: 'cat_phone' }, { text: '💻 Bilgisayar', callback_data: 'cat_laptop' }],
        [{ text: '🎮 Gaming', callback_data: 'cat_gaming' }, { text: '👟 Giyim', callback_data: 'cat_fashion' }],
        [{ text: '📸 Kamera', callback_data: 'cat_camera' }, { text: '🏠 Ev', callback_data: 'cat_home' }],
    ] as InlineKeyboard,
    condition: [
        [{ text: '✨ Sıfır', callback_data: 'cond_new' }, { text: '👍 Az Kullanılmış', callback_data: 'cond_likenew' }],
        [{ text: '👌 İyi', callback_data: 'cond_good' }, { text: '🔧 Kullanılmış', callback_data: 'cond_used' }],
    ] as InlineKeyboard,
    confirm: [
        [{ text: '🚀 Yayınla!', callback_data: 'confirm_yes' }, { text: '✏️ Düzenle', callback_data: 'confirm_edit' }],
        [{ text: '⚡ Mezata Koy', callback_data: 'to_auction' }],
    ] as InlineKeyboard,
    shipping: [
        [{ text: '🚀 Sürat 40₺', callback_data: 'ship_surat' }, { text: '📦 Aras 42₺', callback_data: 'ship_aras' }],
        [{ text: '🚛 Yurtiçi 45₺', callback_data: 'ship_yurtici' }, { text: '📮 PTT 35₺', callback_data: 'ship_ptt' }],
    ] as InlineKeyboard,
    postListing: [
        [{ text: '🚚 Kargo Ayarla', callback_data: 'to_shipping' }, { text: '📢 Paylaş', callback_data: 'share' }],
        [{ text: '⚡ Mezata Koy', callback_data: 'to_auction' }],
    ] as InlineKeyboard,
    buyActions: [
        [{ text: '💰 Hemen Al', callback_data: 'buy_now' }, { text: '🤝 Pazarlık', callback_data: 'negotiate' }],
        [{ text: '🔔 Fiyat Alarmı', callback_data: 'alert' }, { text: '🔙 Diğer Ürünler', callback_data: 'buy' }],
    ] as InlineKeyboard,
    detail: (level: 'brief' | 'full') => level === 'brief'
        ? [[{ text: '📋 Detay Göster', callback_data: 'detail_full' }]] as InlineKeyboard
        : [[{ text: '📋 Özet Göster', callback_data: 'detail_brief' }]] as InlineKeyboard,
};

// ═══════════════════════════════════════════════════════════════
// LLM + TELEGRAM API
// ═══════════════════════════════════════════════════════════════

async function llm(system: string, msgs: Msg[]): Promise<string> {
    const res = await fetch(`${LLM_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_KEY}` },
        body: JSON.stringify({
            model: LLM_MODEL,
            messages: [{ role: 'system', content: system }, ...msgs],
            temperature: 0.85, max_tokens: 200, top_p: 0.9,
        }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = await res.json() as any;
    return (data.choices?.[0]?.message?.content || '').trim();
}

async function send(chatId: number, text: string, keyboard?: InlineKeyboard) {
    const body: any = { chat_id: chatId, text, parse_mode: 'Markdown' };
    if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
    const r = await fetch(`${TG}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) {
        delete body.parse_mode;
        await fetch(`${TG}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
    }
}

async function answerCB(id: string, text?: string) {
    await fetch(`${TG}/answerCallbackQuery`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id, text: text || '✅' }),
    }).catch(() => { });
}

async function typing(chatId: number) {
    await fetch(`${TG}/sendChatAction`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
    }).catch(() => { });
}

// ═══════════════════════════════════════════════════════════════
// SWARM COORDINATOR
// ═══════════════════════════════════════════════════════════════

const conversations = new Map<number, Msg[]>();
const activeAgent = new Map<number, AgentType>();

function getHistory(chatId: number): Msg[] {
    if (!conversations.has(chatId)) conversations.set(chatId, []);
    return conversations.get(chatId)!;
}

function addMsg(chatId: number, role: 'user' | 'assistant', content: string) {
    const h = getHistory(chatId);
    h.push({ role, content });
    if (h.length > 20) h.splice(0, h.length - 20);
    // Async persist to Supabase (non-blocking)
    if (supabase) {
        supabase.from('chat_history').insert({
            chat_id: String(chatId), channel: 'telegram', role, content,
        }).then(({ error }) => { if (error) console.error('[Chat] save:', error.message); });
    }
}

function classify(text: string): AgentType {
    const t = trLower(text);
    // Listing: satmak, satıyorum, satayım, satacağım, satıcam, ilan oluştur
    if (/sat(mak|ıyorum|ayım|alım|ış|acağ|ıcam|ıyım|ılık)|ilan\s*(oluştur|ver|aç)|satıl|\bsat\b/i.test(t)) return 'listing';
    // Buyer: almak, alıyorum, alacağım, alıcam, arıyorum, bakıyorum, bul, istiyorum, göster, keşfet
    if (/al(mak|ıyorum|ayım|acağ|ıcam|ıyım)|ar[ıa]yorum|bak(ıyorum|alım)|bul|ara(mak)?|fırsat|göster|keşfet|ilan|istiyorum|bakmak|nereden|nerede|fiyat/i.test(t)) return 'buyer';
    if (/pazarlık|teklif|indir(im)?|fiyat.*düş/i.test(t)) return 'negotiator';
    if (/mezat|açık\s*art[ıi]rma|auction|müzayede/i.test(t)) return 'auctioneer';
    if (/kargo|teslimat|gönderi|takip|paketle/i.test(t)) return 'shipping';
    if (/güvenli|şikayet|dolandır|iade|kvkk/i.test(t)) return 'compliance';
    return 'general';
}

function extractSignals(text: string): { category?: string; price?: number; city?: string; intent?: 'buy' | 'sell'; interest?: string } {
    const signals: any = {};
    if (/iphone|samsung|telefon|pixel/i.test(text)) signals.category = 'Telefon';
    if (/macbook|laptop|bilgisayar|pc/i.test(text)) signals.category = 'Bilgisayar';
    if (/ps5|xbox|nintendo|konsol/i.test(text)) signals.category = 'Gaming';
    if (/sat(mak|ıyorum|acağ|ıcam)/i.test(text)) signals.intent = 'sell';
    if (/al(mak|ıyorum|acağ|ıcam)|arıyorum|istiyorum/i.test(text)) signals.intent = 'buy';
    const priceMatch = text.match(/(\d{1,3}[.,]?\d{3})\s*(tl|₺|lira)?/i);
    if (priceMatch) signals.price = parseInt(priceMatch[1].replace(/[.,]/g, ''));
    const cityMatch = text.match(/(istanbul|ankara|izmir|bursa|antalya|adana|konya|gaziantep)/i);
    if (cityMatch) signals.city = cityMatch[1];
    return signals;
}

async function handleAgent(chatId: number, text: string) {
    const detected = classify(text);
    const current = activeAgent.get(chatId);
    const agent = (detected !== 'general') ? detected : (current || 'general');
    activeAgent.set(chatId, agent);

    // Listing flow: use state machine instead of LLM
    if (agent === 'listing' && listingDrafts.has(chatId)) {
        const handled = await handleListingStep(chatId, text, '');
        if (handled) return;
    }

    const signals = extractSignals(text);
    if (Object.keys(signals).length) memory.learn(chatId, signals);
    eventStore.append('message', chatId, { text, agent }, agent);
    addMsg(chatId, 'user', text);
    await typing(chatId);

    try {
        const prompt = buildPrompt(agent, chatId);
        const response = await llm(prompt, getHistory(chatId));
        addMsg(chatId, 'assistant', response);
        eventStore.append('response', chatId, { agent, response: response.slice(0, 100) }, agent);

        let kb: InlineKeyboard | undefined;
        if (/durum|kondisyon|kullanılmış.*mı|sıfır.*mı/i.test(response)) kb = KB.condition;
        else if (/yayınla|taslağ|ilan.*hazır/i.test(response)) kb = KB.confirm;
        else if (/kargo|gönderi/i.test(response)) kb = KB.shipping;
        else if (/hemen al|satın al/i.test(response)) kb = KB.buyActions;
        else kb = KB.main(chatId);

        // Clean response: never show internal names
        const clean = response.replace(/NanoClaw|IronClaw|Listing Agent|Buyer Agent|Compliance Agent/gi, '').trim();
        await send(chatId, clean, kb);
    } catch (err: any) {
        console.error(`[${chatId}] Error:`, err.message);
        await send(chatId, '❌ Hata, tekrar dene.', KB.main(chatId));
    }
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleWhatsAppMessage(phone: string, msg: any) {
    const waId = parseInt(phone.replace(/\D/g, '').slice(-9), 10) || Date.now();
    if (msg.id) wa.markRead(msg.id);

    if (msg.type === 'interactive' && msg.interactive?.button_reply) {
        const data = msg.interactive.button_reply.id;
        eventStore.append('wa_button', waId, { action: data });
        if (data === 'sell') { activeAgent.set(waId, 'listing'); memory.learn(waId, { intent: 'sell' }); await waSend(phone, '📦 Ne satıyoruz? Ürünü kısaca yaz!'); }
        else if (data === 'buy') { activeAgent.set(waId, 'buyer'); memory.learn(waId, { intent: 'buy' }); await waSend(phone, '🛒 Ne arıyorsun? Yaz, bulayım!'); }
        else if (data === 'explore') {
            const listings = await db.getListings({ limit: 3 });
            if (listings.length === 0) await waSend(phone, '🔍 Henüz ilan yok. İlkını sen ver!');
            else await waSend(phone, `🔍 Son İlanlar:\n${listings.map((l, i) => formatListing(l, i + 1)).join('\n')}`);
        } else if (data === 'buy_now') {
            const tc = trustEngine.canAct(waId, 'buy_now');
            if (!tc.allowed) await waSend(phone, `🔒 ${tc.reason}`);
            else { trustEngine.recordSuccess(waId); const e = await escrowService.initEscrow({ buyerId: waId, amount: 1000, listingTitle: 'Ürün' }); await waSend(phone, `💰 Escrow başladı! ${escrowService.summarize(e)}`); }
        } else if (data === 'photo_confirm') {
            const photo = pendingPhotos.get(waId);
            if (photo) {
                const tc = trustEngine.canAct(waId, 'create_listing');
                if (tc.allowed) { trustEngine.recordSuccess(waId); eventStore.append('listing_published', waId, { status: 'live', source: 'photo_ai_wa' }, 'listing'); memory.learn(waId, { category: photo.kategori, price: photo.fiyat_max, intent: 'sell' }); pendingPhotos.delete(waId); await waSend(phone, `✅ ${photo.model} yayında!`); }
                else await waSend(phone, `🔒 ${tc.reason}`);
            }
        } else {
            await waSend(phone, 'Ne yapmak istersin?', [[{ text: '📦 Sat', callback_data: 'sell' }, { text: '🛒 Al', callback_data: 'buy' }], [{ text: '🔍 Keşfet', callback_data: 'explore' }]]);
        }
        return;
    }

    if (msg.type === 'image' && msg.image?.id) {
        const tc = trustEngine.canAct(waId, 'create_listing');
        if (!tc.allowed) { await waSend(phone, `🔒 ${tc.reason}`); return; }
        if (!kvkkManager.hasConsent(waId)) await waSend(phone, '📸 Fotoğraf aldım! KVKK onayın yok.');
        try {
            const mediaUrl = await wa.getMediaUrl(msg.image.id);
            if (!mediaUrl) throw new Error('Media URL alınamadı');
            const raw = await visionLLM(VISION_SYSTEM, mediaUrl, msg.image.caption || 'Bu ürünü analiz et');
            let j = raw; const jm = raw.match(/```(?:json)?\s*([\s\S]*?)```/); if (jm) j = jm[1].trim(); const bm = j.match(/\{[\s\S]*\}/); if (bm) j = bm[0];
            const analysis: PhotoAnalysis = JSON.parse(j);
            pendingPhotos.set(waId, analysis); eventStore.append('wa_photo_analyzed', waId, { model: analysis.model });
            await wa.sendInteractive(phone, `📸 AI Analizi:\n📌 ${analysis.model}\n💰 ${analysis.fiyat_min.toLocaleString('tr-TR')}–${analysis.fiyat_max.toLocaleString('tr-TR')} ₺\n${analysis.aciklama}`, [{ id: 'photo_confirm', title: 'Onayla' }, { id: 'photo_edit', title: 'Duzenle' }]);
        } catch (err: any) { await waSend(phone, '📸 Analiz çalışmıyor. Ürünü yaz!'); }
        return;
    }

    if (msg.type === 'text' && msg.text?.body) {
        const text = msg.text.body.trim();
        if (text.toLowerCase() === 'merhaba' || text.toLowerCase() === 'hi' || text === '/start') {
            if (!kvkkManager.hasConsent(waId)) await wa.sendInteractive(phone, '🐾 ClawPazar\'a hoşgeldin! 🚀\n\nKVKK onayı ver?', [{ id: 'kvkk_yes', title: 'Kabul Ediyorum' }, { id: 'kvkk_no', title: 'Reddet' }]);
            else await wa.sendInteractive(phone, '🐾 ClawPazar! Ne yapmak istersin?', [{ id: 'sell', title: 'Sat' }, { id: 'buy', title: 'Al' }, { id: 'explore', title: 'Kesfet' }]);
            return;
        }
        if (text === '/durum') {
            const es = eventStore.stats(); const trust = trustEngine.get(waId);
            const level = trust.score >= 0.8 ? 'Güvenilir' : trust.score >= 0.5 ? 'Normal' : 'Düşük';
            await waSend(phone, `📊 Durum:\nEvent: ${es.totalEvents}\nGüven: %${Math.round(trust.score * 100)}\nSeviye: ${level}`);
            return;
        }
        const agent = activeAgent.get(waId) || classify(text);
        if (!activeAgent.has(waId)) activeAgent.set(waId, agent);
        addMsg(waId, 'user', text);
        try {
            const response = await llm('Sen ClawPazar asistanısın. Kısa, esprili, max 2-3 cümle cevap ver. Türkçe konuş.', getHistory(waId));
            addMsg(waId, 'assistant', response); memory.learn(waId, { intent: agent === 'buyer' ? 'buy' : 'sell' }); await waSend(phone, response);
        } catch { await waSend(phone, '❌ Hata, tekrar dene.'); }
    }
}

// ═══════════════════════════════════════════════════════════════
// CALLBACK HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCallback(chatId: number, data: string, cbId: string, name: string) {
    await answerCB(cbId);
    eventStore.append('button', chatId, { action: data });

    switch (data) {
        case 'sell':
            activeAgent.set(chatId, 'listing'); memory.learn(chatId, { intent: 'sell' });
            listingDrafts.set(chatId, { step: 'category' });
            await send(chatId, `📦 Ne satıyoruz ${name}? Kategori seç ya da direkt yaz!`, KB.categories); break;
        case 'buy':
            activeAgent.set(chatId, 'buyer'); memory.learn(chatId, { intent: 'buy' });
            const profile = memory.get(chatId);
            const topCat = Object.entries(profile.preferredCategories).sort((a, b) => b[1] - a[1])[0];
            const hint = topCat ? `\n\nSon baktığın kategori: ${topCat[0]} — oradan devam edelim mi? 😉` : '';
            await send(chatId, `🛒 Ne arıyorsun? Kategori seç veya direkt yaz!${hint}`, KB.categories); break;
        case 'auction':
            activeAgent.set(chatId, 'auctioneer');
            await send(chatId, `🔴 Mezat zamanı! Hangi ürünü mezata koyacaksın? ⚡`); break;
        case 'explore': {
            await typing(chatId);
            const listings = await db.getListings({ limit: 5 });
            if (listings.length === 0) await send(chatId, `🔍 Henüz aktif ilan yok. İlk ilanı sen ver! 🚀`, KB.main(chatId));
            else await send(chatId, `🔍 *Keşfet — Son İlanlar*\n\n${listings.map((l, i) => formatListing(l, i + 1)).join('\n\n')}\n\nHangisi ilgini çekti?`, KB.buyActions);
            break;
        }
        case 'deals': {
            await typing(chatId);
            const [listings, auctions] = await Promise.all([db.getListings({ limit: 3 }), db.getAuctions({ limit: 3 })]);
            let msg = `🔥 *Canlı Pazar*\n`;
            if (listings.length > 0) msg += `\n📦 *Son İlanlar:*\n` + listings.map((l, i) => formatListing(l, i + 1)).join('\n') + '\n';
            if (auctions.length > 0) msg += `\n⚡ *Aktif Mezatlar:*\n` + auctions.map((a, i) => formatAuction(a, i + 1)).join('\n') + '\n';
            if (listings.length === 0 && auctions.length === 0) msg += '\nHenüz veri yok. İlk hamleyi sen yap! 💪';
            await send(chatId, msg, KB.buyActions); break;
        }
        case 'stats': {
            const p = memory.get(chatId); const es = eventStore.stats();
            await send(chatId, `📊 *Profil: ${name}*\n\n🔄 Etkileşim: ${p.totalInteractions}\n📦 Satıcı skoru: ${Math.round(p.sellerScore * 100)}%\n🛒 Alıcı skoru: ${Math.round(p.buyerScore * 100)}%\n🏙️ Şehir: ${p.city || 'Belirsiz'}\n🔐 Event chain: ${es.totalEvents} event, ${es.chainValid ? '✅ Doğrulanmış' : '❌ Kırık'}\n#️⃣ Son hash: \`${es.lastHash}\``);
            break;
        }
        case 'cat_phone': case 'cat_laptop': case 'cat_gaming':
        case 'cat_fashion': case 'cat_camera': case 'cat_home': {
            const catMap: Record<string, string> = { cat_phone: 'Telefon', cat_laptop: 'Bilgisayar', cat_gaming: 'Gaming', cat_fashion: 'Giyim', cat_camera: 'Kamera', cat_home: 'Ev' };
            const cat = catMap[data]; memory.learn(chatId, { category: cat });
            const agent = activeAgent.get(chatId) || 'listing';
            if (agent === 'listing') {
                const draft = getDraft(chatId);
                draft.category = cat;
                draft.step = 'model';
                saveDraftToDB(chatId);
                await send(chatId, `${cat} — güzel seçim! 🔥\n\nÜrünün ne? (Marka + model yaz)\n💡 Örnek: iPhone 15 Pro Max 256GB`);
            } else {
                addMsg(chatId, 'user', `${cat} arıyorum`);
                await handleAgent(chatId, `${cat} almak istiyorum`);
            }
            break;
        }
        case 'cond_new': case 'cond_likenew': case 'cond_good': case 'cond_used': {
            const condMap: Record<string, string> = { cond_new: 'Sıfır', cond_likenew: 'Az kullanılmış', cond_good: 'İyi durumda', cond_used: 'Kullanılmış' };
            const cond = condMap[data];
            if (activeAgent.get(chatId) === 'listing' && listingDrafts.has(chatId)) {
                const draft = getDraft(chatId);
                draft.condition = cond;
                draft.step = 'price';
                saveDraftToDB(chatId);
                await send(chatId, `${cond} ✨\n\nFiyat ne kadar? (TL olarak yaz)\n💡 Örnek: 12000`);
            } else {
                await handleAgent(chatId, `Durum: ${cond}`);
            }
            break;
        }
        case 'confirm_yes': {
            const tc = trustEngine.canAct(chatId, 'create_listing');
            if (!tc.allowed) { await send(chatId, `🔒 ${tc.reason}\n\nÖnce birkaç başarılı alım yap! 💪`, KB.main(chatId)); break; }
            trustEngine.recordSuccess(chatId);
            const draft = listingDrafts.get(chatId);
            const eventData: any = { status: 'live' };
            if (draft) {
                eventData.model = draft.model; eventData.category = draft.category;
                eventData.price = draft.price; eventData.city = draft.city;
                eventData.condition = draft.condition;
                // Save to Supabase
                const catSlug: Record<string, string> = { Telefon: 'elektronik', Bilgisayar: 'elektronik', Gaming: 'elektronik', Giyim: 'moda', Kamera: 'elektronik', Ev: 'ev-yasam' };
                const condSlug: Record<string, string> = { 'Sıfır': 'new', 'Az kullanılmış': 'like_new', 'İyi durumda': 'good', 'Kullanılmış': 'used' };
                const dbListing = await db.createListing({
                    title: draft.model || 'İlan', description: `${draft.condition || ''} - ${draft.city || ''}`,
                    price: draft.price || 0, condition: condSlug[draft.condition || ''] || 'used',
                    category_slug: catSlug[draft.category || ''] || 'aksesuar',
                    source_channel: 'telegram', content_source: 'user_input', telegram_user_id: chatId,
                });
                const dbNote = dbListing ? `\n🗄️ ID: \`${dbListing.id.slice(0, 8)}\`` : '';
                deleteDraftFromDB(chatId);
                eventStore.append('listing_published', chatId, eventData, 'listing');
                protocol.send('listing', 'shipping', 'handoff', { userId: chatId });
                await send(chatId, `✅ *İlanın yayında!* 🚀\n\n${draftSummary({ ...draft, step: 'confirm' })}${dbNote}\n\nŞimdi ne yapalım?`, KB.postListing);
            } else {
                eventStore.append('listing_published', chatId, eventData, 'listing');
                protocol.send('listing', 'shipping', 'handoff', { userId: chatId });
                await send(chatId, `✅ İlanın yayında! 🚀\n\nŞimdi ne yapmak istersin?`, KB.postListing);
            }
            break;
        }
        case 'confirm_edit': await send(chatId, `Neyi düzeltelim? Fiyat, açıklama, fotoğraf? ✏️`); break;
        case 'to_shipping': activeAgent.set(chatId, 'shipping'); await send(chatId, `🚚 Kargo seç:`, KB.shipping); break;
        case 'to_auction': {
            const at = trustEngine.canAct(chatId, 'open_auction');
            if (!at.allowed) { await send(chatId, `🔒 ${at.reason}\n\nMezat açmak için güven skorunu artır! 💪`, KB.main(chatId)); break; }
            activeAgent.set(chatId, 'auctioneer'); await handleAgent(chatId, 'Bu ürünü mezata koymak istiyorum'); break;
        }
        case 'ship_surat': case 'ship_aras': case 'ship_yurtici': case 'ship_ptt': {
            const carriers: Record<string, string> = { ship_surat: 'Sürat (40₺)', ship_aras: 'Aras (42₺)', ship_yurtici: 'Yurtiçi (45₺)', ship_ptt: 'PTT (35₺)' };
            const track = `CLP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
            eventStore.append('shipment_created', chatId, { carrier: data, trackingNo: track }, 'shipping');
            await send(chatId, `📦 ${carriers[data]} seçildi!\n\nTakip: \`${track}\`\nSigortalı gönderim ✅\n\nPaketle, gerisini biz hallederiz! 🎉`); break;
        }
        case 'buy_now': {
            const bt = trustEngine.canAct(chatId, 'buy_now');
            if (!bt.allowed) { await send(chatId, `🔒 ${bt.reason}`, KB.main(chatId)); break; }
            trustEngine.recordSuccess(chatId);
            const escrow = await escrowService.initEscrow({ buyerId: chatId, amount: 1000, listingTitle: 'Ürün' });
            eventStore.append('escrow_initiated', chatId, { type: 'buy_now', escrowId: escrow.id });
            if (escrow.status === 'pending_approval') {
                await send(chatId, `⚠️ *Yüksek Değerli İşlem*\n\n${escrowService.summarize(escrow)}\n\nOnay gerekiyor.`,
                    [[{ text: '✅ Onayla', callback_data: `escrow_approve_high:${escrow.id}` }], [{ text: '❌ İptal', callback_data: `escrow_reject_high:${escrow.id}` }]]);
            } else {
                await send(chatId, `💰 *Escrow ödeme başlatıldı!*\n\n${escrowService.summarize(escrow)}\n\nParan güvende ✅`);
            }
            break;
        }
        case 'negotiate': activeAgent.set(chatId, 'negotiator'); await send(chatId, `🤝 Ne kadar teklif etmek istiyorsun?`); break;
        case 'alert': eventStore.append('price_alert', chatId, { status: 'set' }); await send(chatId, `🔔 Fiyat alarmı kuruldu!`); break;
        case 'share': await send(chatId, `📢 İlan linkin:\nhttps://clawpazar.com/ilan/yeni\n\nPaylaş, hızlı satsın! 🔥`); break;
        case 'kvkk_view': {
            const ud = kvkkManager.getUserData(chatId);
            await send(chatId, `📋 *Senin Verilerin*\n\n👤 Şehir: ${ud.profil.city || 'Belirtilmemiş'}\n🛒 Etkileşim: ${ud.profil.totalInteractions}\n🔐 Güven: %${Math.round(ud.guven.score * 100)}\n📊 Event: ${ud.eventSayisi} kayıt\n\n${kvkkManager.getConsentSummary(chatId)}`); break;
        }
        case 'kvkk_delete': await send(chatId, `⚠️ Tüm verilerin silinecek. Emin misin?`, [[{ text: '🗑️ Evet, Sil', callback_data: 'kvkk_confirm_delete' }, { text: '❌ İptal', callback_data: 'kvkk_cancel' }]]); break;
        case 'kvkk_confirm_delete': kvkkManager.deleteUserData(chatId); conversations.delete(chatId); activeAgent.delete(chatId); await send(chatId, `✅ Tüm verilerin silindi (KVKK Madde 7).\n\nYeniden başlamak için /start yaz.`); break;
        case 'kvkk_cancel': await send(chatId, `İptal edildi ✅`, KB.main(chatId)); break;
        case 'kvkk_consent_grant': kvkkManager.grantConsent(chatId); await send(chatId, `✅ KVKK onayı verildi! 🎯`, KB.main(chatId)); break;
        case 'kvkk_consent_revoke': kvkkManager.revokeConsent(chatId); await send(chatId, `✅ KVKK onayı kaldırıldı.`, KB.main(chatId)); break;
        case 'photo_confirm': {
            const photo = pendingPhotos.get(chatId);
            if (!photo) { await send(chatId, '⏰ Fotoğraf oturumu doldu, tekrar gönder!'); break; }
            const tc = trustEngine.canAct(chatId, 'create_listing');
            if (!tc.allowed) { await send(chatId, `🔒 ${tc.reason}`, KB.main(chatId)); break; }
            trustEngine.recordSuccess(chatId);
            eventStore.append('listing_published', chatId, { status: 'live', source: 'photo_ai', model: photo.model, kategori: photo.kategori, fiyat: `${photo.fiyat_min}-${photo.fiyat_max}` }, 'listing');
            memory.learn(chatId, { category: photo.kategori, price: photo.fiyat_max, intent: 'sell' });
            if (photo.kategori !== 'other') collusionDetector.recordPrice(chatId, photo.kategori, photo.fiyat_max);
            protocol.send('listing', 'shipping', 'handoff', { userId: chatId });
            pendingPhotos.delete(chatId);
            const catSlugMap: Record<string, string> = { phone: 'elektronik', laptop: 'elektronik', gaming: 'elektronik', fashion: 'moda', camera: 'elektronik', home: 'ev-yasam', other: 'aksesuar' };
            const dbListing = await db.createListing({ title: photo.model, description: photo.aciklama, price: photo.fiyat_max, condition: photo.durum === 'sıfır' ? 'new' : photo.durum === 'az kullanılmış' ? 'like_new' : 'used', category_slug: catSlugMap[photo.kategori], source_channel: 'telegram', content_source: 'ai_enhanced', telegram_user_id: chatId });
            const dbNote = dbListing ? `\n🗄️ DB ID: \`${dbListing.id.slice(0, 8)}\`` : '';
            if (photo.fiyat_max >= HIGH_VALUE_THRESHOLD) {
                const pe = await escrowService.initEscrow({ buyerId: chatId, amount: photo.fiyat_max, listingTitle: photo.model });
                eventStore.append('photo_listing_escrow', chatId, { escrowId: pe.id, amount: photo.fiyat_max });
            }
            const catEmoji: Record<string, string> = { phone: '📱', laptop: '💻', gaming: '🎮', fashion: '👟', camera: '📸', home: '🏠', other: '📦' };
            await send(chatId, `${catEmoji[photo.kategori] || '📦'} *${photo.model}* yayında! 🚀\n\nFiyat: ${photo.fiyat_min.toLocaleString('tr-TR')}–${photo.fiyat_max.toLocaleString('tr-TR')} ₺${dbNote}\nŞimdi ne yapalım?`, KB.postListing);
            break;
        }
        case 'photo_edit': pendingPhotos.delete(chatId); activeAgent.set(chatId, 'listing'); await send(chatId, `✏️ Tamam! Neyi düzeltelim?`); break;
        case 'photo_auction': {
            const pa = pendingPhotos.get(chatId);
            if (!pa) { await send(chatId, '⏰ Fotoğraf oturumu doldu!'); break; }
            const ac = trustEngine.canAct(chatId, 'open_auction');
            if (!ac.allowed) { await send(chatId, `🔒 ${ac.reason}`, KB.main(chatId)); break; }
            memory.learn(chatId, { category: pa.kategori, price: pa.fiyat_min, intent: 'sell' });
            pendingPhotos.delete(chatId); activeAgent.set(chatId, 'auctioneer');
            await handleAgent(chatId, `${pa.model} ürünü ${pa.fiyat_min} TL'den mezata koymak istiyorum`); break;
        }
        default:
            if (data.startsWith('escrow_approve_high:')) {
                const eid = data.split(':')[1]; const e = await escrowService.approveHighValue(eid, chatId);
                if (e) await send(chatId, `✅ *Onaylandı!*\n\n${escrowService.summarize(e)}\n\nÖdeme başlatıldı 🚀`);
                else await send(chatId, `❌ Bulunamadı.`);
            } else if (data.startsWith('escrow_reject_high:')) {
                escrowService.cancelEscrow(data.split(':')[1]); trustEngine.recordOverride(chatId);
                await send(chatId, `❌ İptal edildi.`, KB.main(chatId));
            } else { await send(chatId, `Ne yapmak istersin?`, KB.main(chatId)); }
    }
}

// ═══════════════════════════════════════════════════════════════
// PHOTO HANDLER
// ═══════════════════════════════════════════════════════════════

const photoConfirmKB: InlineKeyboard = [
    [{ text: '🚀 Onayla & Yayınla', callback_data: 'photo_confirm' }, { text: '✏️ Düzenle', callback_data: 'photo_edit' }],
    [{ text: '⚡ Mezata Koy', callback_data: 'photo_auction' }],
];

async function handlePhoto(chatId: number, fileId: string, caption: string | undefined, firstName: string) {
    const tc = trustEngine.canAct(chatId, 'create_listing');
    if (!tc.allowed) { await send(chatId, `🔒 ${tc.reason}`, KB.main(chatId)); return; }
    if (!kvkkManager.hasConsent(chatId)) await send(chatId, `📸 Fotoğraf aldım! Ama KVKK onayın yok.\n/kvkk ile onay verebilirsin.`);
    await typing(chatId);
    try {
        const photoUrl = await getPhotoUrl(fileId);
        const userPrompt = caption ? `Bu ürünü analiz et. Kullanıcı notu: "${caption}"` : 'Bu ürünü analiz et, satılık ilan için bilgileri çıkar.';
        const raw = await visionLLM(VISION_SYSTEM, photoUrl, userPrompt);
        let j = raw; const jm = raw.match(/```(?:json)?\s*([\s\S]*?)```/); if (jm) j = jm[1].trim(); const bm = j.match(/\{[\s\S]*\}/); if (bm) j = bm[0];
        const analysis: PhotoAnalysis = JSON.parse(j);
        pendingPhotos.set(chatId, analysis);
        eventStore.append('photo_analyzed', chatId, { model: analysis.model, kategori: analysis.kategori, fiyat: `${analysis.fiyat_min}-${analysis.fiyat_max}` });
        const de: Record<string, string> = { 'sıfır': '✨', 'az kullanılmış': '👍', 'iyi': '👌', 'kullanılmış': '🔧' };
        const ce: Record<string, string> = { phone: '📱', laptop: '💻', gaming: '🎮', fashion: '👟', camera: '📸', home: '🏠', other: '📦' };
        await send(chatId, `${ce[analysis.kategori] || '📦'} *AI Analizi Tamamlandı!*\n\n📌 *Model:* ${analysis.model}\n${de[analysis.durum] || '📦'} *Durum:* ${analysis.durum}\n💰 *Fiyat:* ${analysis.fiyat_min.toLocaleString('tr-TR')} – ${analysis.fiyat_max.toLocaleString('tr-TR')} ₺\n📝 ${analysis.aciklama}\n\nBu bilgilerle yayınlayalım mı? 🔥`, photoConfirmKB);
    } catch (err: any) {
        activeAgent.set(chatId, 'listing');
        await send(chatId, `📸 Fotoğrafı aldım ama AI analiz şu an çalışmıyor 😅\n\nÜrünü kısaca tanımla, ben hallederim 💪`);
    }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleMessage(chatId: number, text: string, firstName: string) {
    if (text === '/start' || text === '/basla') {
        conversations.delete(chatId); activeAgent.delete(chatId);
        deleteDraftFromDB(chatId);
        eventStore.append('session_start', chatId, { name: firstName });
        const p = memory.get(chatId); const returning = p.totalInteractions > 3;
        if (!kvkkManager.hasConsent(chatId) && !returning) {
            await send(chatId, `Hoş geldin ClawPazar'a, ${firstName}! 🔥\n\n30 saniyede ilan oluştur, canlı mezat yap.\n\n📋 *KVKK Bilgilendirme*\nKişiselleştirilmiş öneriler için profil, konum ve alışveriş verilerini kullanıyoruz.`,
                [[{ text: '✅ Kabul Ediyorum', callback_data: 'kvkk_consent_grant' }], [{ text: '❌ Onay Vermeden Devam', callback_data: 'kvkk_cancel' }]]);
            return;
        }
        const greeting = returning ? `Tekrar hoş geldin ${firstName}! 🔥 Ne yapalım bugün?` : `Hoş geldin ClawPazar'a, ${firstName}! 🔥\n\n30 saniyede ilan, canlı mezat, güvenli kargo.\n\nNe yapalım?`;
        await send(chatId, greeting, KB.main(chatId)); return;
    }
    if (text === '/sil') { conversations.delete(chatId); activeAgent.delete(chatId); await send(chatId, '🗑️ Temizlendi!', KB.main(chatId)); return; }
    if (text === '/durum') { const a = activeAgent.get(chatId) || 'general'; const labels: Record<AgentType, string> = { listing: '📦 İlan Uzmanı', buyer: '🛒 Alım Danışmanı', negotiator: '🤝 Pazarlık', auctioneer: '🔴 Mezat', shipping: '🚚 Kargo', compliance: '🛡️ Güvenlik', general: '🐾 Genel' }; await send(chatId, `Aktif: ${labels[a]}`, KB.main(chatId)); return; }
    if (text === '/guvenim') { await send(chatId, trustEngine.summarize(chatId), KB.main(chatId)); return; }
    if (text === '/kvkk') {
        await send(chatId, `🔐 *KVKK Veri Yönetimi*\n\n${kvkkManager.getConsentSummary(chatId)}\n\nNe yapmak istersin?`,
            [[{ text: '📋 Verilerimi Gör', callback_data: 'kvkk_view' }, { text: '🗑️ Verilerimi Sil', callback_data: 'kvkk_delete' }], [{ text: '✅ Onay Ver', callback_data: 'kvkk_consent_grant' }, { text: '❌ Onay Kaldır', callback_data: 'kvkk_consent_revoke' }]]);
        return;
    }
    if (text === '/kanit') {
        const es = eventStore.stats();
        await send(chatId, `🌳 *Merkle Provenance*\n\n📊 Event: ${es.totalEvents}\n🔗 Chain: ${es.chainValid ? '✅' : '❌'}\n#️⃣ Hash: \`${es.lastHash}\`\n🌿 Root: \`${es.merkleRoot}\`\n📏 Depth: ${es.merkleDepth}`);
        return;
    }
    if (text === '/testfoto') {
        const ta: PhotoAnalysis = { model: 'iPhone 15 Pro Max 256GB', durum: 'az kullanılmış', fiyat_min: 45000, fiyat_max: 52000, kategori: 'phone', aciklama: 'Uzay siyahı, kutu ve aksesuarları mevcut.' };
        pendingPhotos.set(chatId, ta); eventStore.append('photo_analyzed', chatId, { model: ta.model, source: 'test' });
        await send(chatId, `📱 *AI Analizi (Test)*\n\n📌 *Model:* ${ta.model}\n👍 *Durum:* ${ta.durum}\n💰 *Fiyat:* 45.000 – 52.000 ₺\n📝 ${ta.aciklama}\n\nYayınlayalım mı? 🔥`, photoConfirmKB); return;
    }
    if (text === '/testwhatsapp') {
        await send(chatId, `📢 *WhatsApp Entegrasyonu*\n\n📱 API: ${WA_ACCESS_TOKEN ? '✅' : '❌'}\n📞 Phone: ${WA_PHONE_ID || 'Yok'}\n🌐 Webhook: /webhook/whatsapp\n✅ Token: \`${WA_VERIFY_TOKEN.slice(0, 8)}...\`\n\n*Desteklenen:* Metin, Fotoğraf, Buttons, Template, Read receipts, KVKK+Trust`); return;
    }
    if (text === '/testescrow') {
        const te = await escrowService.initEscrow({ buyerId: chatId, amount: 2500, listingTitle: 'Test — iPhone Kılıf' });
        const he = await escrowService.initEscrow({ buyerId: chatId, amount: 15000, listingTitle: 'Test — MacBook Pro' });
        await send(chatId, `🧪 *Escrow Test*\n\n*Normal:*\n${escrowService.summarize(te)}\n\n*Yüksek Değer:*\n${escrowService.summarize(he)}\n\niyzico: ${IYZICO_API_KEY ? '✅' : '❌'}`,
            [[{ text: '✅ Onayla', callback_data: `escrow_approve_high:${he.id}` }], [{ text: '❌ İptal', callback_data: `escrow_reject_high:${he.id}` }]]); return;
    }
    if (text === '/explore') { await typing(chatId); const ls = await db.getListings({ limit: 5 }); if (ls.length === 0) await send(chatId, `🔍 Henüz ilan yok 🚀`, KB.main(chatId)); else await send(chatId, `🔍 *Keşfet*\n\n${ls.map((l, i) => formatListing(l, i + 1)).join('\n\n')}`, KB.buyActions); return; }
    if (text === '/deals') { await typing(chatId); const [ls, as] = await Promise.all([db.getListings({ limit: 3 }), db.getAuctions({ limit: 3 })]); let m = `🔥 *Canlı Pazar*\n`; if (ls.length > 0) m += `\n📦 *İlanlar:*\n` + ls.map((l, i) => formatListing(l, i + 1)).join('\n') + '\n'; if (as.length > 0) m += `\n⚡ *Mezatlar:*\n` + as.map((a, i) => formatAuction(a, i + 1)).join('\n') + '\n'; if (ls.length === 0 && as.length === 0) m += '\nHenüz veri yok. 💪'; await send(chatId, m, KB.buyActions); return; }
    if (text === '/testveri') { await typing(chatId); const d = await db.getDashboard(); const ls = await db.getListings({ limit: 3 }); const as = await db.getAuctions({ limit: 2 }); let m = `📊 *Supabase*\n\n💾 ${supabase ? '✅' : '❌'}\n📦 İlan: ${d.listings}\n🔴 Mezat: ${d.auctions}\n🏷️ Kategori: ${d.categories}\n`; if (ls.length > 0) m += `\n*İlanlar:*\n` + ls.map((l, i) => formatListing(l, i + 1)).join('\n') + '\n'; if (as.length > 0) m += `\n*Mezatlar:*\n` + as.map((a, i) => formatAuction(a, i + 1)).join('\n'); await send(chatId, m, KB.main(chatId)); return; }

    console.log(`  🧠 ${classify(text).toUpperCase()}`);
    await handleAgent(chatId, text);
}

// ═══════════════════════════════════════════════════════════════
// POLLING + MAIN
// ═══════════════════════════════════════════════════════════════

let offset = 0;

async function poll() {
    try {
        const res = await fetch(`${TG}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message","callback_query"]`);
        const data = await res.json() as any;
        const updates = data.result || [];
        if (updates.length === 0) return;

        // Update offset immediately
        offset = updates[updates.length - 1].update_id + 1;

        // Process ALL updates in parallel (no sequential blocking)
        const tasks = updates.map((update: any) => {
            if (update.callback_query) {
                const cb = update.callback_query;
                return handleCallback(cb.message.chat.id, cb.data, cb.id, cb.from?.first_name || 'dostum')
                    .catch(e => console.error(`CB:`, e.message));
            }
            const msg = update.message;
            if (!msg) return Promise.resolve();
            const chatId = msg.chat.id;
            const firstName = msg.from?.first_name || 'dostum';
            if (msg.photo && msg.photo.length > 0) {
                return handlePhoto(chatId, msg.photo[msg.photo.length - 1].file_id, msg.caption, firstName)
                    .catch(e => console.error(`Photo:`, e.message));
            }
            if (!msg.text) return Promise.resolve();
            console.log(`[${chatId}] ${firstName}: ${msg.text.trim()}`);
            return handleMessage(chatId, msg.text.trim(), firstName)
                .catch(e => console.error(`[${chatId}]:`, e.message));
        });

        await Promise.allSettled(tasks);
    } catch (err: any) {
        console.error('Poll:', err.message);
        await new Promise(r => setTimeout(r, 3000));
    }
}

async function main() {
    const me = await fetch(`${TG}/getMe`).then(r => r.json()) as any;
    if (!me.ok) { console.error('❌ Token geçersiz'); process.exit(1); }

    console.log(`\n  ╔═══════════════════════════════════════════════╗`);
    console.log(`  ║  🐾 ClawPazar V2 — Async Gateway Architecture ║`);
    console.log(`  ╠═══════════════════════════════════════════════╣`);
    console.log(`  ║  Bot: @${me.result.username.padEnd(38)}║`);
    console.log(`  ║  LLM: ${LLM_MODEL.padEnd(40)}║`);
    console.log(`  ║  📦 Supabase: async persist (no writeFileSync)║`);
    console.log(`  ║  ⚡ Parallel polling (Promise.allSettled)     ║`);
    console.log(`  ║  🧠 EventStore · TrustEngine · VisionAI       ║`);
    console.log(`  ╚═══════════════════════════════════════════════╝\n`);
    console.log('  ⏳ Mesaj bekleniyor...\n');

    await fetch(`${TG}/setMyCommands`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            commands: [
                { command: 'start', description: '🔥 Ana menü' }, { command: 'sil', description: '🗑️ Temizle' },
                { command: 'durum', description: '🧠 Aktif ajan' }, { command: 'guvenim', description: '🛡️ Güven' },
                { command: 'kvkk', description: '🔐 KVKK' }, { command: 'kanit', description: '🌳 Merkle' },
                { command: 'testfoto', description: '📸 Fotoğraf test' }, { command: 'explore', description: '🔍 Keşfet' },
                { command: 'deals', description: '🔥 Pazar' }, { command: 'testveri', description: '📊 Supabase' },
                { command: 'testescrow', description: '💳 Escrow' }, { command: 'testwhatsapp', description: '📢 WhatsApp' },
            ]
        }),
    });

    await fetch(`${TG}/deleteWebhook`);

    // Load persisted state from Supabase
    await loadDraftsFromDB();

    const http = await import('http');
    const webhookPort = Number(process.env.WEBHOOK_PORT || 4001);
    const webhookServer = http.createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/webhook/iyzico') {
            let body = ''; req.on('data', (c: Buffer) => body += c);
            req.on('end', async () => {
                try {
                    const p = JSON.parse(body); const e = escrowService.get(p.conversationId);
                    if (e && p.status === 'SUCCESS') { e.status = 'held'; e.iyzicoPaymentId = p.paymentId; eventStore.append('escrow_payment_received', e.buyerId, { escrowId: e.id }); setTimeout(() => { escrowService.releaseOrRefund(e.id, 'release'); }, 3 * 24 * 3600_000); await send(e.buyerId, `✅ *Ödeme alındı!*\n\n${escrowService.summarize(e)}\n\nParan güvende 🔐`); }
                    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ received: true }));
                } catch { res.writeHead(400); res.end('Bad Request'); }
            });
        } else if (req.method === 'GET' && req.url?.startsWith('/webhook/whatsapp')) {
            const url = new URL(req.url, `http://localhost:${webhookPort}`);
            if (url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === WA_VERIFY_TOKEN) {
                console.log('  ✅ WhatsApp webhook verified');
                res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(url.searchParams.get('hub.challenge') || 'ok');
            } else { res.writeHead(403); res.end('Forbidden'); }
        } else if (req.method === 'POST' && req.url === '/webhook/whatsapp') {
            let body = ''; req.on('data', (c: Buffer) => body += c);
            req.on('end', async () => {
                try {
                    const p = JSON.parse(body);
                    for (const entry of p.entry || []) for (const change of entry.changes || []) for (const msg of change.value?.messages || []) {
                        if (msg.from) handleWhatsAppMessage(msg.from, msg).catch(e => console.error(`[WA]`, e.message));
                    }
                    res.writeHead(200); res.end('OK');
                } catch { res.writeHead(400); res.end('Bad Request'); }
            });
        } else { res.writeHead(404); res.end('Not Found'); }
    });
    webhookServer.listen(webhookPort, () => {
        console.log(`  🌐 Webhook: http://localhost:${webhookPort}`);
        console.log(`    ├─ /webhook/iyzico (POST)`);
        console.log(`    └─ /webhook/whatsapp (GET/POST)`);
    });

    while (true) { await poll(); }
}

main();
