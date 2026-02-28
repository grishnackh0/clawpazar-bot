module.exports = [
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
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentChat",
    ()=>AgentChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/bot.js [app-ssr] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/camera.js [app-ssr] (ecmascript) <export default as Camera>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/mic.js [app-ssr] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/mic-off.js [app-ssr] (ecmascript) <export default as MicOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript) <export default as Smartphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-ssr] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-ssr] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/lib/store.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
/* ── Real LLM streaming client ── */ async function streamAgentResponse(history, onChunk, onDone, onError) {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: history.map((m)=>({
                        role: m.role,
                        content: m.content
                    }))
            })
        });
        if (!res.ok) {
            const data = await res.json().catch(()=>({
                    error: `HTTP ${res.status}`
                }));
            onError(data.error || `API hatası: ${res.status}`);
            return;
        }
        if (!res.body) {
            onError('Yanıt stream bulunamadı');
            return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';
        while(true){
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, {
                stream: true
            });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines){
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const data = trimmed.slice(6);
                if (data === '[DONE]') continue;
                try {
                    const json = JSON.parse(data);
                    if (json.content) {
                        accumulated += json.content;
                        onChunk(accumulated);
                    }
                } catch  {
                // Skip malformed chunks
                }
            }
        }
        onDone();
    } catch (err) {
        onError(err instanceof Error ? err.message : 'Bağlantı hatası');
    }
}
function getSpeechRecognition() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = undefined;
    const SR = undefined;
    const recognition = undefined;
}
function AgentChat() {
    const { messages, isAgentTyping, agentStatus, addMessage, addAgentReply, deleteMessage, setAgentTyping, getMessages, streamAgentStart, updateLastAgentMessage, finalizeStream } = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChat"])();
    const isAuthenticated = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])((s)=>s.isAuthenticated);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isRecording, setIsRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deleteTarget, setDeleteTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isSending = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll on new messages
    (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [
        messages,
        isAgentTyping
    ]);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (overrideText)=>{
        const text = (overrideText || input).trim();
        if (!text || isSending.current) return;
        isSending.current = true;
        setInput('');
        // 1. Add user message
        addMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: text,
            timestamp: new Date(),
            type: 'text'
        });
        // 2. Show typing indicator
        setAgentTyping(true, '🔍 Analiz ediliyor...');
        try {
            // 3. Brief delay for UX
            await new Promise((r)=>setTimeout(r, 400));
            setAgentTyping(true, '🤖 LLM bağlantısı kuruluyor...');
            // 4. Get full conversation history (fresh from store)
            const currentHistory = getMessages();
            // 5. Create streaming placeholder
            const replyId = crypto.randomUUID();
            streamAgentStart({
                id: replyId,
                role: 'agent',
                content: '',
                timestamp: new Date(),
                type: 'text'
            });
            // 6. Stream response from LLM
            await streamAgentResponse(currentHistory, (accumulated)=>{
                updateLastAgentMessage(accumulated);
            }, ()=>{
                finalizeStream();
            }, (err)=>{
                // On error, update the streaming message with error content
                updateLastAgentMessage(`⚠️ ${err}`);
                finalizeStream();
            });
        } catch  {
            addAgentReply({
                id: crypto.randomUUID(),
                role: 'agent',
                content: '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.',
                timestamp: new Date(),
                type: 'text'
            });
        } finally{
            isSending.current = false;
        }
    }, [
        input,
        addMessage,
        addAgentReply,
        setAgentTyping,
        getMessages,
        streamAgentStart,
        updateLastAgentMessage,
        finalizeStream
    ]);
    const handleKeyDown = (e)=>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    /* ── Voice recording with Web Speech API ── */ const toggleRecording = (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (isRecording) {
            // Stop recording
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }
        const recognition = getSpeechRecognition();
        if (!recognition) {
            addAgentReply({
                id: crypto.randomUUID(),
                role: 'agent',
                content: '⚠️ Tarayıcınız sesli komutları desteklemiyor. Chrome, Edge veya Safari kullanın.',
                timestamp: new Date(),
                type: 'text'
            });
            return;
        }
        recognitionRef.current = recognition;
        setIsRecording(true);
        // Show recording indicator
        addMessage({
            id: crypto.randomUUID(),
            role: 'user',
            content: '🎤 Dinleniyor...',
            timestamp: new Date(),
            type: 'voice'
        });
        recognition.onresult = (event)=>{
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) {
                setIsRecording(false);
                sendMessage(transcript);
            }
        };
        recognition.onerror = ()=>{
            setIsRecording(false);
            addAgentReply({
                id: crypto.randomUUID(),
                role: 'agent',
                content: '⚠️ Sesli komut alınamadı. Mikrofon iznini kontrol edin ve tekrar deneyin.',
                timestamp: new Date(),
                type: 'text'
            });
        };
        recognition.onend = ()=>{
            setIsRecording(false);
        };
        recognition.start();
    }, [
        isRecording,
        addMessage,
        addAgentReply,
        sendMessage
    ]);
    const handleDelete = (e, id)=>{
        e.preventDefault();
        e.stopPropagation();
        deleteMessage(id);
        setDeleteTarget(null);
    };
    const quickActions = [
        {
            text: 'Telefon satmak istiyorum',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"]
        },
        {
            text: 'Ayakkabı var',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"]
        },
        {
            text: 'PlayStation satılık',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"]
        }
    ];
    /* ── Suggestion chips based on conversation context ── */ const getSuggestions = ()=>{
        if (messages.length === 0) return [];
        const lastAgent = [
            ...messages
        ].reverse().find((m)=>m.role === 'agent');
        const content = lastAgent?.content?.toLowerCase() || '';
        // Kargo flow
        if (content.includes('kargoyu ben ayarlayayım') || content.includes('kargo seçenek')) {
            return [
                'PTT Kargo (39.90₺)',
                'MNG Kargo (49.90₺)',
                'Yurtiçi Kargo (54.90₺)',
                'Yüz yüze teslim'
            ];
        }
        if (content.includes('kargo') || content.includes('teslimat') || content.includes('gönder')) {
            return [
                'Kargoyu sen ayarla',
                'Yüz yüze teslim',
                'Adresimi gönderiyorum'
            ];
        }
        // Publish flow
        if (content.includes('yayınla') || content.includes('ilan taslağı') || content.includes('tüm bilgiler')) {
            return [
                'Yayınla',
                'Fotoğraf ekle',
                'Kargo seçenekleri'
            ];
        }
        // Escrow
        if (content.includes('escrow') || content.includes('güvenli')) {
            return [
                'Escrow nasıl çalışır?',
                'Ödeme yap',
                'İptal et'
            ];
        }
        // Collecting info
        if (content.includes('fotoğraf') || content.includes('ilan')) {
            return [
                'Fotoğraf ekle',
                'Yayınla',
                'Kargo bilgisi'
            ];
        }
        if (messages.length > 4) {
            return [
                'Yayınla',
                'Fotoğraf ekle',
                'Kargo bilgisi'
            ];
        }
        return [
            'Fiyat öner',
            'Durumu iyi',
            'Fotoğraf ekle'
        ];
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4 glass border-b border-[var(--neon-purple)]/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--neon-purple)]/10 transition-colors -ml-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            className: "w-5 h-5 text-[var(--color-text-secondary)]"
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 291,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 290,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] animate-glow-ring scanline-overlay",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                    className: "w-5 h-5 text-white",
                                    strokeWidth: 2
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 295,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 294,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--neon-green)] border-2 border-[var(--color-surface-base)]"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 297,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 293,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5",
                                children: [
                                    "ClawPazar Ajan",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "w-3 h-3 icon-purple icon-neon"
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                        lineNumber: 302,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 300,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] font-retro",
                                style: {
                                    color: isAgentTyping ? 'var(--neon-cyan)' : 'var(--neon-green)'
                                },
                                children: isAgentTyping ? agentStatus || 'İŞLİYOR...' : 'BAĞLI — GERÇEK AJAN (GLM-5.0)'
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 304,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 299,
                        columnNumber: 17
                    }, this),
                    !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/auth",
                        className: "ml-auto text-[10px] font-retro text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 rounded-full px-3 py-1 hover:bg-[var(--neon-cyan)]/10 transition-colors",
                        children: "GİRİŞ YAP"
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 309,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                lineNumber: 289,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                className: "flex-1 overflow-y-auto p-4 space-y-3",
                children: [
                    messages.length === 0 && !isAgentTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "text-center py-12",
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: 0.5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF]/20 to-[#00F0FF]/10 border border-[var(--neon-purple)]/20 mb-4 scanline-overlay",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                    className: "w-9 h-9 text-[var(--color-text-muted)] icon-neon",
                                    strokeWidth: 1
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 321,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 320,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-[var(--color-text-primary)] mb-2",
                                children: "Merhaba! Ben ClawPazar Ajanın"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 323,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto mb-6",
                                children: "Satmak istediğin ürünü anlat, gerçek AI ajan seninle konuşsun!"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 324,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap justify-center gap-2",
                                children: quickActions.map((qa)=>{
                                    const QaIcon = qa.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                        onClick: ()=>sendMessage(qa.text),
                                        className: "rounded-full border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 px-4 py-2.5 text-xs font-medium text-[var(--neon-cyan)] transition-all hover:bg-[var(--neon-purple)]/15 active:scale-95 flex items-center gap-1.5",
                                        whileHover: {
                                            scale: 1.05
                                        },
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(QaIcon, {
                                                className: "w-3.5 h-3.5 icon-neon",
                                                strokeWidth: 1.5
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                lineNumber: 334,
                                                columnNumber: 41
                                            }, this),
                                            qa.text
                                        ]
                                    }, qa.text, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                        lineNumber: 331,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 327,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 319,
                        columnNumber: 21
                    }, this),
                    messages.map((msg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg relative`,
                            initial: {
                                opacity: 0,
                                y: 12,
                                scale: 0.97
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            transition: {
                                duration: 0.3
                            },
                            children: [
                                msg.role === 'agent' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] mr-2 mt-1 shadow-[0_0_12px_rgba(107,0,255,0.3)] scanline-overlay",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                        className: "w-3.5 h-3.5 text-white",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                        lineNumber: 355,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 354,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative max-w-[80%]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-[#6B00FF] to-[#4800B0] text-white rounded-br-md shadow-[0_0_16px_rgba(107,0,255,0.2)]' : 'bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 text-[var(--color-text-primary)] rounded-bl-md shadow-[0_0_20px_rgba(107,0,255,0.1)]'}`,
                                            onContextMenu: (e)=>{
                                                e.preventDefault();
                                                setDeleteTarget(msg.id);
                                            },
                                            children: [
                                                msg.type === 'voice' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[var(--neon-pink)] animate-pulse",
                                                            children: "●"
                                                        }, void 0, false, {
                                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex gap-0.5",
                                                            children: Array.from({
                                                                length: 12
                                                            }).map((_, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-1 rounded-full",
                                                                    style: {
                                                                        height: `${8 + Math.random() * 16}px`,
                                                                        opacity: 0.4 + Math.random() * 0.6,
                                                                        background: 'linear-gradient(to top, #6B00FF, #00F0FF)'
                                                                    }
                                                                }, j, false, {
                                                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                                    lineNumber: 373,
                                                                    columnNumber: 49
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                            lineNumber: 371,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 37
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "whitespace-pre-wrap",
                                                    children: msg.content || (msg.isStreaming ? '▊' : '')
                                                }, void 0, false, {
                                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 37
                                                }, this),
                                                msg.isStreaming && msg.content && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-block w-1.5 h-4 bg-[var(--neon-cyan)] animate-pulse ml-0.5 align-text-bottom rounded-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                            lineNumber: 361,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                            children: deleteTarget === msg.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                                className: "absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--neon-pink)] shadow-[0_0_12px_rgba(255,45,120,0.4)] z-10",
                                                initial: {
                                                    scale: 0
                                                },
                                                animate: {
                                                    scale: 1
                                                },
                                                exit: {
                                                    scale: 0
                                                },
                                                onClick: (e)=>handleDelete(e, msg.id),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                    className: "w-3.5 h-3.5 text-white",
                                                    strokeWidth: 2
                                                }, void 0, false, {
                                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                    lineNumber: 397,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                lineNumber: 392,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                            lineNumber: 390,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `text-[10px] text-[var(--color-text-muted)]/50 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`,
                                            children: new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                            lineNumber: 403,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 359,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, msg.id, true, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 345,
                            columnNumber: 21
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: isAgentTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "flex items-start gap-2",
                            initial: {
                                opacity: 0,
                                y: 8
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] shadow-[0_0_12px_rgba(107,0,255,0.3)] scanline-overlay",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                        className: "w-3.5 h-3.5 text-white",
                                        strokeWidth: 2
                                    }, void 0, false, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                        lineNumber: 415,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 414,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/10 px-4 py-3 rounded-bl-md",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1",
                                                children: [
                                                    0,
                                                    1,
                                                    2
                                                ].map((j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-2 w-2 rounded-full bg-[var(--neon-cyan)]",
                                                        style: {
                                                            animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite`
                                                        }
                                                    }, j, false, {
                                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 45
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                lineNumber: 419,
                                                columnNumber: 37
                                            }, this),
                                            agentStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-[var(--neon-cyan)] ml-1 font-retro",
                                                children: agentStatus
                                            }, void 0, false, {
                                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                                lineNumber: 425,
                                                columnNumber: 53
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                        lineNumber: 418,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                    lineNumber: 417,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 413,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 411,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                lineNumber: 316,
                columnNumber: 13
            }, this),
            messages.length > 0 && !isAgentTyping && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-t border-[var(--neon-purple)]/5",
                children: getSuggestions().map((text)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>sendMessage(text),
                        className: "shrink-0 rounded-full border border-[var(--neon-purple)]/20 bg-[var(--neon-purple)]/5 px-3 py-1.5 text-[11px] text-[var(--neon-cyan)] active:scale-95 transition-transform",
                        children: text
                    }, text, false, {
                        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                        lineNumber: 437,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                lineNumber: 435,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-[var(--neon-purple)]/10 p-3 pb-safe glass",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-end gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 text-[var(--color-text-muted)] transition-all active:scale-90 hover:border-[var(--neon-cyan)]/30 hover:text-[var(--neon-cyan)]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$camera$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Camera$3e$__["Camera"], {
                                className: "w-5 h-5 icon-neon",
                                strokeWidth: 1.5
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 449,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 448,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-4 py-2.5 focus-within:border-[var(--neon-cyan)]/40 focus-within:shadow-[0_0_16px_rgba(0,240,255,0.1)] transition-all",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: input,
                                onChange: (e)=>setInput(e.target.value),
                                onKeyDown: handleKeyDown,
                                placeholder: "Mesaj yazın veya sesli anlatın...",
                                rows: 1,
                                className: "w-full resize-none bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none",
                                style: {
                                    maxHeight: 120
                                }
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 452,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 451,
                            columnNumber: 21
                        }, this),
                        input.trim() ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                            onClick: ()=>sendMessage(),
                            className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full neon-btn text-white",
                            whileTap: {
                                scale: 0.9
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "w-4 h-4",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 464,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 463,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                            onClick: toggleRecording,
                            className: `flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${isRecording ? 'bg-[var(--neon-pink)] animate-pulse shadow-[0_0_24px_rgba(255,45,120,0.5)]' : 'neon-btn shadow-[0_0_16px_rgba(107,0,255,0.3)]'}`,
                            whileTap: {
                                scale: 0.9
                            },
                            children: isRecording ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                                className: "w-5 h-5 text-white"
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 475,
                                columnNumber: 44
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                className: "w-6 h-6 text-white icon-neon",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                                lineNumber: 475,
                                columnNumber: 88
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                            lineNumber: 467,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                    lineNumber: 447,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                lineNumber: 446,
                columnNumber: 13
            }, this),
            deleteTarget && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-0",
                onClick: ()=>setDeleteTarget(null)
            }, void 0, false, {
                fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
                lineNumber: 483,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx",
        lineNumber: 287,
        columnNumber: 9
    }, this);
}
}),
"[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/sohbet/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SohbetPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$AgentChat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/.gemini/antigravity/scratch/clawpazar/frontend/components/AgentChat.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function SohbetPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex flex-col bg-[var(--color-surface-base)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f2e$gemini$2f$antigravity$2f$scratch$2f$clawpazar$2f$frontend$2f$components$2f$AgentChat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AgentChat"], {}, void 0, false, {
            fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/sohbet/page.tsx",
            lineNumber: 8,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/.gemini/antigravity/scratch/clawpazar/frontend/app/sohbet/page.tsx",
        lineNumber: 7,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=_gemini_antigravity_scratch_clawpazar_frontend_e7096690._.js.map