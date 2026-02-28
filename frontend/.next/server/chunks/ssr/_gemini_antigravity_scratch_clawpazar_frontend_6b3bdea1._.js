module.exports = [
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomNav",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paw$2d$print$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PawPrint$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/paw-print.js [app-ssr] (ecmascript) <export default as PawPrint>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
'use client';
;
;
;
;
const tabs = [
    {
        href: '/',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
        label: 'Ana Sayfa'
    },
    {
        href: '/kesfet',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"],
        label: 'Keşfet'
    },
    {
        href: '/sohbet',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paw$2d$print$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PawPrint$3e$__["PawPrint"],
        label: 'Sat',
        isCenter: true
    },
    {
        href: '/mezat',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
        label: 'Mezat'
    },
    {
        href: '/profil',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
        label: 'Profil'
    }
];
function BottomNav() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "fixed bottom-0 left-0 right-0 z-50 glass pb-safe",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex max-w-lg items-center justify-around px-2 py-1.5",
            children: tabs.map((tab)=>{
                const isActive = tab.href === '/' ? pathname === '/' : pathname === tab.href || pathname?.startsWith(tab.href + '/');
                const Icon = tab.icon;
                if (tab.isCenter) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: tab.href,
                        className: "flex -mt-6 h-[56px] w-[56px] items-center justify-center rounded-full neon-btn animate-neon-pulse transition-transform active:scale-90 vhs-glitch",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: "w-6 h-6 text-white icon-neon",
                            strokeWidth: 2.5
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                            lineNumber: 34,
                            columnNumber: 33
                        }, this)
                    }, "center", false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                        lineNumber: 29,
                        columnNumber: 29
                    }, this);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: tab.href,
                    className: `flex flex-col items-center gap-0.5 px-3 py-2 transition-all duration-200 group ${isActive ? 'text-[var(--neon-cyan)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: `w-5 h-5 transition-all ${isActive ? 'icon-neon' : 'group-hover:icon-neon'}`,
                            strokeWidth: isActive ? 2.5 : 1.5
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                            lineNumber: 48,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-medium tracking-wide",
                            children: tab.label
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                            lineNumber: 52,
                            columnNumber: 29
                        }, this),
                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-0.5 w-5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_rgba(0,240,255,0.5)] mt-0.5"
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                            lineNumber: 54,
                            columnNumber: 33
                        }, this)
                    ]
                }, tab.href + tab.label, true, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
                    lineNumber: 40,
                    columnNumber: 25
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
            lineNumber: 20,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx",
        lineNumber: 19,
        columnNumber: 9
    }, this);
}
}),
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
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MezatPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/gavel.js [app-ssr] (ecmascript) <export default as Gavel>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/package.js [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/BottomNav.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/mock-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-ssr] (ecmascript)");
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
function useCountdown(endsAt) {
    const [remaining, setRemaining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isUrgent, setIsUrgent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const update = ()=>{
            const diff = new Date(endsAt).getTime() - Date.now();
            if (diff <= 0) {
                setRemaining('BİTTİ');
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor(diff % 3600000 / 60000);
            const s = Math.floor(diff % 60000 / 1000);
            setIsUrgent(diff < 600000);
            setRemaining(h > 0 ? `${h}s ${m}dk` : `${m}dk ${s}sn`);
        };
        update();
        const timer = setInterval(update, 1000);
        return ()=>clearInterval(timer);
    }, [
        endsAt
    ]);
    return {
        remaining,
        isUrgent
    };
}
function AuctionCard({ auction }) {
    const { remaining, isUrgent } = useCountdown(auction.ends_at);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: `/mezat/${auction.id}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `neon-card p-4 ${isUrgent ? 'border-[var(--neon-pink)]/40 shadow-[0_0_20px_rgba(255,45,120,0.15)]' : ''} vhs-glitch`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "live-badge rounded-full px-2 py-0.5 text-[10px] font-bold font-retro inline-flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-[var(--neon-pink)] animate-live-dot"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                                lineNumber: 44,
                                                columnNumber: 33
                                            }, this),
                                            "CANLI"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 43,
                                        columnNumber: 29
                                    }, this),
                                    auction.bid_count > 10 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-[var(--neon-orange)] flex items-center gap-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                                className: "w-3 h-3 icon-neon"
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                                lineNumber: 49,
                                                columnNumber: 37
                                            }, this),
                                            " Popüler"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 48,
                                        columnNumber: 33
                                    }, this),
                                    isUrgent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] text-[var(--neon-pink)] flex items-center gap-0.5 animate-pulse font-retro",
                                        children: "SON DAKİKA"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 53,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 42,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-semibold text-[var(--color-text-primary)]",
                                children: auction.listings?.title || 'Mezat Ürünü'
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 58,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "price price-lg",
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPrice"])(auction.current_price)
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 62,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] text-[var(--color-text-muted)]",
                                        children: [
                                            auction.bid_count,
                                            " teklif"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 61,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[11px] text-[var(--color-text-muted)] mt-1",
                                children: [
                                    "Başlangıç: ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPrice"])(auction.starting_price)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 69,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 41,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `text-xs font-retro flex items-center gap-1 justify-end ${isUrgent ? 'text-[var(--neon-pink)] animate-pulse' : 'text-[var(--neon-cyan)]'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        className: "w-3 h-3",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 75,
                                        columnNumber: 29
                                    }, this),
                                    remaining
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 74,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                className: "mt-3 neon-btn-cyan rounded-full px-4 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1",
                                whileTap: {
                                    scale: 0.95
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                        className: "w-3 h-3",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                        lineNumber: 82,
                                        columnNumber: 29
                                    }, this),
                                    "Teklif Ver"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 78,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 73,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 40,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
            lineNumber: 39,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
        lineNumber: 38,
        columnNumber: 9
    }, this);
}
function MezatPage() {
    const [auctions, setAuctions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isOffline, setIsOffline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auctionsApi"].list().then((data)=>{
            setAuctions(data);
            setIsOffline(false);
        }).catch(()=>{
            setAuctions(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockAuctions"]);
            setIsOffline(true);
        }).finally(()=>setLoading(false));
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pb-24 min-h-dvh",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-5 pt-6 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-bold flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                className: "w-5 h-5 icon-pink icon-neon",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 114,
                                columnNumber: 21
                            }, this),
                            "Canlı Mezatlar"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 113,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-[var(--color-text-muted)] mt-1 font-retro flex items-center gap-1.5",
                        children: [
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-3 h-3 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 118,
                                columnNumber: 32
                            }, this) : `${auctions.length} AKTİF MEZAT`,
                            isOffline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[var(--neon-orange)] text-[10px] ml-1",
                                children: "OFFLINE"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                                lineNumber: 120,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 117,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 112,
                columnNumber: 13
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center py-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "w-6 h-6 animate-spin text-[var(--neon-pink)]"
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                    lineNumber: 127,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 126,
                columnNumber: 17
            }, this),
            !loading && auctions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "px-5 space-y-3",
                initial: "hidden",
                animate: "show",
                variants: {
                    show: {
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                },
                children: auctions.map((auction)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        variants: {
                            hidden: {
                                opacity: 0,
                                y: 16
                            },
                            show: {
                                opacity: 1,
                                y: 0
                            }
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuctionCard, {
                            auction: auction
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                            lineNumber: 143,
                            columnNumber: 29
                        }, this)
                    }, auction.id, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 139,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 132,
                columnNumber: 17
            }, this),
            !loading && auctions.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "text-center py-16 px-5",
                initial: {
                    opacity: 0,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--neon-pink)]/10 border border-[var(--neon-pink)]/20 mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                            className: "w-7 h-7 text-[var(--color-text-muted)] icon-neon",
                            strokeWidth: 1
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                            lineNumber: 152,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 151,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[var(--color-text-muted)]",
                        children: "Şu an aktif mezat yok"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                        lineNumber: 154,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 150,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BottomNav"], {}, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
                lineNumber: 158,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/page.tsx",
        lineNumber: 111,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=_gemini_antigravity_scratch_clawpazar_frontend_6b3bdea1._.js.map