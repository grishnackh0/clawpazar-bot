'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Smartphone, ShoppingBag, Home, Gem, Theater, ArrowUpDown, MapPin, Package, Loader2, RefreshCw } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ListingCard } from '@/components/ListingCard';
import { listingsApi, type Listing } from '@/lib/api';
import { filterListings, mockListings } from '@/lib/mock-data';

const categories = [
    { id: 'all', label: 'Tümü', icon: Gem },
    { id: 'elektronik', label: 'Elektronik', icon: Smartphone },
    { id: 'moda', label: 'Moda', icon: ShoppingBag },
    { id: 'ev', label: 'Ev & Yaşam', icon: Home },
    { id: 'aksesuar', label: 'Aksesuar', icon: Gem },
    { id: 'koleksiyon', label: 'Koleksiyon', icon: Theater },
];

export default function KesfetPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'cheapest' | 'expensive'>('newest');
    const [apiListings, setApiListings] = useState<Listing[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    // Try real API first, fallback to mock
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        listingsApi.browse({
            category: activeCategory === 'all' ? undefined : activeCategory,
            search: searchQuery || undefined,
            sort: sortBy === 'cheapest' ? 'price_asc' : sortBy === 'expensive' ? 'price_desc' : 'newest',
        })
            .then((res) => {
                if (!cancelled) {
                    setApiListings(res.listings);
                    setIsOffline(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setApiListings(null);
                    setIsOffline(true);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [activeCategory, searchQuery, sortBy]);

    // Use API data if available, otherwise mock
    const listings = useMemo(() => {
        if (apiListings) return apiListings;

        let results = filterListings({ category: activeCategory, search: searchQuery });
        switch (sortBy) {
            case 'cheapest': results.sort((a, b) => a.price - b.price); break;
            case 'expensive': results.sort((a, b) => b.price - a.price); break;
            default: results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return results;
    }, [apiListings, activeCategory, searchQuery, sortBy]);

    const sortLabels = { newest: 'En Yeni', cheapest: 'En Ucuz', expensive: 'En Pahalı' };
    const nextSort = () => {
        const order: Array<'newest' | 'cheapest' | 'expensive'> = ['newest', 'cheapest', 'expensive'];
        setSortBy(order[(order.indexOf(sortBy) + 1) % order.length]);
    };

    return (
        <div className="pb-24 min-h-dvh">
            <div className="px-5 pt-6 pb-4">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Search className="w-5 h-5 icon-cyan icon-neon" strokeWidth={2} />
                    Keşfet
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1.5">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : `${listings.length} ilan`}
                    {isOffline && (
                        <span className="text-[var(--neon-orange)] font-retro text-[10px] ml-1">OFFLINE</span>
                    )}
                </p>
            </div>

            {/* Search */}
            <div className="px-5 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="iPhone, ayakkabı, PS5..."
                        className="w-full rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-5 py-3.5 pl-11 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--neon-cyan)]/40 focus:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[var(--neon-purple)]/10 transition-colors">
                        <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--neon-cyan)]" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
                {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${activeCategory === cat.id
                                ? 'neon-btn text-white shadow-[0_0_12px_rgba(107,0,255,0.3)]'
                                : 'bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 text-[var(--color-text-secondary)] hover:border-[var(--neon-cyan)]/30'
                                }`}
                        >
                            <CatIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-5 mb-5">
                <button className="flex items-center gap-1.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:border-[var(--neon-cyan)]/30 transition-colors">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Tüm Şehirler
                </button>
                <button
                    onClick={nextSort}
                    className="flex-1 flex items-center gap-1.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--neon-purple)]/15 px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:border-[var(--neon-cyan)]/30 transition-colors"
                >
                    <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {sortLabels[sortBy]}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--neon-cyan)]" />
                </div>
            )}

            {/* Listings Grid */}
            {!loading && listings.length > 0 && (
                <motion.div
                    className="grid grid-cols-2 gap-3 px-5"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                >
                    {listings.map((listing) => (
                        <motion.div key={listing.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                            <ListingCard
                                id={listing.id}
                                title={listing.title}
                                price={listing.price}
                                thumbnailUrl={listing.thumbnail_url || undefined}
                                condition={listing.condition}
                                city={listing.city}
                                contentSource={listing.content_source}
                                storeName={listing.vendors?.store_name}
                                createdAt={listing.created_at}
                                favoriteCount={listing.favorite_count}
                                viewCount={listing.view_count}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Empty state */}
            {!loading && listings.length === 0 && (
                <motion.div className="text-center py-16 px-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)]/20 mb-4">
                        <Package className="w-7 h-7 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Sonuç bulunamadı</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Farklı bir arama veya kategori deneyin</p>
                </motion.div>
            )}

            <BottomNav />
        </div>
    );
}
