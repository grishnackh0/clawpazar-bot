'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Share2, ShieldCheck, MapPin, Eye, Clock, Package, Truck, MessageCircle } from 'lucide-react';
import { listingsApi, type Listing } from '@/lib/api';
import { formatPrice, formatTimeAgo } from '@/lib/store';
import { getMockListing } from '@/lib/mock-data';
import { BottomNav } from '@/components/BottomNav';

const conditionLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'Sıfır', color: 'bg-[var(--neon-green)]/15 text-[var(--neon-green)] border border-[var(--neon-green)]/20' },
    like_new: { label: 'Az Kullanılmış', color: 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/20' },
    used: { label: 'Kullanılmış', color: 'bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/20' },
};

export default function IlanDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [listing, setListing] = useState<Listing | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [showKargo, setShowKargo] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Try real API first, fallback to mock
        listingsApi.get(id)
            .then(setListing)
            .catch(() => {
                const mock = getMockListing(id);
                if (mock) {
                    setListing(mock);
                } else {
                    setNotFound(true);
                }
            });
    }, [id]);

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]/20">
                    <Package className="w-9 h-9 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">İlan Bulunamadı</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Bu ilan kaldırılmış veya mevcut değil.</p>
                <Link href="/kesfet" className="neon-btn rounded-full px-6 py-2.5 text-sm text-white font-medium">
                    Keşfet&apos;e Dön
                </Link>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex items-center justify-center min-h-dvh">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-[var(--neon-cyan)] border-t-transparent animate-spin" />
                    <p className="text-xs text-[var(--color-text-muted)] font-retro">YÜKLENİYOR...</p>
                </div>
            </div>
        );
    }

    const cond = conditionLabels[listing.condition] || conditionLabels.used;

    return (
        <div className="pb-32 min-h-dvh">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-[var(--color-surface-base)] to-transparent">
                <Link href="/kesfet" className="flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90">
                    <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </Link>
                <div className="flex gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90">
                        <Heart className="w-5 h-5 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full glass border border-[var(--neon-purple)]/15 transition-all active:scale-90">
                        <Share2 className="w-5 h-5 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Image Area */}
            <div className="relative aspect-square bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-base)] flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-[var(--color-text-muted)] icon-neon mx-auto mb-2" strokeWidth={1} />
                    <p className="text-xs text-[var(--color-text-muted)]">Fotoğraf yakında</p>
                </div>
            </div>

            {/* Content */}
            <motion.div
                className="p-5 space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Price & Title */}
                <div>
                    <div className="price price-lg">
                        {formatPrice(listing.price)}
                    </div>
                    <h1 className="text-lg font-bold mt-1 text-[var(--color-text-primary)]">
                        {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(listing.created_at)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cond.color}`}>
                        {cond.label}
                    </span>
                    {listing.categories && (
                        <span className="rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                            {listing.categories.name_tr}
                        </span>
                    )}
                    <span className="rounded-full bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-1 text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {listing.favorite_count}
                    </span>
                </div>

                {/* Description */}
                <div className="neon-card p-4">
                    <h2 className="text-sm font-semibold mb-2 text-[var(--color-text-primary)]">Açıklama</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {listing.description}
                    </p>
                </div>

                {/* Escrow / Trust Banner */}
                <div className="neon-card p-4 border-[var(--neon-green)]/20">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--neon-green)]/10">
                            <ShieldCheck className="w-5 h-5 text-[var(--neon-green)]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--neon-green)]">ClawPazar Güvenli Alışveriş</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                                Ödemeler escrow hesapta korunur. Alıcı ürünü teslim alıp onaylayana kadar paranız güvende.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Seller */}
                {listing.vendors && (
                    <div className="neon-card p-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF]/20 to-[#00F0FF]/10 border border-[var(--neon-purple)]/20 text-xl">
                            🏪
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{listing.vendors.store_name}</h3>
                            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                                <span>⭐ {listing.vendors.avg_rating?.toFixed(1) || '—'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Kargo Info */}
                <div className="neon-card p-4">
                    <button onClick={() => setShowKargo(!showKargo)} className="w-full flex items-center gap-3 text-left">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--neon-cyan)]/10">
                            <Truck className="w-5 h-5 text-[var(--neon-cyan)]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Kargo Seçenekleri</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">39.90₺&apos;den başlayan fiyatlarla</p>
                        </div>
                        <ChevronLeft className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${showKargo ? 'rotate-90' : '-rotate-90'}`} />
                    </button>
                    {showKargo && (
                        <motion.div
                            className="mt-3 pt-3 border-t border-[var(--neon-purple)]/10 space-y-2"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        >
                            {[
                                { name: 'PTT Kargo', price: '39.90₺', time: '3-4 gün' },
                                { name: 'MNG Kargo', price: '49.90₺', time: '2-3 gün' },
                                { name: 'Yurtiçi Kargo', price: '54.90₺', time: '1-2 gün' },
                            ].map((k) => (
                                <div key={k.name} className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-secondary)]">{k.name}</span>
                                    <span className="text-[var(--color-text-muted)]">{k.price} — {k.time}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--neon-purple)]/10 p-4 pb-safe">
                <div className="mx-auto max-w-lg flex gap-3">
                    <Link
                        href="/sohbet"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] transition-all active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                        Teklif Ver
                    </Link>
                    <button className="flex-1 rounded-xl neon-btn py-3.5 text-sm font-bold text-white transition-all active:scale-95">
                        ⚡ Hemen Al
                    </button>
                </div>
            </div>
        </div>
    );
}
