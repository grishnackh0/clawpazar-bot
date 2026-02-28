/**
 * ClawPazar — MerkleTree + EventStore
 * V2: Async Supabase persistence (no writeFileSync)
 */
import { createHash } from 'crypto';
import type { AgentType, Event } from '../types.js';
import { supabase } from '../config.js';

// ═══════════════════════════════════════════════════════════════
// MERKLE TREE (Cryptographic Provenance) — stays in-memory (read-heavy)
// ═══════════════════════════════════════════════════════════════

export class MerkleTree {
    private leaves: string[] = [];
    private layers: string[][] = [];

    private hashPair(a: string, b: string): string {
        return createHash('sha256').update(a + b).digest('hex');
    }

    addLeaf(hash: string) {
        this.leaves.push(hash);
        this.rebuild();
    }

    private rebuild() {
        if (this.leaves.length === 0) { this.layers = []; return; }
        this.layers = [this.leaves.slice()];
        let current = this.leaves.slice();
        while (current.length > 1) {
            const next: string[] = [];
            for (let i = 0; i < current.length; i += 2) {
                const left = current[i];
                const right = current[i + 1] || left;
                next.push(this.hashPair(left, right));
            }
            this.layers.push(next);
            current = next;
        }
    }

    getRoot(): string {
        if (this.layers.length === 0) return '0'.repeat(64);
        return this.layers[this.layers.length - 1][0];
    }

    getDepth(): number { return this.layers.length; }

    getProof(leafIndex: number): { hash: string; position: 'left' | 'right' }[] {
        if (leafIndex < 0 || leafIndex >= this.leaves.length) return [];
        const proof: { hash: string; position: 'left' | 'right' }[] = [];
        let idx = leafIndex;
        for (let layer = 0; layer < this.layers.length - 1; layer++) {
            const isRight = idx % 2 === 1;
            const siblingIdx = isRight ? idx - 1 : idx + 1;
            const sibling = this.layers[layer][siblingIdx] || this.layers[layer][idx];
            proof.push({ hash: sibling, position: isRight ? 'left' : 'right' });
            idx = Math.floor(idx / 2);
        }
        return proof;
    }

    static verifyProof(leaf: string, proof: { hash: string; position: 'left' | 'right' }[], root: string): boolean {
        let current = leaf;
        for (const step of proof) {
            const pair = step.position === 'left'
                ? createHash('sha256').update(step.hash + current).digest('hex')
                : createHash('sha256').update(current + step.hash).digest('hex');
            current = pair;
        }
        return current === root;
    }

    leafCount(): number { return this.leaves.length; }
}

// ═══════════════════════════════════════════════════════════════
// EVENT SOURCING ENGINE — Supabase async (no writeFileSync)
// ═══════════════════════════════════════════════════════════════

export class EventStore {
    private events: Event[] = [];
    private lastHash = '0'.repeat(64);
    private merkle = new MerkleTree();
    private pendingWrites: Event[] = [];
    private flushTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        // Load from Supabase on startup (async, non-blocking)
        this.loadFromDB().catch(() => { });
    }

    append(type: string, userId: number, data: Record<string, any>, agent?: AgentType): Event {
        const id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const payload = JSON.stringify({ id, type, userId, data, prevHash: this.lastHash });
        const hash = createHash('sha256').update(payload).digest('hex');

        const event: Event = {
            id, ts: Date.now(), type, userId, agent, data,
            prevHash: this.lastHash, hash,
        };

        this.events.push(event);
        this.lastHash = hash;
        this.merkle.addLeaf(hash);

        // Async batch write to Supabase (non-blocking)
        this.pendingWrites.push(event);
        this.scheduleFlush();

        return event;
    }

    private scheduleFlush() {
        if (this.flushTimer) return;
        this.flushTimer = setTimeout(() => {
            this.flushToDB().catch(e => console.error('[EventStore] flush error:', e.message));
            this.flushTimer = null;
        }, 1000); // Batch writes every 1 second
    }

    private async flushToDB() {
        if (!supabase || this.pendingWrites.length === 0) return;
        const batch = this.pendingWrites.splice(0);
        const rows = batch.map(e => ({
            id: e.id, ts: e.ts, type: e.type,
            user_id: e.userId, agent: e.agent || null,
            data: e.data, prev_hash: e.prevHash, hash: e.hash,
        }));
        const { error } = await supabase.from('events').insert(rows);
        if (error) console.error('[EventStore] DB write error:', error.message);
    }

    private async loadFromDB() {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('ts', { ascending: true })
            .limit(500);
        if (error || !data) return;
        for (const row of data) {
            const event: Event = {
                id: row.id, ts: row.ts, type: row.type,
                userId: row.user_id, agent: row.agent,
                data: row.data, prevHash: row.prev_hash, hash: row.hash,
            };
            this.events.push(event);
            this.merkle.addLeaf(event.hash);
        }
        if (this.events.length > 0) this.lastHash = this.events[this.events.length - 1].hash;
        console.log(`[EventStore] Loaded ${this.events.length} events from Supabase`);
    }

    query(userId: number, type?: string, limit = 50): Event[] {
        return this.events
            .filter(e => e.userId === userId && (!type || e.type === type))
            .slice(-limit);
    }

    verify(): { valid: boolean; brokenAt?: number } {
        let prevHash = '0'.repeat(64);
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].prevHash !== prevHash) return { valid: false, brokenAt: i };
            prevHash = this.events[i].hash;
        }
        return { valid: true };
    }

    getProof(eventId: string) {
        const idx = this.events.findIndex(e => e.id === eventId);
        if (idx < 0) return null;
        return { leaf: this.events[idx].hash, proof: this.merkle.getProof(idx), root: this.merkle.getRoot() };
    }

    getMerkleRoot(): string { return this.merkle.getRoot(); }

    stats() {
        return {
            totalEvents: this.events.length,
            chainValid: this.verify().valid,
            lastHash: this.lastHash.slice(0, 12) + '...',
            merkleRoot: this.merkle.getRoot().slice(0, 12) + '...',
            merkleDepth: this.merkle.getDepth(),
        };
    }
}

export const eventStore = new EventStore();
