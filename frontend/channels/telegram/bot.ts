// ClawPazar – Telegram Bot
// Handles /sat, /mezat, /tekliflerim commands with inline keyboards

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: CallbackQuery;
}

interface TelegramMessage {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
    photo?: Array<{ file_id: string; width: number; height: number }>;
    voice?: { file_id: string; duration: number };
    caption?: string;
}

interface CallbackQuery {
    id: string;
    from: { id: number; first_name: string };
    message: TelegramMessage;
    data: string;
}

const TG_API = 'https://api.telegram.org/bot';

export class ClawPazarBot {
    private token: string;
    private apiUrl: string;

    constructor(token: string) {
        this.token = token;
        this.apiUrl = `${TG_API}${token}`;
    }

    // ============================================================
    // WEBHOOK HANDLER
    // ============================================================

    async handleUpdate(update: TelegramUpdate): Promise<BotAction> {
        if (update.callback_query) {
            return this.handleCallback(update.callback_query);
        }

        if (update.message) {
            return this.handleMessage(update.message);
        }

        return { type: 'noop' };
    }

    private async handleMessage(msg: TelegramMessage): Promise<BotAction> {
        const chatId = msg.chat.id;
        const text = msg.text?.trim() || '';
        const userId = `tg_${msg.from.id}`;

        // ---- COMMANDS ----
        if (text === '/start' || text === '/baslat') {
            await this.sendMessage(chatId,
                `🐾 *ClawPazar'a Hoş Geldiniz!*\n\n` +
                `Sesli mesaj, fotoğraf veya yazı gönderin — AI ajanınız ilanınızı oluştursun.\n\n` +
                `Komutlar:\n` +
                `/sat – Yeni ilan oluştur\n` +
                `/mezat – Canlı mezatları gör\n` +
                `/tekliflerim – Tekliflerimi gör\n` +
                `/yardim – Yardım al`,
                { parse_mode: 'Markdown' },
            );
            return { type: 'welcome', userId };
        }

        if (text === '/sat') {
            await this.sendMessage(chatId,
                '📦 *Satmak istediğiniz ürünü anlatın*\n\nYazı, fotoğraf veya sesli mesaj gönderin.',
                { parse_mode: 'Markdown' },
            );
            return { type: 'start_listing', userId };
        }

        if (text === '/mezat') {
            await this.sendMessage(chatId,
                '🔨 *Canlı Mezatlar*\n\nYükleniyor...',
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🌐 Mezatları Aç', url: `${process.env.FRONTEND_URL || 'https://clawpazar.com'}/mezat` }],
                        ],
                    },
                },
            );
            return {
                type: 'agent_task',
                userId,
                agentType: 'auctioneer',
                taskType: 'list_auctions',
                payload: {},
            };
        }

        if (text === '/tekliflerim') {
            await this.sendMessage(chatId, '💬 *Teklifleriniz*\n\nYükleniyor...', { parse_mode: 'Markdown' });
            return {
                type: 'agent_task',
                userId,
                agentType: 'negotiator',
                taskType: 'list_negotiations',
                payload: { userId },
            };
        }

        if (text === '/yardim') {
            await this.sendMessage(chatId,
                `ℹ️ *ClawPazar Yardım*\n\n` +
                `• Fotoğraf gönderin → İlan oluşturulur\n` +
                `• Sesli mesaj gönderin → Sesi yazıya çevirir\n` +
                `• Fiyat yazın → Pazarlık başlar\n\n` +
                `Sorularınız için: destek@clawpazar.com`,
                { parse_mode: 'Markdown' },
            );
            return { type: 'help', userId };
        }

        // ---- PHOTO ----
        if (msg.photo && msg.photo.length > 0) {
            const bestPhoto = msg.photo[msg.photo.length - 1]; // highest resolution
            await this.sendMessage(chatId, '📸 Fotoğraf alındı! İlanınız oluşturuluyor...');
            return {
                type: 'agent_task',
                userId,
                agentType: 'listing_creator',
                taskType: 'create_listing',
                payload: {
                    photoFileId: bestPhoto.file_id,
                    caption: msg.caption || '',
                    channel: 'telegram',
                },
            };
        }

        // ---- VOICE ----
        if (msg.voice) {
            await this.sendMessage(chatId, '🎤 Sesli mesaj alındı! Analiz ediliyor...');
            return {
                type: 'agent_task',
                userId,
                agentType: 'listing_creator',
                taskType: 'create_listing',
                payload: {
                    voiceFileId: msg.voice.file_id,
                    duration: msg.voice.duration,
                    channel: 'telegram',
                    isVoice: true,
                },
            };
        }

        // ---- DEFAULT: treat as listing text ----
        await this.sendMessage(chatId, '✍️ Mesajınız alındı! İlan oluşturuluyor...');
        return {
            type: 'agent_task',
            userId,
            agentType: 'listing_creator',
            taskType: 'create_listing',
            payload: { message: text, channel: 'telegram', isVoice: false },
        };
    }

    private async handleCallback(query: CallbackQuery): Promise<BotAction> {
        const chatId = query.message.chat.id;
        const userId = `tg_${query.from.id}`;
        const data = query.data;

        // Answer callback to remove loading indicator
        await this.answerCallback(query.id);

        if (data === 'publish_listing') {
            await this.sendMessage(chatId, '✅ İlanınız yayınlandı! 🎉');
            return {
                type: 'agent_task',
                userId,
                agentType: 'listing_creator',
                taskType: 'publish_listing',
                payload: { action: 'confirm' },
            };
        }

        if (data === 'edit_listing') {
            await this.sendMessage(chatId, '✏️ Düzenlemek istediğiniz bilgiyi yazın:');
            return { type: 'edit_listing', userId };
        }

        if (data === 'cancel_listing') {
            await this.sendMessage(chatId, '❌ İlan iptal edildi.');
            return { type: 'cancel', userId };
        }

        return { type: 'noop' };
    }

    // ============================================================
    // NOTIFICATION HELPERS
    // ============================================================

    async sendListingPreview(
        chatId: number,
        title: string,
        price: string,
        category: string,
    ): Promise<void> {
        await this.sendMessage(chatId,
            `✅ *İlanınız Hazır!*\n\n📦 ${title}\n💰 ${price} ₺\n📂 ${category}`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Yayınla', callback_data: 'publish_listing' },
                            { text: '✏️ Düzenle', callback_data: 'edit_listing' },
                        ],
                        [{ text: '❌ İptal', callback_data: 'cancel_listing' }],
                    ],
                },
            },
        );
    }

    async sendBidNotification(
        chatId: number,
        auctionTitle: string,
        amount: string,
    ): Promise<void> {
        await this.sendMessage(chatId,
            `🔨 *Yeni Teklif!*\n\n📦 ${auctionTitle}\n💰 ${amount} ₺`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔨 Mezata Git', url: `${process.env.FRONTEND_URL}/mezat` }],
                    ],
                },
            },
        );
    }

    // ============================================================
    // TELEGRAM API METHODS
    // ============================================================

    private async sendMessage(
        chatId: number,
        text: string,
        options?: {
            parse_mode?: string;
            reply_markup?: object;
        },
    ): Promise<void> {
        await fetch(`${this.apiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                ...options,
            }),
        });
    }

    private async answerCallback(callbackQueryId: string): Promise<void> {
        await fetch(`${this.apiUrl}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackQueryId }),
        });
    }
}

// ============================================================
// TYPES
// ============================================================

interface BotAction {
    type: string;
    userId?: string;
    agentType?: string;
    taskType?: string;
    payload?: Record<string, unknown>;
}
