/**
 * ClawPazar — iyzico Escrow Service
 */
import { createHash } from 'crypto';
import { IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL } from '../config.js';
import type { EscrowRecord } from '../types.js';
import { eventStore } from '../core/event-store.js';
import { trustEngine } from '../agents/trust-engine.js';

export const HIGH_VALUE_THRESHOLD = 10000; // TL

function iyzicoAuth(): { authorization: string; 'x-iyzi-rnd': string } {
    const rnd = Date.now().toString();
    const hashStr = IYZICO_API_KEY + rnd + IYZICO_SECRET_KEY;
    const hash = createHash('sha1').update(hashStr).digest('base64');
    const authStr = `IYZWS ${IYZICO_API_KEY}:${hash}`;
    return { authorization: authStr, 'x-iyzi-rnd': rnd };
}

export class EscrowService {
    private escrows = new Map<string, EscrowRecord>();
    private userEscrows = new Map<number, string[]>();

    async initEscrow(opts: {
        buyerId: number;
        amount: number;
        listingTitle: string;
        sellerId?: number;
    }): Promise<EscrowRecord> {
        const conversationId = `CLP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const isHighValue = opts.amount >= HIGH_VALUE_THRESHOLD;

        const escrow: EscrowRecord = {
            id: conversationId,
            buyerId: opts.buyerId,
            sellerId: opts.sellerId,
            amount: opts.amount,
            currency: 'TRY',
            status: isHighValue ? 'pending_approval' : 'pending',
            iyzicoConversationId: conversationId,
            listingTitle: opts.listingTitle,
            createdAt: Date.now(),
        };

        this.escrows.set(conversationId, escrow);
        const userList = this.userEscrows.get(opts.buyerId) || [];
        userList.push(conversationId);
        this.userEscrows.set(opts.buyerId, userList);

        eventStore.append('escrow_created', opts.buyerId, {
            escrowId: conversationId,
            amount: opts.amount,
            highValue: isHighValue,
            status: escrow.status,
        });

        if (IYZICO_API_KEY && !isHighValue) {
            try {
                await this.callIyzicoCheckout(escrow);
            } catch (err: any) {
                console.error('  ⚠️ iyzico checkout:', err.message);
            }
        }

        return escrow;
    }

    async approveHighValue(escrowId: string, approverId: number): Promise<EscrowRecord | null> {
        const escrow = this.escrows.get(escrowId);
        if (!escrow || escrow.status !== 'pending_approval') return null;

        escrow.status = 'pending';
        escrow.approvedBy = approverId;
        eventStore.append('escrow_high_value_approved', approverId, { escrowId, amount: escrow.amount });

        if (IYZICO_API_KEY) {
            try { await this.callIyzicoCheckout(escrow); } catch { }
        }
        return escrow;
    }

    async releaseOrRefund(escrowId: string, action: 'release' | 'refund'): Promise<boolean> {
        const escrow = this.escrows.get(escrowId);
        if (!escrow) return false;

        escrow.status = action === 'release' ? 'released' : 'refunded';
        eventStore.append(`escrow_${action}d`, escrow.buyerId, { escrowId, amount: escrow.amount });
        trustEngine.recordSuccess(escrow.buyerId);
        return true;
    }

    cancelEscrow(escrowId: string): boolean {
        const escrow = this.escrows.get(escrowId);
        if (!escrow || escrow.status === 'released') return false;
        escrow.status = 'cancelled';
        eventStore.append('escrow_cancelled', escrow.buyerId, { escrowId });
        return true;
    }

    get(escrowId: string): EscrowRecord | undefined { return this.escrows.get(escrowId); }

    getForUser(userId: number): EscrowRecord[] {
        const ids = this.userEscrows.get(userId) || [];
        return ids.map(id => this.escrows.get(id)!).filter(Boolean);
    }

    getPendingApprovals(): EscrowRecord[] {
        return [...this.escrows.values()].filter(e => e.status === 'pending_approval');
    }

    summarize(escrow: EscrowRecord): string {
        const statusMap: Record<string, string> = {
            pending: '⏳ Ödeme Bekliyor',
            paid: '💳 Ödendi',
            held: '🔒 Escrow\'da',
            released: '✅ Serbest',
            refunded: '↩️ İade Edildi',
            cancelled: '❌ İptal',
            pending_approval: '⚠️ Yüksek Değer — Onay Bekliyor',
        };
        return `💰 *${escrow.listingTitle}*\n` +
            `Tutar: ${escrow.amount.toLocaleString('tr-TR')} ₺\n` +
            `Durum: ${statusMap[escrow.status] || escrow.status}\n` +
            `ID: \`${escrow.id}\``;
    }

    private async callIyzicoCheckout(escrow: EscrowRecord): Promise<void> {
        const auth = iyzicoAuth();
        const body = {
            locale: 'tr',
            conversationId: escrow.iyzicoConversationId,
            price: escrow.amount.toFixed(2),
            paidPrice: escrow.amount.toFixed(2),
            currency: 'TRY',
            basketId: escrow.id,
            paymentGroup: 'PRODUCT',
            callbackUrl: `${process.env.API_EXTERNAL_URL || 'http://localhost:4000'}/webhook/iyzico`,
            buyer: {
                id: `TG-${escrow.buyerId}`,
                name: 'ClawPazar',
                surname: 'Kullanıcı',
                email: `tg${escrow.buyerId}@clawpazar.com`,
                identityNumber: '11111111111',
                registrationAddress: 'Istanbul, Turkey',
                ip: '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
            },
            shippingAddress: { contactName: 'ClawPazar', city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
            billingAddress: { contactName: 'ClawPazar', city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
            basketItems: [{
                id: escrow.id,
                name: escrow.listingTitle.slice(0, 50),
                category1: 'Marketplace',
                itemType: 'PHYSICAL',
                price: escrow.amount.toFixed(2),
            }],
        };

        const res = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...auth },
            body: JSON.stringify(body),
        });

        const data = await res.json() as any;
        if (data.status === 'success') {
            escrow.status = 'pending';
            console.log(`  💳 iyzico checkout: ${escrow.id}`);
        } else {
            console.error('  ⚠️ iyzico:', data.errorMessage || 'unknown error');
        }
    }
}

export const escrowService = new EscrowService();
