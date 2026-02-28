/**
 * ClawPazar — Trust Engine, Delegation, Collusion, KVKK, Memory, Protocol
 * V2: Async Supabase persistence (no writeFileSync)
 */
import type {
    AgentType, AgentMessage, UserProfile, TrustProfile,
    PermissionMode, TrustAction, ConsentType, ConsentRecord, PriceRecord,
} from '../types.js';
import { supabase } from '../config.js';
import { eventStore } from '../core/event-store.js';

// ═══════════════════════════════════════════════════════════════
// INTENT MEMORY — Supabase async (no writeFileSync)
// ═══════════════════════════════════════════════════════════════

export class IntentMemory {
    private profiles = new Map<number, UserProfile>();

    constructor() {
        this.loadFromDB().catch(() => { });
    }

    get(userId: number): UserProfile {
        if (!this.profiles.has(userId)) {
            this.profiles.set(userId, {
                preferredCategories: {},
                priceRange: { min: 0, max: 100000 },
                city: '',
                interests: [],
                totalInteractions: 0,
                lastSeen: Date.now(),
                buyerScore: 0.5,
                sellerScore: 0.5,
            });
        }
        const p = this.profiles.get(userId)!;
        p.totalInteractions++;
        p.lastSeen = Date.now();
        return p;
    }

    learn(userId: number, signal: {
        category?: string;
        price?: number;
        city?: string;
        intent?: 'buy' | 'sell';
        interest?: string;
    }) {
        if (!kvkkManager.hasConsent(userId)) return;
        const p = this.get(userId);

        if (signal.category) {
            p.preferredCategories[signal.category] = (p.preferredCategories[signal.category] || 0) + 1;
        }
        if (signal.price) {
            p.priceRange.min = Math.min(p.priceRange.min || signal.price, signal.price);
            p.priceRange.max = Math.max(p.priceRange.max || signal.price, signal.price);
        }
        if (signal.city) p.city = signal.city;
        if (signal.interest && !p.interests.includes(signal.interest)) {
            p.interests.push(signal.interest);
            if (p.interests.length > 10) p.interests.shift();
        }
        if (signal.intent === 'buy') {
            p.buyerScore = Math.min(1, p.buyerScore + 0.1);
            p.sellerScore = Math.max(0, p.sellerScore - 0.05);
        }
        if (signal.intent === 'sell') {
            p.sellerScore = Math.min(1, p.sellerScore + 0.1);
            p.buyerScore = Math.max(0, p.buyerScore - 0.05);
        }

        // Async persist every 5 interactions
        if (p.totalInteractions % 5 === 0) this.saveToDB(userId, p);
    }

    summarize(userId: number): string {
        const p = this.get(userId);
        const topCats = Object.entries(p.preferredCategories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([c]) => c);

        let summary = '';
        if (topCats.length) summary += `Favori kategoriler: ${topCats.join(', ')}. `;
        if (p.city) summary += `Şehir: ${p.city}. `;
        if (p.priceRange.max > 0 && p.priceRange.max < 100000) summary += `Bütçe aralığı: ${p.priceRange.min}-${p.priceRange.max}₺. `;
        if (p.interests.length) summary += `İlgi alanları: ${p.interests.join(', ')}. `;
        if (p.buyerScore > 0.7) summary += 'Ağırlıklı alıcı profili. ';
        if (p.sellerScore > 0.7) summary += 'Ağırlıklı satıcı profili. ';
        return summary || 'Yeni kullanıcı.';
    }

    private async saveToDB(userId: number, p: UserProfile) {
        if (!supabase) return;
        await supabase.from('user_memory').upsert({
            user_id: userId,
            preferred_categories: p.preferredCategories,
            price_range_min: p.priceRange.min,
            price_range_max: p.priceRange.max,
            city: p.city,
            interests: p.interests,
            total_interactions: p.totalInteractions,
            last_seen: p.lastSeen,
            buyer_score: p.buyerScore,
            seller_score: p.sellerScore,
            updated_at: new Date().toISOString(),
        }).then(({ error }) => {
            if (error) console.error('[IntentMemory] DB save error:', error.message);
        });
    }

    private async loadFromDB() {
        if (!supabase) return;
        const { data, error } = await supabase.from('user_memory').select('*');
        if (error || !data) return;
        for (const row of data) {
            this.profiles.set(row.user_id, {
                preferredCategories: row.preferred_categories || {},
                priceRange: { min: row.price_range_min || 0, max: row.price_range_max || 100000 },
                city: row.city || '',
                interests: row.interests || [],
                totalInteractions: row.total_interactions || 0,
                lastSeen: row.last_seen || Date.now(),
                buyerScore: row.buyer_score || 0.5,
                sellerScore: row.seller_score || 0.5,
            });
        }
        console.log(`[IntentMemory] Loaded ${data.length} profiles from Supabase`);
    }
}

// ═══════════════════════════════════════════════════════════════
// AGENT NEGOTIATION PROTOCOL
// ═══════════════════════════════════════════════════════════════

export class AgentProtocol {
    private messageLog: AgentMessage[] = [];

    send(from: AgentType, to: AgentType, type: AgentMessage['type'], payload: Record<string, any>) {
        const msg: AgentMessage = { from, to, type, payload, ts: Date.now() };
        this.messageLog.push(msg);
        if (this.messageLog.length > 200) this.messageLog.splice(0, 100);
        return msg;
    }

    getPending(agent: AgentType): AgentMessage[] {
        return this.messageLog.filter(m => m.to === agent && m.type === 'request');
    }

    getCoordinationContext(agent: AgentType, userId: number): string {
        const recent = this.messageLog
            .filter(m => (m.from === agent || m.to === agent))
            .slice(-5);

        if (recent.length === 0) return '';

        return '\n[AJAN KOORDİNASYONU]\n' + recent.map(m =>
            `${m.from}→${m.to}: ${JSON.stringify(m.payload)}`
        ).join('\n');
    }
}

// ═══════════════════════════════════════════════════════════════
// BAYESIAN TRUST + DELEGATION MATRIX — Supabase async
// ═══════════════════════════════════════════════════════════════

const TRUST_DECAY = 0.7;
const TRUST_BOOST = 1.02;
const TRUST_MIN = 0.01;
const TRUST_MAX = 1.0;

export { TRUST_DECAY, TRUST_BOOST, TRUST_MIN, TRUST_MAX };

export class DelegationMatrix {
    getPermission(trustScore: number, action: TrustAction): PermissionMode {
        if (trustScore >= 0.5) return 'autonomous';
        if (trustScore >= 0.3) {
            if (action === 'create_listing' || action === 'open_auction') return 'denied';
            return 'human_approved';
        }
        if (action === 'buy_now') return 'human_approved';
        return 'denied';
    }

    getTrustLevel(score: number): { emoji: string; label: string } {
        if (score >= 0.8) return { emoji: '🟢', label: 'Güvenilir Satıcı' };
        if (score >= 0.5) return { emoji: '🟡', label: 'Normal' };
        if (score >= 0.3) return { emoji: '🟠', label: 'Dikkatli' };
        return { emoji: '🔴', label: 'Kısıtlı' };
    }
}

export class TrustEngine {
    private profiles = new Map<number, TrustProfile>();
    private delegation = new DelegationMatrix();

    constructor() {
        this.loadFromDB().catch(() => { });
    }

    get(userId: number): TrustProfile {
        if (!this.profiles.has(userId)) {
            this.profiles.set(userId, { score: TRUST_MAX, overrides: 0, successes: 0, lastUpdate: Date.now() });
        }
        return this.profiles.get(userId)!;
    }

    recordSuccess(userId: number): TrustProfile {
        const p = this.get(userId);
        p.score = Math.min(TRUST_MAX, p.score * TRUST_BOOST);
        p.successes++;
        p.lastUpdate = Date.now();
        this.saveToDB(userId, p);
        return p;
    }

    recordOverride(userId: number): TrustProfile {
        const p = this.get(userId);
        p.score = Math.max(TRUST_MIN, p.score * TRUST_DECAY);
        p.overrides++;
        p.lastUpdate = Date.now();
        eventStore.append('trust_override', userId, { newScore: p.score, overrides: p.overrides });
        this.saveToDB(userId, p);
        return p;
    }

    canAct(userId: number, action: TrustAction): { allowed: boolean; mode: PermissionMode; reason?: string } {
        const p = this.get(userId);
        const mode = this.delegation.getPermission(p.score, action);
        if (mode === 'denied') return { allowed: false, mode, reason: `Güven skorun (${Math.round(p.score * 100)}%) bu işlem için yetersiz.` };
        return { allowed: true, mode };
    }

    getLevel(userId: number) { return this.delegation.getTrustLevel(this.get(userId).score); }

    summarize(userId: number): string {
        const p = this.get(userId);
        const level = this.getLevel(userId);
        return `${level.emoji} ${level.label} — Güven: %${Math.round(p.score * 100)} | ✅ ${p.successes} başarı | ⚠️ ${p.overrides} uyarı`;
    }

    private async saveToDB(userId: number, p: TrustProfile) {
        if (!supabase) return;
        await supabase.from('trust_scores').upsert({
            user_id: userId,
            score: p.score,
            overrides: p.overrides,
            successes: p.successes,
            last_update: p.lastUpdate,
            updated_at: new Date().toISOString(),
        }).then(({ error }) => {
            if (error) console.error('[TrustEngine] DB save error:', error.message);
        });
    }

    private async loadFromDB() {
        if (!supabase) return;
        const { data, error } = await supabase.from('trust_scores').select('*');
        if (error || !data) return;
        for (const row of data) {
            this.profiles.set(row.user_id, {
                score: row.score, overrides: row.overrides,
                successes: row.successes, lastUpdate: row.last_update,
            });
        }
        console.log(`[TrustEngine] Loaded ${data.length} profiles from Supabase`);
    }
}

// ═══════════════════════════════════════════════════════════════
// ANTI-COLLUSION ENGINE
// ═══════════════════════════════════════════════════════════════

export class CollusionDetector {
    private priceLog = new Map<string, PriceRecord[]>();

    recordPrice(userId: number, category: string, price: number) {
        if (!this.priceLog.has(category)) this.priceLog.set(category, []);
        const records = this.priceLog.get(category)!;
        records.push({ userId, price, ts: Date.now() });
        if (records.length > 200) records.splice(0, 100);
    }

    analyze(category: string): { score: number; flags: string[] } {
        const records = this.priceLog.get(category);
        if (!records || records.length < 3) return { score: 0, flags: [] };

        const flags: string[] = [];
        const recent = records.filter(r => Date.now() - r.ts < 3600_000);

        if (recent.length >= 3) {
            const prices = recent.map(r => r.price);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
            const variance = prices.reduce((a, b) => a + (b - avg) ** 2, 0) / prices.length;
            const cv = Math.sqrt(variance) / (avg || 1);
            if (cv < 0.05 && recent.length >= 4) flags.push(`Fiyat varyansı çok düşük (CV: ${(cv * 100).toFixed(1)}%)`);
        }

        const uniqueSellers = new Set(recent.map(r => r.userId));
        if (uniqueSellers.size >= 3) {
            const sorted = recent.map(r => r.ts).sort();
            for (let i = 0; i < sorted.length - 2; i++) {
                if (sorted[i + 2] - sorted[i] < 60_000) {
                    flags.push('3+ ilan 60 saniye içinde');
                    break;
                }
            }
        }

        if (recent.length >= 5) {
            const allPrices = records.map(r => r.price);
            const historicAvg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
            const recentAvg = recent.map(r => r.price).reduce((a, b) => a + b, 0) / recent.length;
            if (recentAvg > historicAvg * 1.3) flags.push(`Fiyat ortalamanın %${Math.round((recentAvg / historicAvg - 1) * 100)} üstünde`);
        }

        const score = Math.min(1, flags.length * 0.35);

        if (score > 0.7) {
            eventStore.append('collusion_alert', 0, { category, score, flags });
        }

        return { score, flags };
    }

    getContext(category: string): string {
        const analysis = this.analyze(category);
        if (analysis.score < 0.3) return '';
        return `\n[COLLUSION UYARISI] Risk: %${Math.round(analysis.score * 100)}: ${analysis.flags.join(', ')}`;
    }
}

// ═══════════════════════════════════════════════════════════════
// KVKK COMPLIANCE MODULE — Supabase async
// ═══════════════════════════════════════════════════════════════

export class KVKKManager {
    private consents = new Map<number, ConsentRecord>();

    constructor() {
        this.loadFromDB().catch(() => { });
    }

    hasConsent(userId: number): boolean {
        return this.consents.has(userId) && this.consents.get(userId)!.types.length > 0;
    }

    hasSpecificConsent(userId: number, type: ConsentType): boolean {
        const c = this.consents.get(userId);
        return c ? c.types.includes(type) : false;
    }

    grantConsent(userId: number, types: ConsentType[] = ['profile', 'location', 'purchase_history']) {
        this.consents.set(userId, { types, grantedAt: Date.now(), version: '1.0' });
        eventStore.append('kvkk_consent_granted', userId, { types });
        this.saveToDB(userId);
    }

    revokeConsent(userId: number) {
        this.consents.delete(userId);
        eventStore.append('kvkk_consent_revoked', userId, {});
        if (supabase) supabase.from('kvkk_consents').delete().eq('user_id', userId).then(() => { });
    }

    getUserData(userId: number): Record<string, any> {
        const profile = memory.get(userId);
        const events = eventStore.query(userId, undefined, 20);
        const trust = trustEngine.get(userId);
        return {
            profil: profile,
            guven: trust,
            eventSayisi: events.length,
            sonEventler: events.slice(-5).map(e => ({ tip: e.type, tarih: new Date(e.ts).toLocaleString('tr-TR') })),
        };
    }

    deleteUserData(userId: number) {
        memory.get(userId).preferredCategories = {};
        memory.get(userId).interests = [];
        memory.get(userId).city = '';
        memory.get(userId).priceRange = { min: 0, max: 100000 };
        this.revokeConsent(userId);
        eventStore.append('kvkk_data_deleted', userId, {});
    }

    getConsentSummary(userId: number): string {
        const c = this.consents.get(userId);
        if (!c) return '❌ KVKK onayı yok. Veri toplanmıyor.';
        const typeLabels: Record<ConsentType, string> = {
            profile: '👤 Profil', location: '📍 Konum', purchase_history: '🛒 Alışveriş'
        };
        const types = c.types.map(t => typeLabels[t]).join(', ');
        return `✅ KVKK Onayı\nTarih: ${new Date(c.grantedAt).toLocaleString('tr-TR')}\nVersiyon: ${c.version}\nKapsam: ${types}`;
    }

    private async saveToDB(userId: number) {
        if (!supabase) return;
        const c = this.consents.get(userId);
        if (!c) return;
        await supabase.from('kvkk_consents').upsert({
            user_id: userId,
            types: c.types,
            granted_at: c.grantedAt,
            version: c.version,
            updated_at: new Date().toISOString(),
        }).then(({ error }) => {
            if (error) console.error('[KVKK] DB save error:', error.message);
        });
    }

    private async loadFromDB() {
        if (!supabase) return;
        const { data, error } = await supabase.from('kvkk_consents').select('*');
        if (error || !data) return;
        for (const row of data) {
            this.consents.set(row.user_id, {
                types: row.types || [],
                grantedAt: row.granted_at || Date.now(),
                version: row.version || '1.0',
            });
        }
        console.log(`[KVKK] Loaded ${data.length} consents from Supabase`);
    }
}

// ── Singletons ──
export const memory = new IntentMemory();
export const protocol = new AgentProtocol();
export const trustEngine = new TrustEngine();
export const collusionDetector = new CollusionDetector();
export const kvkkManager = new KVKKManager();
