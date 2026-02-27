/**
 * ClawPazar — Supabase Data Layer
 */
import { createHash } from 'crypto';
import { supabase } from '../config.js';
import type { ListingRow, AuctionRow } from '../types.js';

export class DataLayer {
    async getListings(opts: { limit?: number; category?: string; status?: string } = {}): Promise<ListingRow[]> {
        if (!supabase) return [];
        let query = supabase
            .from('listings')
            .select('id, title, price, condition, status, city, images, view_count, created_at, categories(name_tr, icon), vendors(store_name)')
            .eq('status', opts.status || 'active')
            .order('created_at', { ascending: false })
            .limit(opts.limit || 5);
        if (opts.category) query = query.eq('categories.slug', opts.category);
        const { data, error } = await query;
        if (error) { console.error('DB listings:', error.message); return []; }
        return (data || []) as ListingRow[];
    }

    async getAuctions(opts: { limit?: number; status?: string } = {}): Promise<AuctionRow[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('auctions')
            .select('id, starting_price, current_price, bid_count, status, ends_at, listings(title, images)')
            .eq('status', opts.status || 'active')
            .order('ends_at', { ascending: true })
            .limit(opts.limit || 5);
        if (error) { console.error('DB auctions:', error.message); return []; }
        return (data || []) as AuctionRow[];
    }

    async createListing(data: {
        title: string; description: string; price: number;
        condition: string; city?: string; category_slug?: string;
        images?: any[]; source_channel?: string; content_source?: string;
        telegram_user_id?: number;
    }): Promise<{ id: string } | null> {
        if (!supabase) return null;
        const vendorId = await this.getOrCreateTelegramVendor(data.telegram_user_id || 0);
        if (!vendorId) return null;

        let categoryId: string | null = null;
        if (data.category_slug) {
            const { data: cat } = await supabase
                .from('categories').select('id').eq('slug', data.category_slug).single();
            if (cat) categoryId = cat.id;
        }

        const { data: listing, error } = await supabase
            .from('listings')
            .insert({
                vendor_id: vendorId,
                category_id: categoryId,
                title: data.title,
                description: data.description,
                price: data.price,
                condition: data.condition || 'used',
                city: data.city,
                images: data.images || [],
                source_channel: data.source_channel || 'telegram',
                content_source: data.content_source || 'user',
                status: data.price > 10000 ? 'pending_review' : 'active',
            })
            .select('id')
            .single();
        if (error) { console.error('DB create listing:', error.message); return null; }
        return listing;
    }

    async search(query: string, limit = 5): Promise<ListingRow[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('listings')
            .select('id, title, price, condition, status, city, images, view_count, created_at, categories(name_tr, icon), vendors(store_name)')
            .eq('status', 'active')
            .textSearch('search_text', query.split(' ').join(' & '))
            .limit(limit);
        if (error) { console.error('DB search:', error.message); return []; }
        return (data || []) as ListingRow[];
    }

    async getDashboard(): Promise<{ listings: number; auctions: number; categories: number }> {
        if (!supabase) return { listings: 0, auctions: 0, categories: 0 };
        const [l, a, c] = await Promise.all([
            supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
        ]);
        return { listings: l.count || 0, auctions: a.count || 0, categories: c.count || 0 };
    }

    private async getOrCreateTelegramVendor(telegramUserId: number): Promise<string | null> {
        if (!supabase) return null;
        const { data: existing } = await supabase
            .from('vendors')
            .select('id')
            .eq('store_slug', `tg-${telegramUserId}`)
            .single();
        if (existing) return existing.id;

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('metadata->>telegram_id', String(telegramUserId))
            .single();

        let userId: string;
        if (user) {
            userId = user.id;
        } else {
            const { data: newUser, error: userErr } = await supabase
                .from('users')
                .insert({
                    supabase_auth_id: createHash('sha256').update(`tg-${telegramUserId}`).digest('hex').slice(0, 36),
                    display_name: `Telegram #${telegramUserId}`,
                    preferred_channel: 'telegram',
                    metadata: { telegram_id: telegramUserId },
                })
                .select('id')
                .single();
            if (userErr || !newUser) { console.error('DB create user:', userErr?.message); return null; }
            userId = newUser.id;
        }

        const { data: vendor, error: vendorErr } = await supabase
            .from('vendors')
            .insert({
                user_id: userId,
                store_name: `TG Satıcı #${telegramUserId}`,
                store_slug: `tg-${telegramUserId}`,
                status: 'active',
            })
            .select('id')
            .single();
        if (vendorErr || !vendor) { console.error('DB create vendor:', vendorErr?.message); return null; }
        return vendor.id;
    }
}

export const db = new DataLayer();

export function formatListing(l: ListingRow, idx: number): string {
    const cat = l.categories;
    const emoji = cat?.icon || '📦';
    const price = l.price.toLocaleString('tr-TR');
    const cond: Record<string, string> = { new: '✨', like_new: '👍', used: '👌', fair: '🙏', poor: '🔧' };
    return `${idx}. ${emoji} *${l.title}*\n   ${cond[l.condition] || '📦'} ${l.condition} • ${price} ₺ • 👁️ ${l.view_count}`;
}

export function formatAuction(a: AuctionRow, idx: number): string {
    const title = a.listings?.title || 'Ürün';
    const current = (a.current_price || a.starting_price).toLocaleString('tr-TR');
    const ends = new Date(a.ends_at);
    const remaining = Math.max(0, Math.floor((ends.getTime() - Date.now()) / 60000));
    return `${idx}. 🔴 *${title}*\n   💰 ${current} ₺ • 🏷️ ${a.bid_count} teklif • ⏰ ${remaining}dk kaldı`;
}
