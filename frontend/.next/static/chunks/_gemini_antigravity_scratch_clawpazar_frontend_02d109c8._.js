(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        userId: null,
        email: null,
        displayName: null,
        role: null,
        token: ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('cp_token') : "TURBOPACK unreachable",
        isAuthenticated: ("TURBOPACK compile-time truthy", 1) ? !!localStorage.getItem('cp_token') : "TURBOPACK unreachable",
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
const useAuction = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
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
const useChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
const useListings = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
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
    if (diffMin < 60) return "".concat(diffMin, " dk önce");
    if (diffHour < 24) return "".concat(diffHour, " sa önce");
    if (diffDay < 7) return "".concat(diffDay, " gün önce");
    return then.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:4000") || '';
async function request(method, path, body) {
    const token = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('cp_token') : "TURBOPACK unreachable";
    const res = await fetch("".concat(API_BASE).concat(path), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...token ? {
                Authorization: "Bearer ".concat(token)
            } : {}
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({
                error: res.statusText
            }));
        throw new Error(err.error || "API Error: ".concat(res.status));
    }
    return res.json();
}
const listingsApi = {
    browse: (params)=>{
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach((param)=>{
                let [k, v] = param;
                if (v !== undefined) qs.set(k, String(v));
            });
        }
        return request('GET', "/api/listings?".concat(qs));
    },
    get: (id)=>request('GET', "/api/listings/".concat(id)),
    create: function(message, images) {
        let channel = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'web';
        return request('POST', '/api/listings', {
            message,
            images,
            channel
        });
    },
    update: (id, data)=>request('PUT', "/api/listings/".concat(id), data),
    publish: (id)=>request('POST', "/api/listings/".concat(id, "/publish")),
    delete: (id)=>request('DELETE', "/api/listings/".concat(id)),
    semanticSearch: function(embedding) {
        let limit = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
        return request('POST', '/api/listings/search/semantic', {
            embedding,
            limit
        });
    }
};
const auctionsApi = {
    list: ()=>request('GET', '/api/auctions'),
    create: (data)=>request('POST', '/api/auctions', data),
    bid: (auctionId, amount)=>request('POST', "/api/auctions/".concat(auctionId, "/bid"), {
            amount
        })
};
const negotiationsApi = {
    start: (listingId, offerAmount)=>request('POST', '/api/negotiations', {
            listingId,
            offerAmount
        }),
    counter: (id, amount)=>request('POST', "/api/negotiations/".concat(id, "/counter"), {
            amount
        }),
    accept: (id)=>request('POST', "/api/negotiations/".concat(id, "/accept"))
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
    taskStatus: (taskId)=>request('GET', "/api/agents/tasks/".concat(taskId))
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/ws.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ClawPazar – WebSocket Client
// Auto-reconnecting WebSocket for auction rooms and real-time updates
__turbopack_context__.s([
    "ClawSocket",
    ()=>ClawSocket,
    "getSocket",
    ()=>getSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class ClawSocket {
    // ----------------------------------------------------------
    // CONNECTION
    // ----------------------------------------------------------
    connect(params) {
        if (this.isDestroyed) return;
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        this.ws = new WebSocket("".concat(this.url).concat(qs));
        this.ws.onopen = ()=>{
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.emit('connected', {
                type: 'connected'
            });
        };
        this.ws.onmessage = (event)=>{
            try {
                const msg = JSON.parse(event.data);
                this.emit(msg.type, msg);
                this.emit('*', msg); // wildcard listener
            } catch (e) {
            // ignore malformed messages
            }
        };
        this.ws.onclose = ()=>{
            this.stopHeartbeat();
            this.emit('disconnected', {
                type: 'disconnected'
            });
            this.attemptReconnect(params);
        };
        this.ws.onerror = ()=>{
            var _this_ws;
            (_this_ws = this.ws) === null || _this_ws === void 0 ? void 0 : _this_ws.close();
        };
    }
    disconnect() {
        var _this_ws;
        this.isDestroyed = true;
        this.stopHeartbeat();
        (_this_ws = this.ws) === null || _this_ws === void 0 ? void 0 : _this_ws.close();
        this.ws = null;
        this.handlers.clear();
    }
    // ----------------------------------------------------------
    // AUCTION ROOMS
    // ----------------------------------------------------------
    joinAuction(auctionId, userId) {
        this.disconnect();
        this.isDestroyed = false;
        this.connect({
            auctionId,
            ...userId ? {
                userId
            } : {}
        });
    }
    leaveAuction() {
        this.disconnect();
    }
    // ----------------------------------------------------------
    // MESSAGING
    // ----------------------------------------------------------
    send(message) {
        var _this_ws;
        if (((_this_ws = this.ws) === null || _this_ws === void 0 ? void 0 : _this_ws.readyState) === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    // ----------------------------------------------------------
    // EVENT HANDLING
    // ----------------------------------------------------------
    on(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType).add(handler);
        // Return unsubscribe function
        return ()=>{
            var _this_handlers_get;
            (_this_handlers_get = this.handlers.get(eventType)) === null || _this_handlers_get === void 0 ? void 0 : _this_handlers_get.delete(handler);
        };
    }
    emit(eventType, message) {
        var _this_handlers_get;
        (_this_handlers_get = this.handlers.get(eventType)) === null || _this_handlers_get === void 0 ? void 0 : _this_handlers_get.forEach((handler)=>handler(message));
    }
    // ----------------------------------------------------------
    // RECONNECTION
    // ----------------------------------------------------------
    attemptReconnect(params) {
        if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        setTimeout(()=>{
            if (!this.isDestroyed) {
                this.connect(params);
            }
        }, delay);
    }
    // ----------------------------------------------------------
    // HEARTBEAT
    // ----------------------------------------------------------
    startHeartbeat() {
        this.heartbeatInterval = setInterval(()=>{
            this.send({
                type: 'ping'
            });
        }, 25000);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------
    get isConnected() {
        var _this_ws;
        return ((_this_ws = this.ws) === null || _this_ws === void 0 ? void 0 : _this_ws.readyState) === WebSocket.OPEN;
    }
    constructor(baseUrl){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "ws", null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "url", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "handlers", new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "reconnectAttempts", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "maxReconnectAttempts", 10);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "reconnectDelay", 1000);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "heartbeatInterval", null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isDestroyed", false);
        const wsBase = baseUrl || ("TURBOPACK compile-time value", "ws://localhost:4000") || 'ws://localhost:4000';
        this.url = "".concat(wsBase, "/ws");
    }
}
// Singleton for app-wide use
let socketInstance = null;
function getSocket() {
    if (!socketInstance) {
        socketInstance = new ClawSocket();
    }
    return socketInstance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CountdownTimer",
    ()=>CountdownTimer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function CountdownTimer(param) {
    let { endsAt, onExpired, size = 'md' } = param;
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(getTimeLeft(endsAt));
    const tick = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CountdownTimer.useCallback[tick]": ()=>{
            const left = getTimeLeft(endsAt);
            setTimeLeft(left);
            if (left.total <= 0) onExpired === null || onExpired === void 0 ? void 0 : onExpired();
        }
    }["CountdownTimer.useCallback[tick]"], [
        endsAt,
        onExpired
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CountdownTimer.useEffect": ()=>{
            tick();
            const interval = setInterval(tick, 1000);
            return ({
                "CountdownTimer.useEffect": ()=>clearInterval(interval)
            })["CountdownTimer.useEffect"];
        }
    }["CountdownTimer.useEffect"], [
        tick
    ]);
    const isUrgent = timeLeft.total > 0 && timeLeft.total <= 30000; // last 30 seconds
    const isExpired = timeLeft.total <= 0;
    const sizeClasses = {
        sm: 'text-sm gap-1',
        md: 'text-xl gap-2',
        lg: 'text-3xl gap-3'
    }[size];
    const blockClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-lg'
    }[size];
    if (isExpired) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 text-[var(--color-accent-error)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-lg",
                    children: "⏰"
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                    lineNumber: 44,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-bold",
                    children: "Süre Doldu!"
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                    lineNumber: 45,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
            lineNumber: 43,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center ".concat(sizeClasses, " ").concat(isUrgent ? 'animate-[countdown-pulse_0.5s_ease-in-out_infinite]' : ''),
        children: [
            timeLeft.hours > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TimeBlock, {
                value: timeLeft.hours,
                label: "sa",
                className: blockClasses,
                isUrgent: isUrgent
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                lineNumber: 53,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TimeBlock, {
                value: timeLeft.minutes,
                label: "dk",
                className: blockClasses,
                isUrgent: isUrgent
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                lineNumber: 55,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TimeBlock, {
                value: timeLeft.seconds,
                label: "sn",
                className: blockClasses,
                isUrgent: isUrgent
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                lineNumber: 56,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
        lineNumber: 51,
        columnNumber: 9
    }, this);
}
_s(CountdownTimer, "DvFOgMh0pMMFCfyzWfY4qbQ1Mbc=");
_c = CountdownTimer;
function TimeBlock(param) {
    let { value, label, className, isUrgent } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center rounded-xl font-mono font-bold ".concat(className, " ").concat(isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-white/5'),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: String(value).padStart(2, '0')
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                lineNumber: 71,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[8px] font-normal text-[var(--color-text-muted)] -mt-0.5",
                children: label
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
                lineNumber: 72,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx",
        lineNumber: 67,
        columnNumber: 9
    }, this);
}
_c1 = TimeBlock;
function getTimeLeft(endsAt) {
    const total = Math.max(0, new Date(endsAt).getTime() - Date.now());
    return {
        total,
        hours: Math.floor(total / 3600000),
        minutes: Math.floor(total % 3600000 / 60000),
        seconds: Math.floor(total % 60000 / 1000)
    };
}
var _c, _c1;
__turbopack_context__.k.register(_c, "CountdownTimer");
__turbopack_context__.k.register(_c1, "TimeBlock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuctionRoom",
    ()=>AuctionRoom
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/gavel.js [app-client] (ecmascript) <export default as Gavel>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$ws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/ws.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$CountdownTimer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/CountdownTimer.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function AuctionRoom(param) {
    let { auctionId, userId } = param;
    var _activeAuction_listings;
    _s();
    const { activeAuction, bids, isConnected, setAuction, addBid, updatePrice, setConnected, reset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuction"])();
    const [bidAmount, setBidAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showConfetti, setShowConfetti] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastBidFlash, setLastBidFlash] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuctionRoom.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auctionsApi"].list().then({
                "AuctionRoom.useEffect": (auctions)=>{
                    const found = auctions.find({
                        "AuctionRoom.useEffect.found": (a)=>a.id === auctionId
                    }["AuctionRoom.useEffect.found"]);
                    if (found) setAuction(found);
                }
            }["AuctionRoom.useEffect"]).catch(console.error);
            return ({
                "AuctionRoom.useEffect": ()=>reset()
            })["AuctionRoom.useEffect"];
        }
    }["AuctionRoom.useEffect"], [
        auctionId,
        setAuction,
        reset
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuctionRoom.useEffect": ()=>{
            const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$ws$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSocket"])();
            socket.joinAuction(auctionId, userId);
            const unsubConnected = socket.on('connected', {
                "AuctionRoom.useEffect.unsubConnected": ()=>setConnected(true)
            }["AuctionRoom.useEffect.unsubConnected"]);
            const unsubDisconnected = socket.on('disconnected', {
                "AuctionRoom.useEffect.unsubDisconnected": ()=>setConnected(false)
            }["AuctionRoom.useEffect.unsubDisconnected"]);
            const unsubBid = socket.on('new_bid', {
                "AuctionRoom.useEffect.unsubBid": (data)=>{
                    addBid(data.bid);
                    updatePrice(data.currentPrice, data.endsAt);
                    setLastBidFlash(true);
                    setTimeout({
                        "AuctionRoom.useEffect.unsubBid": ()=>setLastBidFlash(false)
                    }["AuctionRoom.useEffect.unsubBid"], 600);
                }
            }["AuctionRoom.useEffect.unsubBid"]);
            const unsubEnd = socket.on('auction_ended', {
                "AuctionRoom.useEffect.unsubEnd": ()=>{
                    setShowConfetti(true);
                }
            }["AuctionRoom.useEffect.unsubEnd"]);
            return ({
                "AuctionRoom.useEffect": ()=>{
                    unsubConnected();
                    unsubDisconnected();
                    unsubBid();
                    unsubEnd();
                    socket.leaveAuction();
                }
            })["AuctionRoom.useEffect"];
        }
    }["AuctionRoom.useEffect"], [
        auctionId,
        userId,
        addBid,
        updatePrice,
        setConnected
    ]);
    const placeBid = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuctionRoom.useCallback[placeBid]": async (amount)=>{
            const finalAmount = amount || parseFloat(bidAmount);
            if (!finalAmount || !activeAuction) return;
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auctionsApi"].bid(auctionId, finalAmount);
                setBidAmount('');
            } catch (err) {
                console.error('Bid failed:', err);
            }
        }
    }["AuctionRoom.useCallback[placeBid]"], [
        auctionId,
        bidAmount,
        activeAuction
    ]);
    if (!activeAuction) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-full",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1.5",
                children: [
                    0,
                    1,
                    2
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 w-3 rounded-full bg-[var(--neon-purple)]",
                        style: {
                            animation: "typing-dot 1.2s ease-in-out ".concat(i * 0.2, "s infinite")
                        }
                    }, i, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 71,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 69,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
            lineNumber: 68,
            columnNumber: 13
        }, this);
    }
    const currentPrice = activeAuction.current_price;
    const quickBids = [
        {
            label: '+100 ₺',
            amount: currentPrice + 100
        },
        {
            label: '+500 ₺',
            amount: currentPrice + 500
        },
        {
            label: '+1K ₺',
            amount: currentPrice + 1000
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full relative overflow-hidden retro-grid",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-1/4 w-64 h-64 bg-[#6B00FF]/10 rounded-full blur-[100px]"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 89,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-1/4 right-0 w-48 h-48 bg-[#FF2D78]/8 rounded-full blur-[80px]"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 90,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 88,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass border-b border-[var(--neon-purple)]/10 p-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "live-badge rounded-full px-2.5 py-1 text-xs font-bold font-retro inline-flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-2 h-2 rounded-full bg-[var(--neon-pink)] animate-live-dot"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                        lineNumber: 97,
                                        columnNumber: 25
                                    }, this),
                                    "CANLI MEZAT"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-retro",
                                children: isConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                            className: "w-3 h-3 icon-green icon-neon",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                            lineNumber: 102,
                                            columnNumber: 33
                                        }, this),
                                        " BAĞLI"
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                                            className: "w-3 h-3 text-[var(--color-accent-error)]",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                            lineNumber: 103,
                                            columnNumber: 33
                                        }, this),
                                        " BAĞLANIYOR..."
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 100,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 95,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-[var(--color-text-primary)]",
                        children: ((_activeAuction_listings = activeAuction.listings) === null || _activeAuction_listings === void 0 ? void 0 : _activeAuction_listings.title) || 'Mezat'
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 94,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "text-center py-8 relative z-10",
                style: {
                    animation: lastBidFlash ? 'bid-flash 0.6s ease-out' : undefined
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-[var(--color-text-muted)] mb-2 font-retro flex items-center justify-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                className: "w-3 h-3",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 116,
                                columnNumber: 21
                            }, this),
                            "GÜNCEL TEKLİF"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 115,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "text-4xl font-[900] neon-text price font-retro",
                        style: {
                            fontFamily: 'var(--font-display)',
                            filter: 'drop-shadow(0 0 20px rgba(107, 0, 255, 0.5))'
                        },
                        initial: {
                            scale: 1.2,
                            opacity: 0
                        },
                        animate: {
                            scale: 1,
                            opacity: 1
                        },
                        transition: {
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(currentPrice)
                    }, currentPrice, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 119,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$CountdownTimer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CountdownTimer"], {
                            endsAt: activeAuction.ends_at
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                            lineNumber: 130,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 129,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto px-4 space-y-2 relative z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                    children: bids.map((bid)=>{
                        var _bid_bidder_id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "neon-card p-3 flex items-center justify-between",
                            initial: {
                                opacity: 0,
                                x: -20
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            exit: {
                                opacity: 0,
                                x: 20
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-[var(--color-text-muted)] font-retro",
                                    children: ((_bid_bidder_id = bid.bidder_id) === null || _bid_bidder_id === void 0 ? void 0 : _bid_bidder_id.slice(0, 8)) || 'ANONIM'
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                    lineNumber: 145,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-bold neon-text price font-retro",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(bid.amount)
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                    lineNumber: 146,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, bid.id, true, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                            lineNumber: 138,
                            columnNumber: 25
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                    lineNumber: 136,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 135,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass border-t border-[var(--neon-purple)]/10 p-4 pb-safe relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mb-3",
                        children: quickBids.map((qb)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                onClick: ()=>placeBid(qb.amount),
                                className: "flex-1 neon-btn-cyan rounded-xl py-2.5 text-xs font-bold font-retro text-white vhs-glitch",
                                whileTap: {
                                    scale: 0.93
                                },
                                children: qb.label
                            }, qb.label, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 156,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 154,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 rounded-xl bg-[var(--color-surface-base)] border border-[var(--neon-purple)]/15 px-4 py-2.5 focus-within:border-[var(--neon-cyan)]/40 focus-within:shadow-[0_0_16px_rgba(0,240,255,0.1)] transition-all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: bidAmount,
                                    onChange: (e)=>setBidAmount(e.target.value),
                                    placeholder: "Teklif tutarı ₺",
                                    className: "w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none price font-retro"
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                    lineNumber: 168,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 167,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                onClick: ()=>placeBid(),
                                className: "neon-btn rounded-xl px-5 text-sm font-bold text-white flex items-center gap-1.5",
                                whileTap: {
                                    scale: 0.93
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gavel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gavel$3e$__["Gavel"], {
                                        className: "w-4 h-4",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                        lineNumber: 181,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-retro",
                                        children: "TEKLİF"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                        lineNumber: 182,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 176,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 166,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 153,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showConfetti && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "text-center",
                        initial: {
                            scale: 0
                        },
                        animate: {
                            scale: 1
                        },
                        transition: {
                            type: 'spring',
                            stiffness: 200
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                className: "w-16 h-16 mx-auto text-[var(--neon-orange)] icon-neon mb-4",
                                strokeWidth: 1
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 192,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-bold neon-text font-retro",
                                style: {
                                    fontFamily: 'var(--font-display)'
                                },
                                children: "MEZAT BİTTİ!"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 193,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-[var(--color-text-secondary)] mt-2",
                                children: "Kazanan belirlendi"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                                lineNumber: 194,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                        lineNumber: 191,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                    lineNumber: 190,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
                lineNumber: 188,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx",
        lineNumber: 86,
        columnNumber: 9
    }, this);
}
_s(AuctionRoom, "si5QujQs6CpWEGHWt7qZxN7eVqQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuction"]
    ];
});
_c = AuctionRoom;
var _c;
__turbopack_context__.k.register(_c, "AuctionRoom");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LiveAuctionPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$AuctionRoom$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AuctionRoom.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function LiveAuctionPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const auctionId = params === null || params === void 0 ? void 0 : params.id;
    const { userId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-dvh",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-4 pt-12 pb-3 border-b border-white/5 glass",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/mezat",
                        className: "flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] border border-white/5 transition-all active:scale-90",
                        children: "←"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                        lineNumber: 17,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-sm font-bold flex-1",
                        children: "🔨 Canlı Mezat"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                        lineNumber: 23,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-2 w-2 rounded-full bg-red-400 animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                                lineNumber: 25,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-medium text-red-400",
                                children: "CANLI"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                                lineNumber: 26,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                        lineNumber: 24,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                lineNumber: 16,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$AuctionRoom$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuctionRoom"], {
                    auctionId: auctionId,
                    userId: userId || undefined
                }, void 0, false, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                    lineNumber: 32,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
                lineNumber: 31,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/mezat/[id]/page.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
_s(LiveAuctionPage, "FzUukvNoE5RfkEiFKA6/lV6K8ZQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = LiveAuctionPage;
var _c;
__turbopack_context__.k.register(_c, "LiveAuctionPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_gemini_antigravity_scratch_clawpazar_frontend_02d109c8._.js.map