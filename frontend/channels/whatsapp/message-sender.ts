// ClawPazar – WhatsApp Message Sender
// Uses WhatsApp Cloud API to send template and freeform messages

const WA_API = 'https://graph.facebook.com/v19.0';

interface SendConfig {
    phoneNumberId: string;
    accessToken: string;
}

// ============================================================
// TEXT MESSAGES
// ============================================================

export async function sendTextMessage(
    config: SendConfig,
    to: string,
    text: string,
): Promise<WhatsAppResponse> {
    return sendRequest(config, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
    });
}

// ============================================================
// TEMPLATE MESSAGES (pre-approved by Meta)
// ============================================================

export async function sendTemplateMessage(
    config: SendConfig,
    to: string,
    templateName: string,
    languageCode: string,
    components?: TemplateComponent[],
): Promise<WhatsAppResponse> {
    return sendRequest(config, {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
            name: templateName,
            language: { code: languageCode },
            components,
        },
    });
}

// ============================================================
// INTERACTIVE MESSAGES (buttons, lists)
// ============================================================

export async function sendButtonMessage(
    config: SendConfig,
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
): Promise<WhatsAppResponse> {
    return sendRequest(config, {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            header: headerText ? { type: 'text', text: headerText } : undefined,
            body: { text: bodyText },
            action: {
                buttons: buttons.map((b) => ({
                    type: 'reply',
                    reply: { id: b.id, title: b.title },
                })),
            },
        },
    });
}

export async function sendListMessage(
    config: SendConfig,
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
    }>,
): Promise<WhatsAppResponse> {
    return sendRequest(config, {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'list',
            body: { text: bodyText },
            action: { button: buttonText, sections },
        },
    });
}

// ============================================================
// MEDIA MESSAGES
// ============================================================

export async function sendImageMessage(
    config: SendConfig,
    to: string,
    imageUrl: string,
    caption?: string,
): Promise<WhatsAppResponse> {
    return sendRequest(config, {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: { link: imageUrl, caption },
    });
}

// ============================================================
// CLAWPAZAR-SPECIFIC TEMPLATES
// ============================================================

export async function sendListingCreatedNotification(
    config: SendConfig,
    to: string,
    listingTitle: string,
    listingPrice: string,
    listingCategory: string,
): Promise<void> {
    // First: preview message
    await sendTextMessage(
        config,
        to,
        `✅ İlanınız hazır!\n\n📦 ${listingTitle}\n💰 ${listingPrice} ₺\n📂 ${listingCategory}\n\nYayınlamak ister misiniz?`,
    );

    // Second: action buttons
    await sendButtonMessage(config, to, 'Ne yapmak istersiniz?', [
        { id: 'publish', title: '✅ Yayınla' },
        { id: 'edit', title: '✏️ Düzenle' },
        { id: 'cancel', title: '❌ İptal' },
    ]);
}

export async function sendBidNotification(
    config: SendConfig,
    to: string,
    auctionTitle: string,
    bidAmount: string,
    bidderName: string,
): Promise<void> {
    await sendTextMessage(
        config,
        to,
        `🔨 Yeni teklif!\n\n📦 ${auctionTitle}\n💰 ${bidAmount} ₺\n👤 ${bidderName}`,
    );
}

export async function sendOrderConfirmation(
    config: SendConfig,
    to: string,
    orderNumber: string,
    itemTitle: string,
    paidAmount: string,
): Promise<void> {
    await sendTextMessage(
        config,
        to,
        `🛒 Siparişiniz onaylandı!\n\n📋 ${orderNumber}\n📦 ${itemTitle}\n💳 ${paidAmount} ₺\n\nEscrow ile korunmaktadır ✅`,
    );
}

// ============================================================
// INTERNAL
// ============================================================

interface WhatsAppResponse {
    messaging_product: string;
    contacts: Array<{ wa_id: string }>;
    messages: Array<{ id: string }>;
}

interface TemplateComponent {
    type: 'header' | 'body' | 'button';
    parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
}

async function sendRequest(config: SendConfig, body: object): Promise<WhatsAppResponse> {
    const res = await fetch(`${WA_API}/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`WhatsApp API Error: ${res.status} – ${JSON.stringify(err)}`);
    }

    return res.json();
}
