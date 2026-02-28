'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, Wifi, WifiOff, Clock, Trophy, Gavel } from 'lucide-react';
import { useAuction, formatPrice } from '@/lib/store';
import { auctionsApi, type Bid } from '@/lib/api';
import { getSocket } from '@/lib/ws';
import { CountdownTimer } from './CountdownTimer';

interface AuctionRoomProps {
    auctionId: string;
    userId?: string;
}

export function AuctionRoom({ auctionId, userId }: AuctionRoomProps) {
    const { activeAuction, bids, isConnected, setAuction, addBid, updatePrice, setConnected, reset } = useAuction();
    const [bidAmount, setBidAmount] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [lastBidFlash, setLastBidFlash] = useState(false);

    useEffect(() => {
        auctionsApi.list().then(auctions => {
            const found = auctions.find(a => a.id === auctionId);
            if (found) setAuction(found);
        }).catch(console.error);
        return () => reset();
    }, [auctionId, setAuction, reset]);

    useEffect(() => {
        const socket = getSocket();
        socket.joinAuction(auctionId, userId);

        const unsubConnected = socket.on('connected', () => setConnected(true));
        const unsubDisconnected = socket.on('disconnected', () => setConnected(false));

        const unsubBid = socket.on('new_bid', (data) => {
            addBid(data.bid as Bid);
            updatePrice(data.currentPrice as number, data.endsAt as string);
            setLastBidFlash(true);
            setTimeout(() => setLastBidFlash(false), 600);
        });

        const unsubEnd = socket.on('auction_ended', () => {
            setShowConfetti(true);
        });

        return () => {
            unsubConnected();
            unsubDisconnected();
            unsubBid();
            unsubEnd();
            socket.leaveAuction();
        };
    }, [auctionId, userId, addBid, updatePrice, setConnected]);

    const placeBid = useCallback(async (amount?: number) => {
        const finalAmount = amount || parseFloat(bidAmount);
        if (!finalAmount || !activeAuction) return;
        try {
            await auctionsApi.bid(auctionId, finalAmount);
            setBidAmount('');
        } catch (err) { console.error('Bid failed:', err); }
    }, [auctionId, bidAmount, activeAuction]);

    if (!activeAuction) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-3 w-3 rounded-full bg-[var(--neon-purple)]" style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                </div>
            </div>
        );
    }

    const currentPrice = activeAuction.current_price;
    const quickBids = [
        { label: '+100 ₺', amount: currentPrice + 100 },
        { label: '+500 ₺', amount: currentPrice + 500 },
        { label: '+1K ₺', amount: currentPrice + 1000 },
    ];

    return (
        <div className="flex flex-col h-full relative overflow-hidden retro-grid">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#6B00FF]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-[#FF2D78]/8 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <div className="glass border-b border-[var(--neon-purple)]/10 p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="live-badge rounded-full px-2.5 py-1 text-xs font-bold font-retro inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--neon-pink)] animate-live-dot" />
                        CANLI MEZAT
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-retro">
                        {isConnected
                            ? <><Wifi className="w-3 h-3 icon-green icon-neon" strokeWidth={2} /> BAĞLI</>
                            : <><WifiOff className="w-3 h-3 text-[var(--color-accent-error)]" strokeWidth={2} /> BAĞLANIYOR...</>
                        }
                    </div>
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{activeAuction.listings?.title || 'Mezat'}</h2>
            </div>

            {/* Price Display */}
            <motion.div
                className="text-center py-8 relative z-10"
                style={{ animation: lastBidFlash ? 'bid-flash 0.6s ease-out' : undefined }}
            >
                <div className="text-xs text-[var(--color-text-muted)] mb-2 font-retro flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    GÜNCEL TEKLİF
                </div>
                <motion.div
                    className="price text-4xl font-[900]"
                    style={{ fontFamily: 'var(--font-display)', filter: 'drop-shadow(0 0 20px rgba(107, 0, 255, 0.5))' }}
                    key={currentPrice}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    {formatPrice(currentPrice)}
                </motion.div>
                <div className="mt-3">
                    <CountdownTimer endsAt={activeAuction.ends_at} />
                </div>
            </motion.div>

            {/* Bid History */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 relative z-10">
                <AnimatePresence>
                    {bids.map((bid) => (
                        <motion.div
                            key={bid.id}
                            className="neon-card p-3 flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <span className="text-xs text-[var(--color-text-muted)] font-retro">{bid.bidder_id?.slice(0, 8) || 'ANONIM'}</span>
                            <span className="price price-md">{formatPrice(bid.amount)}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Bid Controls */}
            <div className="glass border-t border-[var(--neon-purple)]/10 p-4 pb-safe relative z-10">
                <div className="flex gap-2 mb-3">
                    {quickBids.map((qb) => (
                        <motion.button
                            key={qb.label}
                            onClick={() => placeBid(qb.amount)}
                            className="flex-1 neon-btn-cyan rounded-xl py-2.5 text-xs font-bold font-retro text-white vhs-glitch"
                            whileTap={{ scale: 0.93 }}
                        >
                            {qb.label}
                        </motion.button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 rounded-xl bg-[var(--color-surface-base)] border border-[var(--neon-purple)]/15 px-4 py-2.5 focus-within:border-[var(--neon-cyan)]/40 focus-within:shadow-[0_0_16px_rgba(0,240,255,0.1)] transition-all">
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="Teklif tutarı ₺"
                            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none price font-retro"
                        />
                    </div>
                    <motion.button
                        onClick={() => placeBid()}
                        className="neon-btn rounded-xl px-5 text-sm font-bold text-white flex items-center gap-1.5"
                        whileTap={{ scale: 0.93 }}
                    >
                        <Gavel className="w-4 h-4" strokeWidth={2} />
                        <span className="font-retro">TEKLİF</span>
                    </motion.button>
                </div>
            </div>

            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                            <Trophy className="w-16 h-16 mx-auto text-[var(--neon-orange)] icon-neon mb-4" strokeWidth={1} />
                            <h2 className="text-2xl font-bold neon-text font-retro" style={{ fontFamily: 'var(--font-display)' }}>MEZAT BİTTİ!</h2>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-2">Kazanan belirlendi</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
