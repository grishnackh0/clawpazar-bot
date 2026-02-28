'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Camera, Mic, MicOff, Send, Smartphone, ShoppingBag, Gamepad2, ShoppingCart, Sparkles, ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useChat, useAuth, type ChatMessage } from '@/lib/store';

/* ── Real LLM streaming client ── */

async function streamAgentResponse(
    history: ChatMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
): Promise<void> {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: history.map((m) => ({ role: m.role, content: m.content })),
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
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

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
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
                } catch {
                    // Skip malformed chunks
                }
            }
        }

        onDone();
    } catch (err) {
        onError(err instanceof Error ? err.message : 'Bağlantı hatası');
    }
}

/* ── Speech Recognition helper ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

function getSpeechRecognition(): SpeechRecognitionInstance | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return null;
    const recognition = new SR();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    return recognition;
}

/* ── Component ── */

export function AgentChat() {
    const {
        messages, isAgentTyping, agentStatus,
        addMessage, addAgentReply, deleteMessage, setAgentTyping,
        getMessages, streamAgentStart, updateLastAgentMessage, finalizeStream,
    } = useChat();
    const isAuthenticated = useAuth((s) => s.isAuthenticated);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isSending = useRef(false);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isAgentTyping]);

    const sendMessage = useCallback(async (overrideText?: string) => {
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
            type: 'text',
        });

        // 2. Show typing indicator
        setAgentTyping(true, '🔍 Analiz ediliyor...');

        try {
            // 3. Brief delay for UX
            await new Promise((r) => setTimeout(r, 400));
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
                type: 'text',
            });

            // 6. Stream response from LLM
            await streamAgentResponse(
                currentHistory,
                (accumulated) => {
                    updateLastAgentMessage(accumulated);
                },
                () => {
                    finalizeStream();
                },
                (err) => {
                    // On error, update the streaming message with error content
                    updateLastAgentMessage(`⚠️ ${err}`);
                    finalizeStream();
                },
            );
        } catch {
            addAgentReply({
                id: crypto.randomUUID(),
                role: 'agent',
                content: '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.',
                timestamp: new Date(),
                type: 'text',
            });
        } finally {
            isSending.current = false;
        }
    }, [input, addMessage, addAgentReply, setAgentTyping, getMessages, streamAgentStart, updateLastAgentMessage, finalizeStream]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    /* ── Voice recording with Web Speech API ── */
    const toggleRecording = useCallback(() => {
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
                type: 'text',
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
            type: 'voice',
        });

        recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) {
                setIsRecording(false);
                sendMessage(transcript);
            }
        };

        recognition.onerror = () => {
            setIsRecording(false);
            addAgentReply({
                id: crypto.randomUUID(),
                role: 'agent',
                content: '⚠️ Sesli komut alınamadı. Mikrofon iznini kontrol edin ve tekrar deneyin.',
                timestamp: new Date(),
                type: 'text',
            });
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    }, [isRecording, addMessage, addAgentReply, sendMessage]);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        deleteMessage(id);
        setDeleteTarget(null);
    };

    const quickActions = [
        { text: 'Telefon satmak istiyorum', icon: Smartphone },
        { text: 'Ayakkabı var', icon: ShoppingBag },
        { text: 'PlayStation satılık', icon: Gamepad2 },
    ];

    /* ── Suggestion chips based on conversation context ── */
    const getSuggestions = (): string[] => {
        if (messages.length === 0) return [];
        const lastAgent = [...messages].reverse().find((m) => m.role === 'agent');
        const content = lastAgent?.content?.toLowerCase() || '';

        // Kargo flow
        if (content.includes('kargoyu ben ayarlayayım') || content.includes('kargo seçenek')) {
            return ['PTT Kargo (39.90₺)', 'MNG Kargo (49.90₺)', 'Yurtiçi Kargo (54.90₺)', 'Yüz yüze teslim'];
        }
        if (content.includes('kargo') || content.includes('teslimat') || content.includes('gönder')) {
            return ['Kargoyu sen ayarla', 'Yüz yüze teslim', 'Adresimi gönderiyorum'];
        }
        // Publish flow
        if (content.includes('yayınla') || content.includes('ilan taslağı') || content.includes('tüm bilgiler')) {
            return ['Yayınla', 'Fotoğraf ekle', 'Kargo seçenekleri'];
        }
        // Escrow
        if (content.includes('escrow') || content.includes('güvenli')) {
            return ['Escrow nasıl çalışır?', 'Ödeme yap', 'İptal et'];
        }
        // Collecting info
        if (content.includes('fotoğraf') || content.includes('ilan')) {
            return ['Fotoğraf ekle', 'Yayınla', 'Kargo bilgisi'];
        }
        if (messages.length > 4) {
            return ['Yayınla', 'Fotoğraf ekle', 'Kargo bilgisi'];
        }
        return ['Fiyat öner', 'Durumu iyi', 'Fotoğraf ekle'];
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <div className="flex items-center gap-3 p-4 glass border-b border-[var(--neon-purple)]/10">
                <Link href="/" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[var(--neon-purple)]/10 transition-colors -ml-1">
                    <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </Link>
                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] animate-glow-ring scanline-overlay">
                        <Bot className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--neon-green)] border-2 border-[var(--color-surface-base)]" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                        ClawPazar Ajan
                        <Sparkles className="w-3 h-3 icon-purple icon-neon" />
                    </h2>
                    <p className="text-[11px] font-retro" style={{ color: isAgentTyping ? 'var(--neon-cyan)' : 'var(--neon-green)' }}>
                        {isAgentTyping ? (agentStatus || 'İŞLİYOR...') : 'BAĞLI — GERÇEK AJAN (GLM-5.0)'}
                    </p>
                </div>
                {!isAuthenticated && (
                    <Link href="/auth" className="ml-auto text-[10px] font-retro text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 rounded-full px-3 py-1 hover:bg-[var(--neon-cyan)]/10 transition-colors">
                        GİRİŞ YAP
                    </Link>
                )}
            </div>

            {/* ── Messages ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Empty state */}
                {messages.length === 0 && !isAgentTyping && (
                    <motion.div className="text-center py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF]/20 to-[#00F0FF]/10 border border-[var(--neon-purple)]/20 mb-4 scanline-overlay">
                            <ShoppingCart className="w-9 h-9 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Merhaba! Ben ClawPazar Ajanın</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto mb-6">
                            Satmak istediğin ürünü anlat, gerçek AI ajan seninle konuşsun!
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickActions.map((qa) => {
                                const QaIcon = qa.icon;
                                return (
                                    <motion.button key={qa.text} onClick={() => sendMessage(qa.text)}
                                        className="rounded-full border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 px-4 py-2.5 text-xs font-medium text-[var(--neon-cyan)] transition-all hover:bg-[var(--neon-purple)]/15 active:scale-95 flex items-center gap-1.5"
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <QaIcon className="w-3.5 h-3.5 icon-neon" strokeWidth={1.5} />
                                        {qa.text}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Message bubbles */}
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg relative`}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Agent avatar */}
                        {msg.role === 'agent' && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] mr-2 mt-1 shadow-[0_0_12px_rgba(107,0,255,0.3)] scanline-overlay">
                                <Bot className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                            </div>
                        )}

                        <div className="relative max-w-[80%]">
                            {/* Bubble */}
                            <div
                                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-[#6B00FF] to-[#4800B0] text-white rounded-br-md shadow-[0_0_16px_rgba(107,0,255,0.2)]'
                                    : 'bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 text-[var(--color-text-primary)] rounded-bl-md shadow-[0_0_20px_rgba(107,0,255,0.1)]'
                                    }`}
                                onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); setDeleteTarget(msg.id); }}
                            >
                                {msg.type === 'voice' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[var(--neon-pink)] animate-pulse">●</span>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 12 }).map((_, j) => (
                                                <div key={j} className="w-1 rounded-full" style={{ height: `${8 + Math.random() * 16}px`, opacity: 0.4 + Math.random() * 0.6, background: 'linear-gradient(to top, #6B00FF, #00F0FF)' }} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">
                                        {msg.content || (msg.isStreaming ? '▊' : '')}
                                    </div>
                                )}

                                {/* Streaming cursor */}
                                {msg.isStreaming && msg.content && (
                                    <span className="inline-block w-1.5 h-4 bg-[var(--neon-cyan)] animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                                )}
                            </div>

                            {/* Delete button — on right-click */}
                            <AnimatePresence>
                                {deleteTarget === msg.id && (
                                    <motion.button
                                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--neon-pink)] shadow-[0_0_12px_rgba(255,45,120,0.4)] z-10"
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        onClick={(e: React.MouseEvent) => handleDelete(e, msg.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Timestamp */}
                            <div className={`text-[10px] text-[var(--color-text-muted)]/50 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                    {isAgentTyping && (
                        <motion.div className="flex items-start gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] shadow-[0_0_12px_rgba(107,0,255,0.3)] scanline-overlay">
                                <Bot className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                            </div>
                            <div className="rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/10 px-4 py-3 rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((j) => (
                                            <div key={j} className="h-2 w-2 rounded-full bg-[var(--neon-cyan)]"
                                                style={{ animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                                        ))}
                                    </div>
                                    {agentStatus && <span className="text-xs text-[var(--neon-cyan)] ml-1 font-retro">{agentStatus}</span>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Suggestion chips ── */}
            {messages.length > 0 && !isAgentTyping && (
                <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-t border-[var(--neon-purple)]/5">
                    {getSuggestions().map((text) => (
                        <button key={text} onClick={() => sendMessage(text)}
                            className="shrink-0 rounded-full border border-[var(--neon-purple)]/20 bg-[var(--neon-purple)]/5 px-3 py-1.5 text-[11px] text-[var(--neon-cyan)] active:scale-95 transition-transform">
                            {text}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Input bar ── */}
            <div className="border-t border-[var(--neon-purple)]/10 p-3 pb-safe glass">
                <div className="flex items-end gap-2">
                    <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 text-[var(--color-text-muted)] transition-all active:scale-90 hover:border-[var(--neon-cyan)]/30 hover:text-[var(--neon-cyan)]">
                        <Camera className="w-5 h-5 icon-neon" strokeWidth={1.5} />
                    </button>
                    <div className="flex-1 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-4 py-2.5 focus-within:border-[var(--neon-cyan)]/40 focus-within:shadow-[0_0_16px_rgba(0,240,255,0.1)] transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Mesaj yazın veya sesli anlatın..."
                            rows={1}
                            className="w-full resize-none bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                            style={{ maxHeight: 120 }}
                        />
                    </div>
                    {input.trim() ? (
                        <motion.button onClick={() => sendMessage()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full neon-btn text-white" whileTap={{ scale: 0.9 }}>
                            <Send className="w-4 h-4" strokeWidth={2} />
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={toggleRecording}
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${isRecording
                                ? 'bg-[var(--neon-pink)] animate-pulse shadow-[0_0_24px_rgba(255,45,120,0.5)]'
                                : 'neon-btn shadow-[0_0_16px_rgba(107,0,255,0.3)]'
                                }`}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-6 h-6 text-white icon-neon" strokeWidth={2} />}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Click-away to dismiss delete */}
            {deleteTarget && (
                <div className="fixed inset-0 z-0" onClick={() => setDeleteTarget(null)} />
            )}
        </div>
    );
}
