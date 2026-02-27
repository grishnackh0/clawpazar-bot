/**
 * ClawPazar — WhatsApp Business API Client
 */
import { WA_ACCESS_TOKEN, WA_API } from '../config.js';
import type { InlineKeyboard } from '../types.js';

export class WhatsAppClient {
    private headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
    };

    async sendText(to: string, text: string): Promise<void> {
        if (!WA_ACCESS_TOKEN) return;
        await fetch(`${WA_API}/messages`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: text.replace(/\*/g, '*').replace(/`/g, '') },
            }),
        }).catch(e => console.error('WA send:', e.message));
    }

    async sendInteractive(to: string, body: string, buttons: { id: string; title: string }[]): Promise<void> {
        if (!WA_ACCESS_TOKEN) return;
        await fetch(`${WA_API}/messages`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: body.replace(/\*/g, '').replace(/`/g, '').slice(0, 1024) },
                    action: {
                        buttons: buttons.slice(0, 3).map(b => ({
                            type: 'reply',
                            reply: { id: b.id, title: b.title.slice(0, 20) },
                        })),
                    },
                },
            }),
        }).catch(e => console.error('WA interactive:', e.message));
    }

    async sendTemplate(to: string, templateName: string, params: string[] = []): Promise<void> {
        if (!WA_ACCESS_TOKEN) return;
        const components: any[] = params.length > 0 ? [{
            type: 'body',
            parameters: params.map(p => ({ type: 'text', text: p })),
        }] : [];
        await fetch(`${WA_API}/messages`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: { name: templateName, language: { code: 'tr' }, components },
            }),
        }).catch(e => console.error('WA template:', e.message));
    }

    async markRead(messageId: string): Promise<void> {
        if (!WA_ACCESS_TOKEN) return;
        await fetch(`${WA_API}/messages`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            }),
        }).catch(() => { });
    }

    async getMediaUrl(mediaId: string): Promise<string | null> {
        if (!WA_ACCESS_TOKEN) return null;
        try {
            const res = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
                headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}` },
            });
            const data = await res.json() as any;
            return data.url || null;
        } catch { return null; }
    }

    flattenButtons(keyboard?: InlineKeyboard): { id: string; title: string }[] {
        if (!keyboard) return [];
        return keyboard.flat().slice(0, 3).map(b => ({
            id: b.callback_data,
            title: b.text.replace(/[\ud800-\udfff]/g, '').trim().slice(0, 20),
        }));
    }
}

export const wa = new WhatsAppClient();

export async function waSend(phone: string, text: string, keyboard?: InlineKeyboard) {
    const buttons = wa.flattenButtons(keyboard);
    if (buttons.length > 0) {
        await wa.sendInteractive(phone, text, buttons);
    } else {
        await wa.sendText(phone, text);
    }
}
