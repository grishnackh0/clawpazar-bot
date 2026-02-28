/**
 * ClawPazar Multi-Channel Messaging Service
 * Handles Telegram + WhatsApp messages through a unified LLM pipeline.
 *
 * Flow: Incoming message → conversation history (Supabase) → LLM call → platform reply
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Types ──────────────────────────────────────────────────────

type Channel = 'telegram' | 'whatsapp' | 'web';

interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface IncomingMessage {
    channel: Channel;
    chatId: string;         // Telegram chat.id or WhatsApp phone number
    userId: string;         // Unique user identifier
    text: string;
    userName?: string;
    isVoice?: boolean;
    mediaUrl?: string;
}

interface LLMResponse {
    content: string;
    tokensUsed?: number;
}

// ── System Prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen ClawPazar'ın AI asistanısın. İkinci el ürün alım-satım platformunda kullanıcılara yardım ediyorsun.

GÖREVLERİN:
1. Kullanıcı ürün satmak istiyorsa:
   - Ürün adı, kategori, durum (sıfır/az kullanılmış/kullanılmış), fiyat, şehir sor
   - Her bilgiyi AYRI mesajda sor, hepsini bir anda sorma
   - Aynı soruyu ASLA tekrarlama — verilen bilgiyi kaydet ve sonrakine geç
   - Tüm bilgiler tamamlanınca ilan taslağını göster ve onayla

2. Kargo akışı:
   - İlan onaylandıktan sonra "Kargo ayarlamak ister misin?" sor
   - Evet derse: gönderici adres, alıcı şehir, paket ağırlığı sor
   - Kargo fiyat karşılaştırması sun (Yurtiçi, Aras, MNG, Sürat)
   - Seçim yapılınca takip numarası oluştur

3. Escrow hatırlatma:
   - Satış anlaşması yapıldığında: "Güvenli ödeme (escrow) ile işlem yapmak ister misin?" sor
   - Alıcı öder → ürün kargoya verilir → alıcı onaylar → satıcıya ödeme aktarılır

4. Genel kurallar:
   - Türkçe konuş, samimi ama profesyonel ol
   - Kısa ve net cevaplar ver (WhatsApp/Telegram için optimize)
   - Sahtekarlık şüphesi varsa uyar
   - Fiyat önerilerinde piyasa bilgisi kullan
   - Emoji kullan ama abartma

KANAL: {channel}
Mesajları kısa tut çünkü kullanıcı mobil cihazdan yazıyor.`;

// ── Service ────────────────────────────────────────────────────

export class MessagingService {
    private supabase: SupabaseClient;
    private llmApiBase: string;
    private llmApiKey: string;
    private llmModel: string;
    private telegramToken: string;
    private whatsappToken: string;
    private whatsappPhoneId: string;

    // In-memory rate limiting: chatId → { count, resetAt }
    private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();
    private readonly RATE_LIMIT = 30; // messages per window
    private readonly RATE_WINDOW = 60_000; // 1 minute

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
        );

        this.llmApiBase = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
        this.llmApiKey = process.env.ZHIPU_API_KEY || '';
        this.llmModel = process.env.ZHIPU_MODEL || 'glm-4-flash';

        this.telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    }

    // ── Rate Limiting ──────────────────────────────────────────

    private checkRateLimit(chatId: string): boolean {
        const now = Date.now();
        const entry = this.rateLimits.get(chatId);

        if (!entry || now > entry.resetAt) {
            this.rateLimits.set(chatId, { count: 1, resetAt: now + this.RATE_WINDOW });
            return true;
        }

        if (entry.count >= this.RATE_LIMIT) {
            return false;
        }

        entry.count++;
        return true;
    }

    // ── Conversation History (Supabase) ────────────────────────

    private async getHistory(chatId: string, channel: Channel): Promise<ConversationMessage[]> {
        try {
            const { data } = await this.supabase
                .from('chat_history')
                .select('role, content')
                .eq('chat_id', chatId)
                .eq('channel', channel)
                .order('created_at', { ascending: true })
                .limit(20); // Last 20 messages for context

            return (data || []).map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));
        } catch {
            // Table might not exist yet — return empty
            return [];
        }
    }

    private async saveMessage(
        chatId: string,
        channel: Channel,
        role: 'user' | 'assistant',
        content: string
    ): Promise<void> {
        try {
            await this.supabase.from('chat_history').insert({
                chat_id: chatId,
                channel,
                role,
                content,
                created_at: new Date().toISOString(),
            });
        } catch (err) {
            console.error('[Messaging] Failed to save message:', err);
        }
    }

    // ── LLM Call ───────────────────────────────────────────────

    private async callLLM(
        messages: ConversationMessage[],
        channel: Channel
    ): Promise<LLMResponse> {
        const systemMessage: ConversationMessage = {
            role: 'system',
            content: SYSTEM_PROMPT.replace('{channel}', channel),
        };

        const payload = {
            model: this.llmModel,
            messages: [systemMessage, ...messages],
            temperature: 0.7,
            max_tokens: 512, // Short replies for mobile
            top_p: 0.9,
        };

        const response = await fetch(`${this.llmApiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.llmApiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[LLM] API error:', response.status, errorText);
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'Üzgünüm, şu an yanıt veremedim.';

        return {
            content: content.trim(),
            tokensUsed: data.usage?.total_tokens,
        };
    }

    // ── Telegram Reply ─────────────────────────────────────────

    private async sendTelegram(chatId: string, text: string): Promise<void> {
        if (!this.telegramToken) {
            console.warn('[Telegram] No bot token configured');
            return;
        }

        // Split long messages (Telegram limit: 4096 chars)
        const chunks = this.splitMessage(text, 4096);

        for (const chunk of chunks) {
            const res = await fetch(
                `https://api.telegram.org/bot${this.telegramToken}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: chunk,
                        parse_mode: 'Markdown',
                    }),
                }
            );

            if (!res.ok) {
                // Retry without Markdown if parse fails
                const errData = await res.json().catch(() => ({}));
                if ((errData as any)?.description?.includes('parse')) {
                    await fetch(
                        `https://api.telegram.org/bot${this.telegramToken}/sendMessage`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: chatId, text: chunk }),
                        }
                    );
                } else {
                    console.error('[Telegram] Send failed:', res.status, errData);
                }
            }
        }
    }

    // ── WhatsApp Reply ─────────────────────────────────────────

    private async sendWhatsApp(phone: string, text: string): Promise<void> {
        if (!this.whatsappToken || !this.whatsappPhoneId) {
            console.warn('[WhatsApp] No access token or phone ID configured');
            return;
        }

        // Split long messages (WhatsApp limit: 4096 chars)
        const chunks = this.splitMessage(text, 4096);

        for (const chunk of chunks) {
            const res = await fetch(
                `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.whatsappToken}`,
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: phone,
                        type: 'text',
                        text: { body: chunk },
                    }),
                }
            );

            if (!res.ok) {
                const errData = await res.text();
                console.error('[WhatsApp] Send failed:', res.status, errData);
            }
        }
    }

    // ── WhatsApp Template Message ──────────────────────────────

    async sendWhatsAppTemplate(
        phone: string,
        templateName: string,
        languageCode: string = 'tr',
        components: any[] = []
    ): Promise<void> {
        if (!this.whatsappToken || !this.whatsappPhoneId) return;

        await fetch(
            `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.whatsappToken}`,
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: languageCode },
                        components,
                    },
                }),
            }
        );
    }

    // ── Utility ────────────────────────────────────────────────

    private splitMessage(text: string, maxLen: number): string[] {
        if (text.length <= maxLen) return [text];

        const chunks: string[] = [];
        let remaining = text;

        while (remaining.length > 0) {
            if (remaining.length <= maxLen) {
                chunks.push(remaining);
                break;
            }

            // Split at last newline or space before limit
            let splitAt = remaining.lastIndexOf('\n', maxLen);
            if (splitAt < maxLen * 0.5) {
                splitAt = remaining.lastIndexOf(' ', maxLen);
            }
            if (splitAt <= 0) splitAt = maxLen;

            chunks.push(remaining.slice(0, splitAt));
            remaining = remaining.slice(splitAt).trimStart();
        }

        return chunks;
    }

    // ── Main Handler ───────────────────────────────────────────

    async handleMessage(msg: IncomingMessage): Promise<string> {
        const logPrefix = `[${msg.channel.toUpperCase()}:${msg.chatId}]`;

        // Rate limit check
        if (!this.checkRateLimit(msg.chatId)) {
            const limitMsg = '⏳ Çok fazla mesaj gönderdin. Lütfen biraz bekle.';
            await this.reply(msg.channel, msg.chatId, limitMsg);
            return limitMsg;
        }

        // Handle /start command
        if (msg.text === '/start' || msg.text === '/basla') {
            const welcomeMsg = `🐾 *ClawPazar'a Hoş Geldin!*

Ben ClawPazar AI asistanıyım. Sana şunlarda yardımcı olabilirim:

📦 *Ürün Satmak* — "iPhone satmak istiyorum" yaz
🔍 *Ürün Aramak* — "PS5 arıyorum" yaz
🚚 *Kargo Takip* — "Kargom nerede?" yaz
💰 *Fiyat Önerisi* — "MacBook fiyatı ne olmalı?" yaz

Hadi başlayalım! Ne yapmak istersin?`;

            await this.saveMessage(msg.chatId, msg.channel, 'user', msg.text);
            await this.saveMessage(msg.chatId, msg.channel, 'assistant', welcomeMsg);
            await this.reply(msg.channel, msg.chatId, welcomeMsg);
            return welcomeMsg;
        }

        // Handle /sil or /temizle command (clear history)
        if (msg.text === '/sil' || msg.text === '/temizle') {
            try {
                await this.supabase
                    .from('chat_history')
                    .delete()
                    .eq('chat_id', msg.chatId)
                    .eq('channel', msg.channel);
            } catch { /* table might not exist */ }

            const clearMsg = '🗑️ Sohbet geçmişi temizlendi. Yeni bir konuşma başlayabilirsin!';
            await this.reply(msg.channel, msg.chatId, clearMsg);
            return clearMsg;
        }

        console.log(`${logPrefix} User: ${msg.text.slice(0, 80)}...`);

        try {
            // 1. Save user message
            await this.saveMessage(msg.chatId, msg.channel, 'user', msg.text);

            // 2. Get conversation history
            const history = await this.getHistory(msg.chatId, msg.channel);

            // 3. Call LLM
            const llmResponse = await this.callLLM(history, msg.channel);
            console.log(`${logPrefix} LLM: ${llmResponse.content.slice(0, 80)}... (${llmResponse.tokensUsed} tokens)`);

            // 4. Save assistant response
            await this.saveMessage(msg.chatId, msg.channel, 'assistant', llmResponse.content);

            // 5. Reply to user
            await this.reply(msg.channel, msg.chatId, llmResponse.content);

            return llmResponse.content;
        } catch (err: any) {
            console.error(`${logPrefix} Error:`, err.message);

            const errorMsg = '❌ Bir hata oluştu. Lütfen tekrar deneyin.';
            await this.reply(msg.channel, msg.chatId, errorMsg);
            return errorMsg;
        }
    }

    // ── Reply Router ───────────────────────────────────────────

    private async reply(channel: Channel, chatId: string, text: string): Promise<void> {
        switch (channel) {
            case 'telegram':
                await this.sendTelegram(chatId, text);
                break;
            case 'whatsapp':
                await this.sendWhatsApp(chatId, text);
                break;
            case 'web':
                // Web replies are handled by SSE in the frontend route
                break;
        }
    }

    // ── Platform-Specific Handlers ─────────────────────────────

    async handleTelegram(body: any): Promise<void> {
        const message = body?.message;
        if (!message) return;

        // Skip non-text messages (for now)
        const text = message.text || message.caption || '';
        if (!text) return;

        const chatId = message.chat.id.toString();
        const userId = message.from?.id?.toString() || chatId;
        const userName = message.from?.first_name || message.from?.username || '';

        await this.handleMessage({
            channel: 'telegram',
            chatId,
            userId,
            text,
            userName,
            isVoice: !!message.voice,
        });
    }

    async handleWhatsApp(body: any): Promise<void> {
        // WhatsApp Cloud API webhook structure
        const entries = body?.entry || [];

        for (const entry of entries) {
            const changes = entry?.changes || [];

            for (const change of changes) {
                // Skip status updates (read receipts, etc.)
                if (change.field !== 'messages') continue;

                const messages = change.value?.messages || [];
                const contacts = change.value?.contacts || [];

                for (const message of messages) {
                    // Only handle text messages for now
                    const text = message.text?.body || message.caption || '';
                    if (!text) continue;

                    const phone = message.from;
                    const contact = contacts.find((c: any) => c.wa_id === phone);
                    const userName = contact?.profile?.name || '';

                    // Mark as read
                    this.markWhatsAppRead(message.id).catch(() => { });

                    await this.handleMessage({
                        channel: 'whatsapp',
                        chatId: phone,
                        userId: phone,
                        text,
                        userName,
                        isVoice: message.type === 'audio',
                    });
                }
            }
        }
    }

    // ── Mark WhatsApp Message as Read ───────────────────────────

    private async markWhatsAppRead(messageId: string): Promise<void> {
        if (!this.whatsappToken || !this.whatsappPhoneId) return;

        await fetch(
            `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.whatsappToken}`,
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId,
                }),
            }
        );
    }
}

// Singleton export
export const messagingService = new MessagingService();
