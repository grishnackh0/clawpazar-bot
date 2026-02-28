module.exports = [
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClawPazar – Typed API Client
// Wraps all 25+ backend endpoints with auth token injection
__turbopack_context__.s([
    "agentsApi",
    ()=>agentsApi,
    "auctionsApi",
    ()=>auctionsApi,
    "complianceApi",
    ()=>complianceApi,
    "listingsApi",
    ()=>listingsApi,
    "negotiationsApi",
    ()=>negotiationsApi,
    "paymentsApi",
    ()=>paymentsApi,
    "vendorsApi",
    ()=>vendorsApi
]);
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:4000") || '';
async function request(method, path, body) {
    const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {}
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({
                error: res.statusText
            }));
        throw new Error(err.error || `API Error: ${res.status}`);
    }
    return res.json();
}
const listingsApi = {
    browse: (params)=>{
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v])=>{
                if (v !== undefined) qs.set(k, String(v));
            });
        }
        return request('GET', `/api/listings?${qs}`);
    },
    get: (id)=>request('GET', `/api/listings/${id}`),
    create: (message, images, channel = 'web')=>request('POST', '/api/listings', {
            message,
            images,
            channel
        }),
    update: (id, data)=>request('PUT', `/api/listings/${id}`, data),
    publish: (id)=>request('POST', `/api/listings/${id}/publish`),
    delete: (id)=>request('DELETE', `/api/listings/${id}`),
    semanticSearch: (embedding, limit = 10)=>request('POST', '/api/listings/search/semantic', {
            embedding,
            limit
        })
};
const auctionsApi = {
    list: ()=>request('GET', '/api/auctions'),
    create: (data)=>request('POST', '/api/auctions', data),
    bid: (auctionId, amount)=>request('POST', `/api/auctions/${auctionId}/bid`, {
            amount
        })
};
const negotiationsApi = {
    start: (listingId, offerAmount)=>request('POST', '/api/negotiations', {
            listingId,
            offerAmount
        }),
    counter: (id, amount)=>request('POST', `/api/negotiations/${id}/counter`, {
            amount
        }),
    accept: (id)=>request('POST', `/api/negotiations/${id}/accept`)
};
const paymentsApi = {
    initialize: (data)=>request('POST', '/api/payments/initialize', data)
};
const vendorsApi = {
    register: (data)=>request('POST', '/api/vendors/register', data)
};
const complianceApi = {
    getDisclosure: ()=>request('GET', '/api/compliance/disclosure'),
    recordConsent: (consentType, isGranted, version)=>request('POST', '/api/compliance/consent', {
            consentType,
            isGranted,
            consentTextVersion: version
        }),
    getConsents: ()=>request('GET', '/api/compliance/consents'),
    requestDeletion: (reason)=>request('POST', '/api/compliance/delete', {
            reason
        }),
    exportData: ()=>request('GET', '/api/compliance/export'),
    reportTakedown: (data)=>request('POST', '/api/compliance/takedown', data)
};
const agentsApi = {
    taskStatus: (taskId)=>request('GET', `/api/agents/tasks/${taskId}`)
};
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClawPazar – Zustand State Management
// Stores: auth, auction, chat, listings
__turbopack_context__.s([
    "formatPrice",
    ()=>formatPrice,
    "formatTimeAgo",
    ()=>formatTimeAgo,
    "useAuction",
    ()=>useAuction,
    "useAuth",
    ()=>useAuth,
    "useChat",
    ()=>useChat,
    "useListings",
    ()=>useListings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const useAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        userId: null,
        email: null,
        displayName: null,
        role: null,
        token: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null,
        isAuthenticated: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false,
        login: (token, user)=>{
            localStorage.setItem('cp_token', token);
            set({
                token,
                userId: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                isAuthenticated: true
            });
        },
        logout: ()=>{
            localStorage.removeItem('cp_token');
            set({
                token: null,
                userId: null,
                email: null,
                displayName: null,
                role: null,
                isAuthenticated: false
            });
        }
    }));
const useAuction = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        activeAuction: null,
        bids: [],
        isConnected: false,
        setAuction: (auction)=>set({
                activeAuction: auction
            }),
        addBid: (bid)=>set((state)=>({
                    bids: [
                        bid,
                        ...state.bids
                    ].slice(0, 50)
                })),
        updatePrice: (price, endsAt)=>set((state)=>({
                    activeAuction: state.activeAuction ? {
                        ...state.activeAuction,
                        current_price: price,
                        ends_at: endsAt
                    } : null
                })),
        setConnected: (connected)=>set({
                isConnected: connected
            }),
        reset: ()=>set({
                activeAuction: null,
                bids: [],
                isConnected: false
            })
    }));
const useChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        messages: [],
        isAgentTyping: false,
        agentStatus: null,
        activeTask: null,
        // Add message WITHOUT touching typing state (for user messages)
        addMessage: (msg)=>set((state)=>({
                    messages: [
                        ...state.messages,
                        msg
                    ]
                })),
        // Add agent reply AND clear typing indicator in one atomic update
        addAgentReply: (msg)=>set((state)=>({
                    messages: [
                        ...state.messages,
                        msg
                    ],
                    isAgentTyping: false,
                    agentStatus: null
                })),
        deleteMessage: (id)=>set((state)=>({
                    messages: state.messages.filter((m)=>m.id !== id)
                })),
        setAgentTyping: (typing, status)=>set({
                isAgentTyping: typing,
                agentStatus: status || null
            }),
        setActiveTask: (task)=>set({
                activeTask: task
            }),
        setInput: ()=>{},
        // Getter for accessing messages outside React render (e.g. in async functions)
        getMessages: ()=>get().messages,
        // Start a streaming message placeholder
        streamAgentStart: (msg)=>set((state)=>({
                    messages: [
                        ...state.messages,
                        {
                            ...msg,
                            isStreaming: true
                        }
                    ],
                    isAgentTyping: false,
                    agentStatus: null
                })),
        // Update the last agent message content (for streaming)
        updateLastAgentMessage: (content)=>set((state)=>{
                const msgs = [
                    ...state.messages
                ];
                for(let i = msgs.length - 1; i >= 0; i--){
                    if (msgs[i].role === 'agent' && msgs[i].isStreaming) {
                        msgs[i] = {
                            ...msgs[i],
                            content
                        };
                        break;
                    }
                }
                return {
                    messages: msgs
                };
            }),
        // Mark streaming as complete
        finalizeStream: ()=>set((state)=>{
                const msgs = state.messages.map((m)=>m.isStreaming ? {
                        ...m,
                        isStreaming: false
                    } : m);
                return {
                    messages: msgs,
                    isAgentTyping: false,
                    agentStatus: null
                };
            }),
        clearChat: ()=>set({
                messages: [],
                isAgentTyping: false,
                agentStatus: null,
                activeTask: null
            })
    }));
const useListings = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        listings: [],
        totalCount: 0,
        currentPage: 1,
        isLoading: false,
        filters: {},
        setListings: (listings, total)=>set({
                listings,
                totalCount: total,
                currentPage: 1
            }),
        appendListings: (newListings)=>set((state)=>({
                    listings: [
                        ...state.listings,
                        ...newListings
                    ],
                    currentPage: state.currentPage + 1
                })),
        setPage: (page)=>set({
                currentPage: page
            }),
        setFilters: (filters)=>set((state)=>({
                    filters: {
                        ...state.filters,
                        ...filters
                    },
                    listings: [],
                    currentPage: 1
                })),
        setLoading: (loading)=>set({
                isLoading: loading
            })
    }));
function formatPrice(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
function formatTimeAgo(date) {
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
    return then.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClawPazar – Shared Mock Data
// Realistic Turkish listings and auctions for when backend is offline
__turbopack_context__.s([
    "filterListings",
    ()=>filterListings,
    "getMockListing",
    ()=>getMockListing,
    "mockAuctions",
    ()=>mockAuctions,
    "mockListings",
    ()=>mockListings
]);
const mockListings = [
    {
        id: 'mock-1',
        vendor_id: 'v1',
        title: 'iPhone 15 Pro Max 256GB — Doğal Titanyum',
        description: 'Kutusunda, tüm aksesuarlar mevcut. AppleCare+ Ekim 2025\'e kadar geçerli. Ekranda ve kasada çizik yok. Face ID, kamera, batarya %97 sağlık.',
        price: 58000,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'like_new',
        city: 'İstanbul',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 342,
        favorite_count: 28,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        vendors: {
            store_name: 'TechPazar',
            avg_rating: 4.8,
            store_slug: 'techpazar'
        },
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-2',
        vendor_id: 'v2',
        title: 'MacBook Air M3 15" 16GB/512GB — Gece Yarısı',
        description: '2024 model, kutu açılmamış sıfır ürün. Apple Türkiye garantili. Faturası mevcuttur.',
        price: 45500,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'new',
        city: 'Ankara',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 189,
        favorite_count: 45,
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        vendors: {
            store_name: 'MacStore TR',
            avg_rating: 4.9,
            store_slug: 'macstore-tr'
        },
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-3',
        vendor_id: 'v3',
        title: 'PlayStation 5 Slim + 2 DualSense + 3 Oyun',
        description: 'PS5 Slim dijital sürüm. Spider-Man 2, God of War Ragnarök, FC 25 dahil. 2 orijinal DualSense kol. Kutulu, faturalı.',
        price: 19500,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'like_new',
        city: 'İzmir',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 567,
        favorite_count: 72,
        created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-4',
        vendor_id: 'v4',
        title: 'Nike Air Jordan 1 Retro High OG — Chicago',
        description: 'Orijinal, StockX doğrulamalı. 42 numara. Hiç giyilmedi, sadece denendi. Kutu ve etiket mevcut.',
        price: 8500,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'moda',
        condition: 'new',
        city: 'İstanbul',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 234,
        favorite_count: 56,
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        categories: {
            name_tr: 'Moda',
            slug: 'moda'
        }
    },
    {
        id: 'mock-5',
        vendor_id: 'v5',
        title: 'Samsung Galaxy S24 Ultra 512GB — Titanium Gray',
        description: 'Galaxy AI özellikleri aktif. S Pen dahil. Çizik yok, cam koruyucu ve kılıf ile kullanıldı. Batarya sağlığı mükemmel.',
        price: 42000,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'like_new',
        city: 'Bursa',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 156,
        favorite_count: 19,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-6',
        vendor_id: 'v6',
        title: 'iPad Pro M4 13" 256GB WiFi + Apple Pencil Pro',
        description: 'OLED ekran, M4 çip. Apple Pencil Pro dahil. Magic Keyboard ayrıca satılık. Çizim ve tasarım için ideal.',
        price: 38900,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'like_new',
        city: 'Antalya',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 98,
        favorite_count: 15,
        created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-7',
        vendor_id: 'v7',
        title: 'Dyson V15 Detect Absolute — Lazer Süpürge',
        description: 'Dyson V15 Detect, lazer toz algılama özellikli. Tüm başlıklar mevcut. 1 yıl kullanıldı, mükemmel durumda.',
        price: 14500,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'ev',
        condition: 'used',
        city: 'İstanbul',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 87,
        favorite_count: 12,
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        categories: {
            name_tr: 'Ev & Yaşam',
            slug: 'ev'
        }
    },
    {
        id: 'mock-8',
        vendor_id: 'v8',
        title: 'Adidas Yeezy Boost 350 V2 — Zebra',
        description: 'Orijinal, 43 numara. 3-4 kez giyildi. Temiz durumda, kutu mevcut.',
        price: 5200,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'moda',
        condition: 'used',
        city: 'Ankara',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 145,
        favorite_count: 33,
        created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
        categories: {
            name_tr: 'Moda',
            slug: 'moda'
        }
    },
    {
        id: 'mock-9',
        vendor_id: 'v9',
        title: 'Apple Watch Ultra 2 — Titanyum, 49mm',
        description: 'Alpine Loop kordon + Ocean Band dahil. GPS + Cellular. Ekranda çizik yok, titanyum kasa mükemmel durumda.',
        price: 22000,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'aksesuar',
        condition: 'like_new',
        city: 'İstanbul',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 210,
        favorite_count: 41,
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        categories: {
            name_tr: 'Aksesuar',
            slug: 'aksesuar'
        }
    },
    {
        id: 'mock-10',
        vendor_id: 'v10',
        title: 'Sony WH-1000XM5 — Gürültü Engelleme Kulaklık',
        description: 'Siyah renk, kutulu. ANC performansı harika. 30 saat pil ömrü. USB-C şarj. 6 ay kullanıldı.',
        price: 6800,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'used',
        city: 'Konya',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 178,
        favorite_count: 22,
        created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    },
    {
        id: 'mock-11',
        vendor_id: 'v11',
        title: 'Antika Osmanlı Kahve Fincanı Seti — 6lı',
        description: 'El yapımı, altın yaldızlı. Koleksiyon değeri yüksek. 100+ yıllık orijinal parçalar. Sertifikalı.',
        price: 12000,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'koleksiyon',
        condition: 'used',
        city: 'Trabzon',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 67,
        favorite_count: 18,
        created_at: new Date(Date.now() - 120 * 3600000).toISOString(),
        categories: {
            name_tr: 'Koleksiyon',
            slug: 'koleksiyon'
        }
    },
    {
        id: 'mock-12',
        vendor_id: 'v12',
        title: 'DJI Mini 4 Pro Fly More Combo — Drone',
        description: '4K/60fps HDR video, 48MP fotoğraf. 3 batarya, şarj hub, çanta dahil. 10 uçuş yapıldı. Garanti devam ediyor.',
        price: 27500,
        currency: 'TRY',
        images: [],
        thumbnail_url: '',
        category_id: 'elektronik',
        condition: 'like_new',
        city: 'İstanbul',
        status: 'active',
        content_source: 'user',
        requires_human_review: false,
        view_count: 312,
        favorite_count: 64,
        created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
        categories: {
            name_tr: 'Elektronik',
            slug: 'elektronik'
        }
    }
];
const mockAuctions = [
    {
        id: 'auction-1',
        listing_id: 'mock-2',
        starting_price: 35000,
        current_price: 45200,
        reserve_price: 42000,
        min_bid_increment: 500,
        bid_count: 12,
        highest_bidder_id: 'u5',
        status: 'active',
        starts_at: new Date(Date.now() - 3600000).toISOString(),
        ends_at: new Date(Date.now() + 2 * 3600000 + 14 * 60000).toISOString(),
        listings: {
            title: 'MacBook Pro M3 14"',
            thumbnail_url: '',
            price: 55000
        }
    },
    {
        id: 'auction-2',
        listing_id: 'mock-11',
        starting_price: 2000,
        current_price: 3800,
        reserve_price: 5000,
        min_bid_increment: 200,
        bid_count: 7,
        highest_bidder_id: 'u3',
        status: 'active',
        starts_at: new Date(Date.now() - 7200000).toISOString(),
        ends_at: new Date(Date.now() + 45 * 60000).toISOString(),
        listings: {
            title: 'Antika Osmanlı Kahve Fincanı Seti',
            thumbnail_url: '',
            price: 12000
        }
    },
    {
        id: 'auction-3',
        listing_id: 'mock-3',
        starting_price: 500,
        current_price: 1200,
        reserve_price: 2000,
        min_bid_increment: 100,
        bid_count: 23,
        highest_bidder_id: 'u8',
        status: 'active',
        starts_at: new Date(Date.now() - 10800000).toISOString(),
        ends_at: new Date(Date.now() + 5 * 60000).toISOString(),
        listings: {
            title: 'Koleksiyon Pokémon Kart Seti',
            thumbnail_url: '',
            price: 3000
        }
    },
    {
        id: 'auction-4',
        listing_id: 'mock-9',
        starting_price: 15000,
        current_price: 19800,
        reserve_price: 20000,
        min_bid_increment: 500,
        bid_count: 9,
        highest_bidder_id: 'u2',
        status: 'active',
        starts_at: new Date(Date.now() - 1800000).toISOString(),
        ends_at: new Date(Date.now() + 4 * 3600000).toISOString(),
        listings: {
            title: 'Apple Watch Ultra 2 — Titanyum',
            thumbnail_url: '',
            price: 22000
        }
    }
];
function getMockListing(id) {
    return mockListings.find((l)=>l.id === id);
}
function filterListings(opts) {
    let results = [
        ...mockListings
    ];
    if (opts.category && opts.category !== 'all') {
        results = results.filter((l)=>l.category_id === opts.category);
    }
    if (opts.search) {
        const q = opts.search.toLowerCase();
        results = results.filter((l)=>l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
    }
    return results;
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IlanDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/heart.js [app-ssr] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/share-2.js [app-ssr] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/package.js [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/truck.js [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/mock-data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
const conditionLabels = {
    new: {
        label: 'Sıfır',
        color: 'bg-[var(--neon-green)]/15 text-[var(--neon-green)] border border-[var(--neon-green)]/20'
    },
    like_new: {
        label: 'Az Kullanılmış',
        color: 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/20'
    },
    used: {
        label: 'Kullanılmış',
        color: 'bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/20'
    }
};
function IlanDetailPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const id = params?.id;
    const [listing, setListing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notFound, setNotFound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showKargo, setShowKargo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!id) return;
        // Try real API first, fallback to mock
        __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listingsApi"].get(id).then(setListing).catch(()=>{
            const mock = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMockListing"])(id);
            if (mock) {
                setListing(mock);
            } else {
                setNotFound(true);
            }
        });
    }, [
        id
    ]);
    if (notFound) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-dvh gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-20 w-20 items-center justify-center rounded-full bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]/20",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                        className: "w-9 h-9 text-[var(--color-text-muted)] icon-neon",
                        strokeWidth: 1
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 46,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 45,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-bold text-[var(--color-text-primary)]",
                    children: "İlan Bulunamadı"
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 48,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-[var(--color-text-muted)]",
                    children: "Bu ilan kaldırılmış veya mevcut değil."
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 49,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/kesfet",
                    className: "neon-btn rounded-full px-6 py-2.5 text-sm text-white font-medium",
                    children: "Keşfet'e Dön"
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 50,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
            lineNumber: 44,
            columnNumber: 13
        }, this);
    }
    if (!listing) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-dvh",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 w-8 rounded-full border-2 border-[var(--neon-cyan)] border-t-transparent animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 61,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-[var(--color-text-muted)] font-retro",
                        children: "YÜKLENİYOR..."
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 62,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                lineNumber: 60,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
            lineNumber: 59,
            columnNumber: 13
        }, this);
    }
    const cond = conditionLabels[listing.condition] || conditionLabels.used;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pb-32 min-h-dvh",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-[var(--color-surface-base)] to-transparent",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/kesfet",
                        className: "flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            className: "w-5 h-5 text-[var(--color-text-secondary)]"
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 75,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                    className: "w-5 h-5 text-[var(--color-text-secondary)]",
                                    strokeWidth: 1.5
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                    lineNumber: 79,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 78,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                    className: "w-5 h-5 text-[var(--color-text-secondary)]",
                                    strokeWidth: 1.5
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                    lineNumber: 82,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 81,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 77,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                lineNumber: 73,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative aspect-square bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-base)] flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                            className: "w-16 h-16 text-[var(--color-text-muted)] icon-neon mx-auto mb-2",
                            strokeWidth: 1
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 90,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-[var(--color-text-muted)]",
                            children: "Fotoğraf yakında"
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 91,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 89,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                lineNumber: 88,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "p-5 space-y-5",
                initial: {
                    opacity: 0,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "price price-lg",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPrice"])(listing.price)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 104,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-bold mt-1 text-[var(--color-text-primary)]",
                                children: listing.title
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 107,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 111,
                                                columnNumber: 67
                                            }, this),
                                            " ",
                                            listing.city
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 112,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 113,
                                                columnNumber: 67
                                            }, this),
                                            " ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTimeAgo"])(listing.created_at)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 113,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 67
                                            }, this),
                                            " ",
                                            listing.view_count
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 115,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 110,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 103,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `rounded-full px-3 py-1 text-xs font-semibold ${cond.color}`,
                                children: cond.label
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 121,
                                columnNumber: 21
                            }, this),
                            listing.categories && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-1 text-xs text-[var(--color-text-secondary)]",
                                children: listing.categories.name_tr
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 125,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-1 text-xs text-[var(--color-text-secondary)] flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 25
                                    }, this),
                                    " ",
                                    listing.favorite_count
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 129,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 120,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "neon-card p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold mb-2 text-[var(--color-text-primary)]",
                                children: "Açıklama"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 136,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap",
                                children: listing.description
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 137,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 135,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "neon-card p-4 border-[var(--neon-green)]/20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--neon-green)]/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                        className: "w-5 h-5 text-[var(--neon-green)]",
                                        strokeWidth: 1.5
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                    lineNumber: 145,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-semibold text-[var(--neon-green)]",
                                            children: "ClawPazar Güvenli Alışveriş"
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                            lineNumber: 149,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed",
                                            children: "Ödemeler escrow hesapta korunur. Alıcı ürünü teslim alıp onaylayana kadar paranız güvende."
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                            lineNumber: 150,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                    lineNumber: 148,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 144,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 143,
                        columnNumber: 17
                    }, this),
                    listing.vendors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "neon-card p-4 flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF]/20 to-[#00F0FF]/10 border border-[var(--neon-purple)]/20 text-xl",
                                children: "🏪"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 160,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-[var(--color-text-primary)]",
                                        children: listing.vendors.store_name
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 164,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 text-xs text-[var(--color-text-muted)]",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "⭐ ",
                                                listing.vendors.avg_rating?.toFixed(1) || '—'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                            lineNumber: 166,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 165,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 163,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 159,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "neon-card p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowKargo(!showKargo),
                                className: "w-full flex items-center gap-3 text-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--neon-cyan)]/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                            className: "w-5 h-5 text-[var(--neon-cyan)]",
                                            strokeWidth: 1.5
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                            lineNumber: 176,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-[var(--color-text-primary)]",
                                                children: "Kargo Seçenekleri"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 179,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-[var(--color-text-muted)]",
                                                children: "39.90₺'den başlayan fiyatlarla"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 180,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 178,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        className: `w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showKargo ? 'rotate-90' : '-rotate-90'}`
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 182,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 174,
                                columnNumber: 21
                            }, this),
                            showKargo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                className: "mt-3 pt-3 border-t border-[var(--neon-purple)]/10 space-y-2",
                                initial: {
                                    opacity: 0,
                                    height: 0
                                },
                                animate: {
                                    opacity: 1,
                                    height: 'auto'
                                },
                                children: [
                                    {
                                        name: 'PTT Kargo',
                                        price: '39.90₺',
                                        time: '3-4 gün'
                                    },
                                    {
                                        name: 'MNG Kargo',
                                        price: '49.90₺',
                                        time: '2-3 gün'
                                    },
                                    {
                                        name: 'Yurtiçi Kargo',
                                        price: '54.90₺',
                                        time: '1-2 gün'
                                    }
                                ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[var(--color-text-secondary)]",
                                                children: k.name
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 195,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[var(--color-text-muted)]",
                                                children: [
                                                    k.price,
                                                    " — ",
                                                    k.time
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                                lineNumber: 196,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, k.name, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                lineNumber: 185,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                        lineNumber: 173,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                lineNumber: 96,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--neon-purple)]/10 p-4 pb-safe",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-lg flex gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/sohbet",
                            className: "flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] transition-all active:scale-95",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                    className: "w-4 h-4",
                                    strokeWidth: 1.5
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                                    lineNumber: 211,
                                    columnNumber: 25
                                }, this),
                                "Teklif Ver"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 207,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "flex-1 rounded-xl neon-btn py-3.5 text-sm font-bold text-white transition-all active:scale-95",
                            children: "⚡ Hemen Al"
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                            lineNumber: 214,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                    lineNumber: 206,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
                lineNumber: 205,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/ilan/[id]/page.tsx",
        lineNumber: 71,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=_gemini_antigravity_scratch_clawpazar_frontend_9cbb1e1d._.js.map