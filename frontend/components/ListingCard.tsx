'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Heart, Package } from 'lucide-react';
import { formatPrice, formatTimeAgo } from '@/lib/store';
import { WatermarkBadge } from './WatermarkBadge';

interface ListingCardProps {
    id: string;
    title: string;
    price: number;
    thumbnailUrl?: string;
    condition: string;
    city?: string;
    contentSource?: string;
    storeName?: string;
    createdAt: string;
    favoriteCount?: number;
    viewCount?: number;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'Sıfır', color: 'bg-[var(--neon-green)]/15 text-[var(--neon-green)] border border-[var(--neon-green)]/20' },
    like_new: { label: 'Az Kullanılmış', color: 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/20' },
    used: { label: 'Kullanılmış', color: 'bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/20' },
    fair: { label: 'Yıpranmış', color: 'bg-orange-500/15 text-orange-400 border border-orange-500/20' },
    poor: { label: 'Kötü', color: 'bg-[var(--neon-pink)]/15 text-[var(--neon-pink)] border border-[var(--neon-pink)]/20' },
};

export function ListingCard({
    id, title, price, thumbnailUrl, condition, city,
    contentSource, storeName, createdAt, favoriteCount, viewCount,
}: ListingCardProps) {
    const cond = conditionLabels[condition] || conditionLabels.used;

    return (
        <Link href={`/ilan/${id}`} className="group block">
            <motion.div
                className="neon-card overflow-hidden"
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(107, 0, 255, 0.2), 0 0 60px rgba(0, 240, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-base)] overflow-hidden">
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Package className="w-10 h-10 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1 border border-[var(--neon-purple)]/20">
                        <span className="price price-md font-semibold">{formatPrice(price)}</span>
                    </div>

                    <div className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cond.color}`}>
                        {cond.label}
                    </div>

                    {contentSource && contentSource !== 'user' && (
                        <div className="absolute top-2 right-2">
                            <WatermarkBadge size="sm" />
                        </div>
                    )}

                    <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/5 transition-all active:scale-90 hover:border-[var(--neon-pink)]/30 group/fav"
                        aria-label="Favorilere ekle"
                    >
                        <Heart className="w-4 h-4 text-[var(--color-text-secondary)] group-hover/fav:text-[var(--neon-pink)] group-hover/fav:icon-neon transition-colors" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">{title}</h3>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span>{storeName || city || ''}</span>
                        <span>{formatTimeAgo(createdAt)}</span>
                    </div>

                    {(favoriteCount || viewCount) && (
                        <div className="mt-1 flex gap-3 text-[11px] text-[var(--color-text-muted)]">
                            {viewCount ? <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" strokeWidth={1.5} /> {viewCount}</span> : null}
                            {favoriteCount ? <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" strokeWidth={1.5} /> {favoriteCount}</span> : null}
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
