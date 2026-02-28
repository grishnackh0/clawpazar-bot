'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Flame, Clock, Gavel, Package, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { auctionsApi, type Auction } from '@/lib/api';
import { mockAuctions } from '@/lib/mock-data';
import { formatPrice } from '@/lib/store';

function useCountdown(endsAt: string) {
    const [remaining, setRemaining] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const update = () => {
            const diff = new Date(endsAt).getTime() - Date.now();
            if (diff <= 0) { setRemaining('BİTTİ'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setIsUrgent(diff < 600000);
            setRemaining(h > 0 ? `${h}s ${m}dk` : `${m}dk ${s}sn`);
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [endsAt]);

    return { remaining, isUrgent };
}

function AuctionCard({ auction }: { auction: Auction }) {
    const { remaining, isUrgent } = useCountdown(auction.ends_at);

    return (
        <Link href={`/mezat/${auction.id}`}>
            <div className={`neon-card p-4 ${isUrgent ? 'border-[var(--neon-pink)]/40 shadow-[0_0_20px_rgba(255,45,120,0.15)]' : ''} vhs-glitch`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="live-badge rounded-full px-2 py-0.5 text-[10px] font-bold font-retro inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-pink)] animate-live-dot" />
                                CANLI
                            </div>
                            {auction.bid_count > 10 && (
                                <span className="text-[10px] text-[var(--neon-orange)] flex items-center gap-0.5">
                                    <Flame className="w-3 h-3 icon-neon" /> Popüler
                                </span>
                            )}
                            {isUrgent && (
                                <span className="text-[10px] text-[var(--neon-pink)] flex items-center gap-0.5 animate-pulse font-retro">
                                    SON DAKİKA
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {auction.listings?.title || 'Mezat Ürünü'}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="price price-lg">
                                {formatPrice(auction.current_price)}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">
                                {auction.bid_count} teklif
                            </span>
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                            Başlangıç: {formatPrice(auction.starting_price)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-retro flex items-center gap-1 justify-end ${isUrgent ? 'text-[var(--neon-pink)] animate-pulse' : 'text-[var(--neon-cyan)]'}`}>
                            <Clock className="w-3 h-3" strokeWidth={2} />
                            {remaining}
                        </div>
                        <motion.button
                            className="mt-3 neon-btn-cyan rounded-full px-4 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1"
                            whileTap={{ scale: 0.95 }}
                        >
                            <Gavel className="w-3 h-3" strokeWidth={2} />
                            Teklif Ver
                        </motion.button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function MezatPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        auctionsApi.list()
            .then((data) => {
                setAuctions(data);
                setIsOffline(false);
            })
            .catch(() => {
                setAuctions(mockAuctions);
                setIsOffline(true);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pb-24 min-h-dvh">
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 icon-pink icon-neon" strokeWidth={2} />
                    Canlı Mezatlar
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 font-retro flex items-center gap-1.5">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : `${auctions.length} AKTİF MEZAT`}
                    {isOffline && (
                        <span className="text-[var(--neon-orange)] text-[10px] ml-1">OFFLINE</span>
                    )}
                </p>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--neon-pink)]" />
                </div>
            )}

            {!loading && auctions.length > 0 && (
                <motion.div
                    className="px-5 space-y-3"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    {auctions.map((auction) => (
                        <motion.div
                            key={auction.id}
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        >
                            <AuctionCard auction={auction} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!loading && auctions.length === 0 && (
                <motion.div className="text-center py-16 px-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--neon-pink)]/10 border border-[var(--neon-pink)]/20 mb-4">
                        <Package className="w-7 h-7 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Şu an aktif mezat yok</p>
                </motion.div>
            )}

            <BottomNav />
        </div>
    );
}
