'use client';

import { useState, useCallback } from 'react';
import { negotiationsApi, type Negotiation } from '@/lib/api';
import { formatPrice } from '@/lib/store';

interface NegotiationPanelProps {
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    onComplete?: (negotiation: Negotiation) => void;
}

interface Message {
    id: string;
    role: 'buyer' | 'seller' | 'agent';
    content: string;
    amount?: number;
    type: 'offer' | 'counter' | 'accept' | 'reject' | 'info';
}

export function NegotiationPanel({
    listingId, listingTitle, listingPrice, onComplete,
}: NegotiationPanelProps) {
    const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [offerInput, setOfferInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const addMessage = (msg: Omit<Message, 'id'>) => {
        setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
    };

    const handleStartNegotiation = useCallback(async () => {
        const amount = Number(offerInput);
        if (!amount || amount <= 0) return;

        setIsLoading(true);
        try {
            addMessage({
                role: 'buyer',
                content: `${formatPrice(amount)} teklif ediyorum`,
                amount,
                type: 'offer',
            });

            const result = await negotiationsApi.start(listingId, amount);
            setNegotiation(result);

            // Simulated agent response
            setTimeout(() => {
                addMessage({
                    role: 'agent',
                    content: `🤖 Teklifiniz satıcıya iletildi. Ürünün piyasa değeri ${formatPrice(listingPrice)} civarında.`,
                    type: 'info',
                });
            }, 800);

            setOfferInput('');
        } catch (err) {
            addMessage({
                role: 'agent',
                content: `❌ ${err instanceof Error ? err.message : 'Hata oluştu'}`,
                type: 'info',
            });
        } finally {
            setIsLoading(false);
        }
    }, [listingId, offerInput, listingPrice]);

    const handleAccept = useCallback(async () => {
        if (!negotiation) return;
        setIsLoading(true);
        try {
            const result = await negotiationsApi.accept(negotiation.id);
            setNegotiation(result);
            setIsComplete(true);
            addMessage({
                role: 'agent',
                content: `🤝 Anlaşma tamamlandı! ${formatPrice(result.agreed_price || result.current_offer)}`,
                amount: result.agreed_price || result.current_offer,
                type: 'accept',
            });
            onComplete?.(result);
        } catch (err) {
            addMessage({
                role: 'agent',
                content: `❌ ${err instanceof Error ? err.message : 'Hata oluştu'}`,
                type: 'info',
            });
        } finally {
            setIsLoading(false);
        }
    }, [negotiation, onComplete]);

    const handleCounter = useCallback(async () => {
        const amount = Number(offerInput);
        if (!amount || !negotiation) return;

        setIsLoading(true);
        try {
            addMessage({
                role: 'buyer',
                content: `Karşı teklifim: ${formatPrice(amount)}`,
                amount,
                type: 'counter',
            });

            await negotiationsApi.counter(negotiation.id, amount);
            setOfferInput('');

            setTimeout(() => {
                addMessage({
                    role: 'agent',
                    content: '🔄 Karşı teklifiniz değerlendiriliyor...',
                    type: 'info',
                });
            }, 500);
        } catch (err) {
            addMessage({
                role: 'agent',
                content: `❌ ${err instanceof Error ? err.message : 'Hata oluştu'}`,
                type: 'info',
            });
        } finally {
            setIsLoading(false);
        }
    }, [negotiation, offerInput]);

    // Suggested offers
    const suggestions = [
        Math.round(listingPrice * 0.7),
        Math.round(listingPrice * 0.8),
        Math.round(listingPrice * 0.9),
    ];

    return (
        <div className="flex flex-col h-full max-h-[500px] rounded-2xl border border-white/5 overflow-hidden bg-[var(--color-surface-card)]">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-[var(--color-surface-elevated)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    💬 Pazarlık — {listingTitle}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    İstenen fiyat: {formatPrice(listingPrice)}
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-[var(--color-text-muted)] py-6">
                        <p className="text-2xl mb-2">🤝</p>
                        <p className="text-sm">Teklif vererek pazarlığı başlatın</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex animate-float-in ${msg.role === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'buyer'
                                    ? 'bg-gradient-to-r from-[var(--color-brand-violet)] to-[var(--color-brand-fuchsia)] text-white rounded-br-md'
                                    : msg.type === 'accept'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-bl-md'
                                        : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] rounded-bl-md'
                                }`}
                        >
                            {msg.content}
                            {msg.amount && msg.type !== 'info' && (
                                <div className="mt-1 text-lg font-bold price">
                                    {formatPrice(msg.amount)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl bg-[var(--color-surface-elevated)] px-4 py-3 rounded-bl-md">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]"
                                        style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {!isComplete && (
                <div className="border-t border-white/5 p-4 space-y-3">
                    {/* Suggestion chips */}
                    {!negotiation && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {suggestions.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setOfferInput(String(amount))}
                                    className="shrink-0 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/20 active:scale-95"
                                >
                                    {formatPrice(amount)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={offerInput}
                            onChange={(e) => setOfferInput(e.target.value)}
                            placeholder="Teklif tutarı (₺)"
                            className="flex-1 rounded-xl bg-[var(--color-surface-base)] border border-white/5 px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-violet-500/50 focus:outline-none"
                        />
                        {negotiation ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAccept}
                                    disabled={isLoading}
                                    className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={handleCounter}
                                    disabled={isLoading || !offerInput}
                                    className="rounded-xl bg-gradient-to-r from-[var(--color-brand-violet)] to-[var(--color-brand-fuchsia)] px-4 py-3 text-sm font-medium text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    ↩
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleStartNegotiation}
                                disabled={isLoading || !offerInput}
                                className="rounded-xl bg-gradient-to-r from-[var(--color-brand-violet)] to-[var(--color-brand-fuchsia)] px-6 py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                            >
                                Teklif
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
