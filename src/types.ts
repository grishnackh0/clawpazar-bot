/**
 * ClawPazar — Shared Type Definitions
 */

export type Msg = { role: 'system' | 'user' | 'assistant'; content: string | VisionContent[] };
export type VisionContent = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };
export type AgentType = 'listing' | 'buyer' | 'negotiator' | 'auctioneer' | 'shipping' | 'compliance' | 'general';
export type InlineButton = { text: string; callback_data: string };
export type InlineKeyboard = InlineButton[][];

// ── Event Sourcing ──
export interface Event {
    id: string;
    ts: number;
    type: string;
    userId: number;
    agent?: AgentType;
    data: Record<string, any>;
    prevHash: string;
    hash: string;
}

// ── Intent Memory ──
export interface UserProfile {
    preferredCategories: Record<string, number>;
    priceRange: { min: number; max: number };
    city: string;
    interests: string[];
    totalInteractions: number;
    lastSeen: number;
    buyerScore: number;
    sellerScore: number;
}

// ── Agent Protocol ──
export interface AgentMessage {
    from: AgentType;
    to: AgentType;
    type: 'request' | 'response' | 'handoff' | 'alert';
    payload: Record<string, any>;
    ts: number;
}

// ── Trust Engine ──
export type PermissionMode = 'autonomous' | 'human_approved' | 'denied';
export type TrustAction = 'create_listing' | 'open_auction' | 'negotiate' | 'buy_now';

export interface TrustProfile {
    score: number;
    overrides: number;
    successes: number;
    lastUpdate: number;
}

// ── KVKK ──
export type ConsentType = 'profile' | 'location' | 'purchase_history';

export interface ConsentRecord {
    types: ConsentType[];
    grantedAt: number;
    version: string;
}

// ── Vision ──
export interface PhotoAnalysis {
    model: string;
    durum: string;
    fiyat_min: number;
    fiyat_max: number;
    kategori: string;
    aciklama: string;
}

// ── Data Layer ──
export interface ListingRow {
    id: string; title: string; price: number; condition: string;
    status: string; city: string | null; images: any[];
    view_count: number; created_at: string;
    categories?: { name_tr: string; icon: string } | null;
    vendors?: { store_name: string } | null;
}

export interface AuctionRow {
    id: string; starting_price: number; current_price: number | null;
    bid_count: number; status: string; ends_at: string;
    listings?: { title: string; images: any[] } | null;
}

// ── Escrow ──
export interface EscrowRecord {
    id: string;
    buyerId: number;
    sellerId?: number;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'held' | 'released' | 'refunded' | 'cancelled' | 'pending_approval';
    iyzicoPaymentId?: string;
    iyzicoConversationId: string;
    listingTitle: string;
    createdAt: number;
    approvedBy?: number;
}

// ── Collusion ──
export interface PriceRecord {
    userId: number;
    price: number;
    ts: number;
}
