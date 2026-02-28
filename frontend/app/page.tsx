'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, ArrowRight, Eye, Heart, Smartphone, ShoppingBag, Gamepad2, Watch, Gem, Car, Theater, Home, Bot, Sparkles, TrendingUp, Gavel } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';

const trendingItems = [
    { id: '1', title: 'iPhone 15 Pro Max', price: '28.500', icon: Smartphone, category: 'Elektronik' },
    { id: '2', title: 'Nike Air Jordan 1', price: '4.200', icon: ShoppingBag, category: 'Moda' },
    { id: '3', title: 'PlayStation 5', price: '18.900', icon: Gamepad2, category: 'Elektronik' },
    { id: '4', title: 'Vintage Saat', price: '6.750', icon: Watch, category: 'Aksesuar' },
];

const liveAuctions = [
    { id: 'a1', title: 'MacBook Pro M3', currentPrice: '45.200', bidCount: 12, endsIn: '2s 14dk' },
    { id: 'a2', title: 'Antika Vazo', currentPrice: '3.800', bidCount: 7, endsIn: '45dk' },
    { id: 'a3', title: 'Koleksiyon Kart', currentPrice: '1.200', bidCount: 23, endsIn: '5dk' },
];

const categories = [
    { name: 'Elektronik', icon: Smartphone, color: 'from-[#6B00FF]/20 to-[#00F0FF]/10' },
    { name: 'Moda', icon: ShoppingBag, color: 'from-[#FF2D78]/20 to-[#6B00FF]/10' },
    { name: 'Ev & Yaşam', icon: Home, color: 'from-[#00FF88]/20 to-[#00F0FF]/10' },
    { name: 'Aksesuar', icon: Gem, color: 'from-[#FFB800]/20 to-[#FF2D78]/10' },
    { name: 'Koleksiyon', icon: Theater, color: 'from-[#6B00FF]/20 to-[#F038FF]/10' },
    { name: 'Araç', icon: Car, color: 'from-[#00F0FF]/20 to-[#00FF88]/10' },
];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function HomePage() {
    return (
        <div className="pb-24">
            {/* ═══════ HERO + RETRO GRID ═══════ */}
            <motion.section
                className="relative px-5 pt-14 pb-10 overflow-hidden retro-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Neon glow orbs */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#6B00FF]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-20 right-0 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-40 left-0 w-32 h-32 bg-[#F038FF]/10 rounded-full blur-[60px] pointer-events-none" />

                {/* Retro label */}
                <motion.div
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--neon-purple)]/30 bg-[var(--neon-purple)]/5 px-3 py-1 mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Sparkles className="w-3 h-3 icon-purple icon-neon" />
                    <span className="text-[10px] font-retro text-[var(--neon-purple)]">AI-Powered Marketplace</span>
                </motion.div>

                <motion.h1
                    className="text-5xl font-[900] leading-[1.05] tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                >
                    <span className="neon-text-hot">SAT, AI, KAZAN</span>
                    <br />
                    <span className="text-[var(--color-text-primary)]">30 Saniyede İlan</span>
                </motion.h1>

                <motion.p
                    className="mt-4 text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-[300px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    AI ajanına anlat, ilanını oluştursun. Canlı mezat, otomatik pazarlık, güvenli ödeme.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex gap-3 mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <Link
                        href="/sohbet"
                        className="neon-btn rounded-full px-6 py-3 text-sm font-semibold text-white flex items-center gap-2 vhs-glitch"
                    >
                        <Mic className="w-5 h-5 icon-neon" />
                        Hemen Başla
                    </Link>
                    <Link
                        href="/kesfet"
                        className="rounded-full px-5 py-3 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-text-muted)]/30 hover:border-[var(--neon-cyan)]/40 transition-colors flex items-center gap-1.5"
                    >
                        Keşfet <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Stats — retro mono */}
                <motion.div
                    className="flex gap-6 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                >
                    {[
                        { value: '12K+', label: 'Aktif İlan' },
                        { value: '1.2K', label: 'Canlı Mezat' },
                        { value: '50K+', label: 'Kullanıcı' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-xl font-bold neon-text font-retro">{stat.value}</div>
                            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </motion.section>

            {/* ═══════ CANLI MEZATLAR ═══════ */}
            <section className="px-5 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[var(--neon-pink)] animate-live-dot" />
                        <Gavel className="w-4 h-4 icon-pink icon-neon" />
                        <span>Canlı Mezatlar</span>
                    </h2>
                    <Link href="/mezat" className="text-xs text-[var(--neon-cyan)] hover:underline flex items-center gap-1">
                        Tümünü Gör <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <motion.div
                    className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    {liveAuctions.map((auction) => (
                        <motion.div key={auction.id} variants={fadeUp}>
                            <Link href={`/mezat/${auction.id}`} className="block min-w-[200px]">
                                <div className="neon-card p-4 relative overflow-hidden">
                                    <div className="live-badge rounded-full px-2 py-0.5 text-[10px] font-bold font-retro inline-flex items-center gap-1 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-pink)] animate-live-dot" />
                                        CANLI
                                    </div>

                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] font-retro">{auction.endsIn}</span>
                                    </div>

                                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">{auction.title}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="price price-lg">{auction.currentPrice} ₺</span>
                                    </div>
                                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">{auction.bidCount} teklif</div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ═══════ TREND İLANLAR ═══════ */}
            <section className="px-5 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 icon-cyan icon-neon" />
                        Trend İlanlar
                    </h2>
                    <Link href="/kesfet" className="text-xs text-[var(--neon-cyan)] hover:underline flex items-center gap-1">
                        Keşfet <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <motion.div
                    className="grid grid-cols-2 gap-3"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    {trendingItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                            <motion.div key={item.id} variants={fadeUp}>
                                <Link href={`/ilan/${item.id}`} className="block">
                                    <div className="neon-card overflow-hidden group">
                                        <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-base)] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                            <ItemIcon className="w-10 h-10 text-[var(--color-text-muted)] icon-neon group-hover:text-[var(--neon-cyan)] transition-colors" strokeWidth={1} />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{item.title}</h3>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="price price-md">{item.price} ₺</span>
                                                <span className="text-[10px] text-[var(--color-text-muted)]">{item.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* ═══════ KATEGORİLER ═══════ */}
            <section className="px-5 mt-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 icon-purple icon-neon" />
                    Kategoriler
                </h2>
                <div className="grid grid-cols-3 gap-2.5">
                    {categories.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                            <Link key={cat.name} href={`/kesfet?category=${cat.name}`}>
                                <div className={`neon-card p-3 text-center bg-gradient-to-br ${cat.color} vhs-glitch`}>
                                    <CatIcon className="w-6 h-6 mx-auto mb-1 icon-neon text-[var(--color-text-secondary)]" strokeWidth={1.5} />
                                    <div className="text-[11px] font-medium text-[var(--color-text-secondary)]">{cat.name}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ═══════ AI CTA ═══════ */}
            <section className="px-5 mt-8 mb-4">
                <Link href="/sohbet">
                    <motion.div
                        className="neon-card neon-border p-4 flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] animate-glow-ring scanline-overlay">
                            <Bot className="w-6 h-6 text-white icon-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Sesli Mesajla İlan Oluştur</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Ürünü anlat, fotoğraf çek, gerisini ajana bırak</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--neon-cyan)] icon-neon shrink-0" />
                    </motion.div>
                </Link>
            </section>

            <BottomNav />
        </div>
    );
}
