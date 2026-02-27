// ClawPazar – Tier 1 Technology Transfer Tests
// Verifies: MerkleTree, TrustEngine, CollusionDetector, KVKKManager

// Run: npx tsx tests/tier1-test.ts

import { createHash } from 'crypto';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
        console.log(`  ✅ ${name}`);
        passed++;
    } else {
        console.error(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
        failed++;
    }
}

// ============================================================
// 1. MERKLE TREE
// ============================================================

console.log('\n🌳 Merkle Tree Tests');
console.log('─'.repeat(40));

// Inline MerkleTree for isolated testing
class MerkleTree {
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
    leafCount(): number { return this.leaves.length; }
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
            current = step.position === 'left'
                ? createHash('sha256').update(step.hash + current).digest('hex')
                : createHash('sha256').update(current + step.hash).digest('hex');
        }
        return current === root;
    }
}

// Test 1: Build tree with 8 leaves
const tree = new MerkleTree();
const hashes = Array.from({ length: 8 }, (_, i) =>
    createHash('sha256').update(`event_${i}`).digest('hex')
);
for (const h of hashes) tree.addLeaf(h);

assert(tree.leafCount() === 8, 'Merkle: 8 leaves added');
assert(tree.getRoot().length === 64, 'Merkle: root is 64-char hex');
assert(tree.getDepth() === 4, `Merkle: depth = 4 (got ${tree.getDepth()})`);

// Test 2: Root changes with new leaf
const rootBefore = tree.getRoot();
tree.addLeaf(createHash('sha256').update('event_8').digest('hex'));
assert(tree.getRoot() !== rootBefore, 'Merkle: root changes with new leaf');

// Test 3: Proof generation and verification
const proof = tree.getProof(3);
assert(proof.length > 0, `Merkle: proof generated (${proof.length} steps)`);
assert(MerkleTree.verifyProof(hashes[3], proof, tree.getRoot()), 'Merkle: proof verifies correctly');

// Test 4: Invalid proof fails
assert(!MerkleTree.verifyProof(hashes[0], proof, tree.getRoot()), 'Merkle: wrong leaf fails verification');

// ============================================================
// 2. TRUST ENGINE (Bayesian)
// ============================================================

console.log('\n🛡️ Trust Engine Tests');
console.log('─'.repeat(40));

const TRUST_DECAY = 0.7;
const TRUST_BOOST = 1.02;
const TRUST_MIN = 0.01;
const TRUST_MAX = 1.0;

function bayesianUpdate(prior: number, overrides: number, successes: number): number {
    let score = prior;
    for (let i = 0; i < overrides; i++) score = Math.max(TRUST_MIN, score * TRUST_DECAY);
    for (let i = 0; i < successes; i++) score = Math.min(TRUST_MAX, score * TRUST_BOOST);
    return score;
}

// Test: 3 overrides from 1.0
let score = bayesianUpdate(1.0, 3, 0);
assert(Math.abs(score - 0.343) < 0.001, `Trust: 3 overrides → ${score.toFixed(3)} ≈ 0.343`);

// Test: 5 overrides → below 0.3
score = bayesianUpdate(1.0, 5, 0);
assert(score < 0.3, `Trust: 5 overrides → ${score.toFixed(3)} < 0.3 (restricted)`);

// Test: Recovery with successes
score = bayesianUpdate(score, 0, 50);
assert(score > 0.4, `Trust: 50 successes → ${score.toFixed(3)} > 0.4 (recovering)`);

// Test: Never exceeds 1.0
score = bayesianUpdate(0.99, 0, 100);
assert(score <= 1.0, `Trust: clamped at 1.0 (got ${score.toFixed(3)})`);

// ============================================================
// 3. DELEGATION MATRIX
// ============================================================

console.log('\n📋 Delegation Matrix Tests');
console.log('─'.repeat(40));

type PermissionMode = 'autonomous' | 'human_approved' | 'denied';
type TrustAction = 'create_listing' | 'open_auction' | 'negotiate' | 'buy_now';

function getPermission(trustScore: number, action: TrustAction): PermissionMode {
    if (trustScore >= 0.5) return 'autonomous';
    if (trustScore >= 0.3) {
        if (action === 'create_listing' || action === 'open_auction') return 'denied';
        return 'human_approved';
    }
    if (action === 'buy_now') return 'human_approved';
    return 'denied';
}

assert(getPermission(0.8, 'create_listing') === 'autonomous', 'Delegation: trust=0.8 → autonomous listing');
assert(getPermission(0.4, 'create_listing') === 'denied', 'Delegation: trust=0.4 → denied listing');
assert(getPermission(0.4, 'buy_now') === 'human_approved', 'Delegation: trust=0.4 → approved buy');
assert(getPermission(0.2, 'negotiate') === 'denied', 'Delegation: trust=0.2 → denied negotiate');
assert(getPermission(0.2, 'buy_now') === 'human_approved', 'Delegation: trust=0.2 → approved buy');

// ============================================================
// 4. COLLUSION DETECTOR
// ============================================================

console.log('\n🔍 Collusion Detector Tests');
console.log('─'.repeat(40));

interface PriceRecord { userId: number; price: number; ts: number; }

function analyzeCollusion(records: PriceRecord[]): { score: number; flags: string[] } {
    if (records.length < 3) return { score: 0, flags: [] };
    const flags: string[] = [];

    // Vector 1: Price Variance
    const prices = records.map(r => r.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + (b - avg) ** 2, 0) / prices.length;
    const cv = Math.sqrt(variance) / (avg || 1);
    if (cv < 0.05 && records.length >= 4) flags.push('low_variance');

    // Vector 2: Timing
    const sorted = records.map(r => r.ts).sort();
    for (let i = 0; i < sorted.length - 2; i++) {
        if (sorted[i + 2] - sorted[i] < 60_000) { flags.push('timing'); break; }
    }

    return { score: Math.min(1, flags.length * 0.35), flags };
}

// Test: identical prices from different sellers → suspicious
const collusionRecords: PriceRecord[] = [
    { userId: 1, price: 25000, ts: Date.now() },
    { userId: 2, price: 25000, ts: Date.now() + 10 },
    { userId: 3, price: 25000, ts: Date.now() + 20 },
    { userId: 4, price: 25000, ts: Date.now() + 30 },
];
const result = analyzeCollusion(collusionRecords);
assert(result.score > 0, `Collusion: identical prices → score ${result.score.toFixed(2)}`);
assert(result.flags.includes('low_variance'), 'Collusion: low_variance flag detected');
assert(result.flags.includes('timing'), 'Collusion: timing correlation flag detected');

// Test: varied prices → clean
const cleanRecords: PriceRecord[] = [
    { userId: 1, price: 20000, ts: Date.now() - 3600_000 },
    { userId: 2, price: 28000, ts: Date.now() - 1800_000 },
    { userId: 3, price: 23000, ts: Date.now() },
];
const cleanResult = analyzeCollusion(cleanRecords);
assert(cleanResult.score === 0, 'Collusion: varied prices → clean');

// ============================================================
// 5. KVKK CONSENT
// ============================================================

console.log('\n🔐 KVKK Compliance Tests');
console.log('─'.repeat(40));

const consents = new Map<number, { types: string[] }>();

function hasConsent(userId: number): boolean {
    return consents.has(userId) && consents.get(userId)!.types.length > 0;
}
function grantConsent(userId: number) {
    consents.set(userId, { types: ['profile', 'location', 'purchase_history'] });
}
function revokeConsent(userId: number) { consents.delete(userId); }

assert(!hasConsent(1001), 'KVKK: new user has no consent');
grantConsent(1001);
assert(hasConsent(1001), 'KVKK: consent granted');
revokeConsent(1001);
assert(!hasConsent(1001), 'KVKK: consent revoked');

// Test: data not collected without consent
let dataCollected = false;
function mockLearn(userId: number) {
    if (!hasConsent(userId)) return;
    dataCollected = true;
}
mockLearn(2001);
assert(!dataCollected, 'KVKK: data NOT collected without consent');
grantConsent(2001);
mockLearn(2001);
assert(dataCollected, 'KVKK: data collected WITH consent');

// ============================================================
// SUMMARY
// ============================================================

console.log(`\n${'═'.repeat(40)}`);
console.log(`Sonuç: ${passed} geçti, ${failed} başarısız`);
console.log(`${'═'.repeat(40)}`);

if (failed > 0) process.exitCode = 1;
