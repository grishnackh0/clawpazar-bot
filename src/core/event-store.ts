/**
 * ClawPazar — MerkleTree + EventStore
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import type { AgentType, Event } from '../types.js';

// ═══════════════════════════════════════════════════════════════
// MERKLE TREE (Cryptographic Provenance)
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
        const top = this.layers[this.layers.length - 1];
        return top[0];
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
// EVENT SOURCING ENGINE (SHA-256 Hash Chain + Merkle)
// ═══════════════════════════════════════════════════════════════

export class EventStore {
    private events: Event[] = [];
    private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    private persistPath: string;
    private merkle = new MerkleTree();

    constructor() {
        this.persistPath = resolve(import.meta.dirname || __dirname, '..', '.clawpazar_events.json');
        this.load();
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

        if (this.events.length % 10 === 0) this.save();

        return event;
    }

    query(userId: number, type?: string, limit = 50): Event[] {
        return this.events
            .filter(e => e.userId === userId && (!type || e.type === type))
            .slice(-limit);
    }

    verify(): { valid: boolean; brokenAt?: number } {
        let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].prevHash !== prevHash) return { valid: false, brokenAt: i };
            prevHash = this.events[i].hash;
        }
        return { valid: true };
    }

    getProof(eventId: string): { leaf: string; proof: { hash: string; position: 'left' | 'right' }[]; root: string } | null {
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

    private save() {
        try { writeFileSync(this.persistPath, JSON.stringify(this.events.slice(-500)), 'utf-8'); } catch { }
    }

    private load() {
        try {
            if (existsSync(this.persistPath)) {
                this.events = JSON.parse(readFileSync(this.persistPath, 'utf-8'));
                if (this.events.length > 0) this.lastHash = this.events[this.events.length - 1].hash;
                for (const e of this.events) this.merkle.addLeaf(e.hash);
            }
        } catch { }
    }
}

export const eventStore = new EventStore();
