// ClawPazar – Typed API Client
// Wraps all 25+ backend endpoints with auth token injection

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function request<T>(method: Method, path: string, body?: object): Promise<T> {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('cp_token')
        : null;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API Error: ${res.status}`);
    }

    return res.json();
}

// ============================================================
// LISTINGS
// ============================================================

export const listingsApi = {
    browse: (params?: {
        page?: number; limit?: number; category?: string;
        search?: string; minPrice?: number; maxPrice?: number;
        city?: string; sort?: string;
    }) => {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined) qs.set(k, String(v));
            });
        }
        return request<{
            listings: Listing[]; total: number; page: number; limit: number;
        }>('GET', `/api/listings?${qs}`);
    },

    get: (id: string) =>
        request<Listing>('GET', `/api/listings/${id}`),

    create: (message: string, images?: string[], channel = 'web') =>
        request<{ taskId: string; status: string; message: string }>(
            'POST', '/api/listings', { message, images, channel }
        ),

    update: (id: string, data: Partial<Listing>) =>
        request<Listing>('PUT', `/api/listings/${id}`, data),

    publish: (id: string) =>
        request<Listing>('POST', `/api/listings/${id}/publish`),

    delete: (id: string) =>
        request<{ success: boolean }>('DELETE', `/api/listings/${id}`),

    semanticSearch: (embedding: number[], limit = 10) =>
        request<Listing[]>('POST', '/api/listings/search/semantic', { embedding, limit }),
};

// ============================================================
// AUCTIONS
// ============================================================

export const auctionsApi = {
    list: () =>
        request<Auction[]>('GET', '/api/auctions'),

    create: (data: {
        listingId: string; startingPrice: number;
        reservePrice?: number; durationMinutes: number; minBidIncrement?: number;
    }) =>
        request<Auction>('POST', '/api/auctions', data),

    bid: (auctionId: string, amount: number) =>
        request<Bid>('POST', `/api/auctions/${auctionId}/bid`, { amount }),
};

// ============================================================
// NEGOTIATIONS
// ============================================================

export const negotiationsApi = {
    start: (listingId: string, offerAmount: number) =>
        request<Negotiation>('POST', '/api/negotiations', { listingId, offerAmount }),

    counter: (id: string, amount: number) =>
        request<Negotiation>('POST', `/api/negotiations/${id}/counter`, { amount }),

    accept: (id: string) =>
        request<Negotiation>('POST', `/api/negotiations/${id}/accept`),
};

// ============================================================
// PAYMENTS
// ============================================================

export const paymentsApi = {
    initialize: (data: {
        orderId: string; card: object;
        buyer: object; shippingAddress: object; billingAddress: object;
    }) =>
        request<{ status: string; threeDSHtmlContent: string; paymentId: string }>(
            'POST', '/api/payments/initialize', data
        ),
};

// ============================================================
// VENDORS
// ============================================================

export const vendorsApi = {
    register: (data: {
        storeName: string; address: string; city: string;
        district: string; identityNumber: string; iban: string;
        subMerchantType?: string;
    }) =>
        request<{ vendor: object; iyzicoStatus: string }>(
            'POST', '/api/vendors/register', data
        ),
};

// ============================================================
// COMPLIANCE
// ============================================================

export const complianceApi = {
    getDisclosure: () =>
        request<{ title: string; content: string; version: string }>(
            'GET', '/api/compliance/disclosure'
        ),

    recordConsent: (consentType: string, isGranted: boolean, version: string) =>
        request<{ id: string }>('POST', '/api/compliance/consent', {
            consentType, isGranted, consentTextVersion: version,
        }),

    getConsents: () =>
        request<Record<string, boolean>>('GET', '/api/compliance/consents'),

    requestDeletion: (reason: string) =>
        request<{ requestId: string }>('POST', '/api/compliance/delete', { reason }),

    exportData: () =>
        request<object>('GET', '/api/compliance/export'),

    reportTakedown: (data: {
        listingId: string; reporterEmail: string;
        reporterName: string; reason: string;
    }) =>
        request<{ requestId: string; deadline: string }>(
            'POST', '/api/compliance/takedown', data
        ),
};

// ============================================================
// AGENTS
// ============================================================

export const agentsApi = {
    taskStatus: (taskId: string) =>
        request<AgentTask>('GET', `/api/agents/tasks/${taskId}`),
};

// ============================================================
// TYPES
// ============================================================

export interface Listing {
    id: string;
    vendor_id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    thumbnail_url: string;
    category_id: string;
    condition: string;
    city: string;
    status: string;
    content_source: string;
    requires_human_review: boolean;
    view_count: number;
    favorite_count: number;
    created_at: string;
    vendors?: { store_name: string; avg_rating: number; store_slug: string };
    categories?: { name_tr: string; slug: string };
}

export interface Auction {
    id: string;
    listing_id: string;
    starting_price: number;
    current_price: number;
    reserve_price: number;
    min_bid_increment: number;
    bid_count: number;
    highest_bidder_id: string;
    status: string;
    starts_at: string;
    ends_at: string;
    listings?: { title: string; thumbnail_url: string; price: number };
}

export interface Bid {
    id: string;
    auction_id: string;
    bidder_id: string;
    amount: number;
    is_winning: boolean;
    created_at: string;
}

export interface Negotiation {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    initial_offer: number;
    current_offer: number;
    counter_offer: number | null;
    agreed_price: number | null;
    status: string;
    round_count: number;
}

export interface AgentTask {
    id: string;
    agentType: string;
    taskType: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
}
