// ClawPazar – WhatsApp Business API Webhook Handler
// Processes incoming messages from WhatsApp Cloud API
// Routes text, voice, and image messages to the NanoClaw swarm

interface WhatsAppMessage {
    from: string;  // phone number
    id: string;
    timestamp: string;
    type: 'text' | 'image' | 'audio' | 'document' | 'interactive';
    text?: { body: string };
    image?: { id: string; mime_type: string; caption?: string };
    audio?: { id: string; mime_type: string };
    interactive?: {
        type: 'button_reply' | 'list_reply';
        button_reply?: { id: string; title: string };
        list_reply?: { id: string; title: string };
    };
}

interface WebhookPayload {
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: 'whatsapp';
                metadata: { display_phone_number: string; phone_number_id: string };
                contacts?: Array<{ profile: { name: string }; wa_id: string }>;
                messages?: WhatsAppMessage[];
                statuses?: Array<{ id: string; status: string; timestamp: string }>;
            };
        }>;
    }>;
}

// Parses and routes WhatsApp messages to the appropriate agent
export function processWhatsAppWebhook(payload: WebhookPayload): ProcessedMessage[] {
    const results: ProcessedMessage[] = [];

    for (const entry of payload.entry) {
        for (const change of entry.changes) {
            const value = change.value;
            if (!value.messages) continue;

            const contact = value.contacts?.[0];

            for (const msg of value.messages) {
                const processed = routeMessage(msg, contact?.profile?.name || 'Kullanıcı', contact?.wa_id || msg.from);
                results.push(processed);
            }
        }
    }

    return results;
}

interface ProcessedMessage {
    userId: string;
    displayName: string;
    channel: 'whatsapp';
    agentType: string;
    taskType: string;
    payload: Record<string, unknown>;
}

function routeMessage(msg: WhatsAppMessage, displayName: string, waId: string): ProcessedMessage {
    const base = {
        userId: `wa_${waId}`,
        displayName,
        channel: 'whatsapp' as const,
    };

    switch (msg.type) {
        case 'text': {
            const text = msg.text!.body.toLowerCase().trim();

            // Command detection (Turkish)
            if (text.startsWith('/sat') || text.includes('satmak istiyorum') || text.includes('ilan ver')) {
                return {
                    ...base,
                    agentType: 'listing_creator',
                    taskType: 'create_listing',
                    payload: { message: msg.text!.body, channel: 'whatsapp', isVoice: false },
                };
            }

            if (text.startsWith('/mezat') || text.includes('mezat')) {
                return {
                    ...base,
                    agentType: 'auctioneer',
                    taskType: 'list_auctions',
                    payload: { message: msg.text!.body },
                };
            }

            if (text.startsWith('/teklif') || text.includes('teklif')) {
                return {
                    ...base,
                    agentType: 'negotiator',
                    taskType: 'evaluate_offer',
                    payload: { message: msg.text!.body },
                };
            }

            if (text === 'evet' || text === 'yayınla' || text === 'onayla') {
                return {
                    ...base,
                    agentType: 'listing_creator',
                    taskType: 'publish_listing',
                    payload: { action: 'confirm', message: msg.text!.body },
                };
            }

            // Default: listing creation
            return {
                ...base,
                agentType: 'listing_creator',
                taskType: 'create_listing',
                payload: { message: msg.text!.body, channel: 'whatsapp', isVoice: false },
            };
        }

        case 'audio':
            return {
                ...base,
                agentType: 'listing_creator',
                taskType: 'create_listing',
                payload: {
                    audioId: msg.audio!.id,
                    mimeType: msg.audio!.mime_type,
                    channel: 'whatsapp',
                    isVoice: true,
                },
            };

        case 'image':
            return {
                ...base,
                agentType: 'listing_creator',
                taskType: 'create_listing',
                payload: {
                    imageId: msg.image!.id,
                    mimeType: msg.image!.mime_type,
                    caption: msg.image!.caption || '',
                    channel: 'whatsapp',
                },
            };

        case 'interactive':
            return {
                ...base,
                agentType: 'listing_creator',
                taskType: 'handle_interactive',
                payload: {
                    interactiveType: msg.interactive!.type,
                    selectedId: msg.interactive!.button_reply?.id || msg.interactive!.list_reply?.id,
                    selectedTitle: msg.interactive!.button_reply?.title || msg.interactive!.list_reply?.title,
                },
            };

        default:
            return {
                ...base,
                agentType: 'notification',
                taskType: 'send_notification',
                payload: { message: 'Desteklenmeyen mesaj türü', channel: 'whatsapp' },
            };
    }
}
