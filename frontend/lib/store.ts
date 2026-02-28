// ClawPazar – Zustand State Management
// Stores: auth, auction, chat, listings

import { create } from 'zustand';
import type { Listing, Auction, Bid, Negotiation, AgentTask } from './api';

// ============================================================
// 1. AUTH STORE
// ============================================================

interface AuthState {
    userId: string | null;
    email: string | null;
    displayName: string | null;
    role: 'buyer' | 'seller' | 'admin' | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: { id: string; email: string; displayName: string; role: string }) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    userId: null,
    email: null,
    displayName: null,
    role: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('cp_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('cp_token') : false,

    login: (token, user) => {
        localStorage.setItem('cp_token', token);
        set({
            token,
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as AuthState['role'],
            isAuthenticated: true,
        });
    },

    logout: () => {
        localStorage.removeItem('cp_token');
        set({
            token: null,
            userId: null,
            email: null,
            displayName: null,
            role: null,
            isAuthenticated: false,
        });
    },
}));

// ============================================================
// 2. AUCTION STORE (real-time via WebSocket)
// ============================================================

interface AuctionState {
    activeAuction: Auction | null;
    bids: Bid[];
    isConnected: boolean;
    setAuction: (auction: Auction) => void;
    addBid: (bid: Bid) => void;
    updatePrice: (price: number, endsAt: string) => void;
    setConnected: (connected: boolean) => void;
    reset: () => void;
}

export const useAuction = create<AuctionState>((set) => ({
    activeAuction: null,
    bids: [],
    isConnected: false,

    setAuction: (auction) => set({ activeAuction: auction }),

    addBid: (bid) =>
        set((state) => ({
            bids: [bid, ...state.bids].slice(0, 50), // keep last 50
        })),

    updatePrice: (price, endsAt) =>
        set((state) => ({
            activeAuction: state.activeAuction
                ? { ...state.activeAuction, current_price: price, ends_at: endsAt }
                : null,
        })),

    setConnected: (connected) => set({ isConnected: connected }),

    reset: () => set({ activeAuction: null, bids: [], isConnected: false }),
}));

// ============================================================
// 3. CHAT STORE (agent conversation)
// ============================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'voice' | 'task_card' | 'listing_preview';
    metadata?: Record<string, unknown>;
    agentStatus?: string;
    isStreaming?: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isAgentTyping: boolean;
    agentStatus: string | null;
    activeTask: AgentTask | null;
    addMessage: (msg: ChatMessage) => void;
    addAgentReply: (msg: ChatMessage) => void; // adds msg AND clears typing
    deleteMessage: (id: string) => void;
    setAgentTyping: (typing: boolean, status?: string) => void;
    setActiveTask: (task: AgentTask | null) => void;
    setInput: (text: string) => void;
    clearChat: () => void;
    getMessages: () => ChatMessage[];
    streamAgentStart: (msg: ChatMessage) => void; // start streaming placeholder
    updateLastAgentMessage: (content: string) => void; // update streaming content
    finalizeStream: () => void; // mark streaming done
}

export const useChat = create<ChatState>((set, get) => ({
    messages: [],
    isAgentTyping: false,
    agentStatus: null,
    activeTask: null,

    // Add message WITHOUT touching typing state (for user messages)
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg],
        })),

    // Add agent reply AND clear typing indicator in one atomic update
    addAgentReply: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg],
            isAgentTyping: false,
            agentStatus: null,
        })),

    deleteMessage: (id) =>
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== id),
        })),

    setAgentTyping: (typing, status) =>
        set({ isAgentTyping: typing, agentStatus: status || null }),

    setActiveTask: (task) => set({ activeTask: task }),

    setInput: () => { },

    // Getter for accessing messages outside React render (e.g. in async functions)
    getMessages: () => get().messages,

    // Start a streaming message placeholder
    streamAgentStart: (msg) =>
        set((state) => ({
            messages: [...state.messages, { ...msg, isStreaming: true }],
            isAgentTyping: false,
            agentStatus: null,
        })),

    // Update the last agent message content (for streaming)
    updateLastAgentMessage: (content) =>
        set((state) => {
            const msgs = [...state.messages];
            for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].role === 'agent' && msgs[i].isStreaming) {
                    msgs[i] = { ...msgs[i], content };
                    break;
                }
            }
            return { messages: msgs };
        }),

    // Mark streaming as complete
    finalizeStream: () =>
        set((state) => {
            const msgs = state.messages.map((m) =>
                m.isStreaming ? { ...m, isStreaming: false } : m
            );
            return { messages: msgs, isAgentTyping: false, agentStatus: null };
        }),

    clearChat: () => set({ messages: [], isAgentTyping: false, agentStatus: null, activeTask: null }),
}));

// ============================================================
// 4. LISTINGS STORE
// ============================================================

interface ListingsState {
    listings: Listing[];
    totalCount: number;
    currentPage: number;
    isLoading: boolean;
    filters: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        city?: string;
        sort?: string;
    };
    setListings: (listings: Listing[], total: number) => void;
    appendListings: (listings: Listing[]) => void;
    setPage: (page: number) => void;
    setFilters: (filters: Partial<ListingsState['filters']>) => void;
    setLoading: (loading: boolean) => void;
}

export const useListings = create<ListingsState>((set) => ({
    listings: [],
    totalCount: 0,
    currentPage: 1,
    isLoading: false,
    filters: {},

    setListings: (listings, total) => set({ listings, totalCount: total, currentPage: 1 }),

    appendListings: (newListings) =>
        set((state) => ({
            listings: [...state.listings, ...newListings],
            currentPage: state.currentPage + 1,
        })),

    setPage: (page) => set({ currentPage: page }),

    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
            listings: [],
            currentPage: 1,
        })),

    setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================================
// HELPERS
// ============================================================

/** Format price as Turkish Lira */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/** Format relative time in Turkish */
export function formatTimeAgo(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHour < 24) return `${diffHour} sa önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return then.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}
