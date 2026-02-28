'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { AuctionRoom } from '@/components/AuctionRoom';

export default function LiveAuctionPage() {
    const params = useParams();
    const auctionId = params?.id as string;
    const { userId } = useAuth();

    return (
        <div className="flex flex-col h-dvh">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-white/5 glass">
                <Link
                    href="/mezat"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] border border-white/5 transition-all active:scale-90"
                >
                    ←
                </Link>
                <h1 className="text-sm font-bold flex-1">🔨 Canlı Mezat</h1>
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-red-400">CANLI</span>
                </div>
            </div>

            {/* Auction Room */}
            <div className="flex-1 overflow-hidden">
                <AuctionRoom
                    auctionId={auctionId}
                    userId={userId || undefined}
                />
            </div>
        </div>
    );
}
