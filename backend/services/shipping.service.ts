// ClawPazar – Shipping Service
// Multi-carrier abstraction: Aras, Yurtiçi, MNG, PTT, Sürat
// Gateway: Geliver.io style unified API (demo mode: mock responses)
// Escrow integration: delivery confirmation triggers iyzico escrow release
// KVKK: Address data retained 30 days post-delivery, then anonymized

import crypto from 'crypto';

// ============================================================
// TYPES
// ============================================================

export type CarrierId = 'aras' | 'yurtici' | 'mng' | 'ptt' | 'surat';

export interface ShippingAddress {
    contactName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;   // ilçe
    city: string;        // il
    postalCode: string;
    country: string;     // default 'TR'
}

export interface ParcelDimensions {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
}

export interface ShippingRate {
    carrierId: CarrierId;
    carrierName: string;
    serviceName: string;
    price: number;         // TRY
    estimatedDays: number;
    currency: 'TRY';
}

export type ShipmentStatus =
    | 'label_created'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned';

export interface Shipment {
    id: string;
    orderId: string;
    carrierId: CarrierId;
    carrierName: string;
    trackingNumber: string;
    trackingUrl: string;
    labelUrl: string | null;
    status: ShipmentStatus;
    price: number;
    from: ShippingAddress;
    to: ShippingAddress;
    parcel: ParcelDimensions;
    estimatedDelivery: string; // ISO date
    createdAt: string;
    updatedAt: string;
    deliveredAt: string | null;
    escrowReleased: boolean;
}

export interface TrackingEvent {
    timestamp: string;
    status: string;
    location: string;
    description: string;
}

export interface TrackingInfo {
    shipmentId: string;
    trackingNumber: string;
    carrier: string;
    status: ShipmentStatus;
    events: TrackingEvent[];
}

// ============================================================
// CARRIER DEFINITIONS
// ============================================================

const CARRIERS: Record<CarrierId, { name: string; basePrice: number; perKg: number; avgDays: number }> = {
    aras: { name: 'Aras Kargo', basePrice: 59.90, perKg: 8.50, avgDays: 2 },
    yurtici: { name: 'Yurtiçi Kargo', basePrice: 54.90, perKg: 7.90, avgDays: 2 },
    mng: { name: 'MNG Kargo', basePrice: 49.90, perKg: 7.50, avgDays: 3 },
    ptt: { name: 'PTT Kargo', basePrice: 39.90, perKg: 5.50, avgDays: 4 },
    surat: { name: 'Sürat Kargo', basePrice: 64.90, perKg: 9.00, avgDays: 1 },
};

// ============================================================
// SHIPPING SERVICE
// ============================================================

export interface ShippingServiceConfig {
    geliverApiKey?: string;     // Geliver.io API key (empty = demo/mock mode)
    geliverBaseUrl?: string;
    webhookUrl?: string;        // for delivery status callbacks
}

export class ShippingService {
    private config: ShippingServiceConfig;
    private shipments: Map<string, Shipment> = new Map();  // in-memory for demo
    private isDemoMode: boolean;

    constructor(config: ShippingServiceConfig) {
        this.config = config;
        this.isDemoMode = !config.geliverApiKey;
    }

    // ----------------------------------------------------------
    // GET RATES: Compare prices across all carriers
    // ----------------------------------------------------------
    async getRates(
        from: { city: string; district: string },
        to: { city: string; district: string },
        parcel: ParcelDimensions,
    ): Promise<ShippingRate[]> {
        if (!this.isDemoMode) {
            return this.geliverGetRates(from, to, parcel);
        }

        // Demo mode: calculate from carrier definitions
        const volumetricWeight = (parcel.lengthCm * parcel.widthCm * parcel.heightCm) / 3000;
        const chargeableWeight = Math.max(parcel.weightKg, volumetricWeight);
        const isSameCity = from.city.toLowerCase() === to.city.toLowerCase();

        const rates: ShippingRate[] = Object.entries(CARRIERS).map(([id, carrier]) => {
            let price = carrier.basePrice + (chargeableWeight * carrier.perKg);
            if (isSameCity) price *= 0.85; // %15 indirim şehir içi
            price = Math.round(price * 100) / 100;

            return {
                carrierId: id as CarrierId,
                carrierName: carrier.name,
                serviceName: isSameCity ? 'Şehir İçi' : 'Standart',
                price,
                estimatedDays: isSameCity ? 1 : carrier.avgDays,
                currency: 'TRY' as const,
            };
        });

        // Sort by price ascending
        return rates.sort((a, b) => a.price - b.price);
    }

    // ----------------------------------------------------------
    // CREATE SHIPMENT: Generate label and tracking number
    // ----------------------------------------------------------
    async createShipment(
        orderId: string,
        carrierId: CarrierId,
        from: ShippingAddress,
        to: ShippingAddress,
        parcel: ParcelDimensions,
    ): Promise<Shipment> {
        if (!this.isDemoMode) {
            return this.geliverCreateShipment(orderId, carrierId, from, to, parcel);
        }

        const carrier = CARRIERS[carrierId];
        if (!carrier) throw new Error(`Geçersiz kargo firması: ${carrierId}`);

        const volumetricWeight = (parcel.lengthCm * parcel.widthCm * parcel.heightCm) / 3000;
        const chargeableWeight = Math.max(parcel.weightKg, volumetricWeight);
        const isSameCity = from.city.toLowerCase() === to.city.toLowerCase();
        let price = carrier.basePrice + (chargeableWeight * carrier.perKg);
        if (isSameCity) price *= 0.85;
        price = Math.round(price * 100) / 100;

        const trackingNumber = this.generateTrackingNumber(carrierId);
        const estimatedDays = isSameCity ? 1 : carrier.avgDays;
        const now = new Date();

        const shipment: Shipment = {
            id: crypto.randomUUID(),
            orderId,
            carrierId,
            carrierName: carrier.name,
            trackingNumber,
            trackingUrl: `https://kargotakip.com/${carrierId}/${trackingNumber}`,
            labelUrl: `https://label.clawpazar.com/${trackingNumber}.pdf`,
            status: 'label_created',
            price,
            from: this.sanitizeAddress(from),
            to: this.sanitizeAddress(to),
            parcel,
            estimatedDelivery: new Date(now.getTime() + estimatedDays * 86400000).toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            deliveredAt: null,
            escrowReleased: false,
        };

        this.shipments.set(shipment.id, shipment);
        return shipment;
    }

    // ----------------------------------------------------------
    // GET TRACKING: Current status and event history
    // ----------------------------------------------------------
    async getTracking(shipmentId: string): Promise<TrackingInfo> {
        const shipment = this.shipments.get(shipmentId);
        if (!shipment) throw new Error('Gönderi bulunamadı');

        if (!this.isDemoMode) {
            return this.geliverGetTracking(shipment.trackingNumber);
        }

        // Demo: generate realistic tracking events based on current status
        const events = this.generateTrackingEvents(shipment);

        return {
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            carrier: shipment.carrierName,
            status: shipment.status,
            events,
        };
    }

    // ----------------------------------------------------------
    // UPDATE STATUS: Carrier webhook or manual update
    // ----------------------------------------------------------
    async updateStatus(shipmentId: string, status: ShipmentStatus): Promise<Shipment> {
        const shipment = this.shipments.get(shipmentId);
        if (!shipment) throw new Error('Gönderi bulunamadı');

        shipment.status = status;
        shipment.updatedAt = new Date().toISOString();

        if (status === 'delivered') {
            shipment.deliveredAt = new Date().toISOString();
        }

        this.shipments.set(shipmentId, shipment);
        return shipment;
    }

    // ----------------------------------------------------------
    // CONFIRM DELIVERY: Buyer confirms, triggers escrow release
    // Returns { shipment, escrowAction } for route to call iyzico
    // ----------------------------------------------------------
    async confirmDelivery(shipmentId: string): Promise<{
        shipment: Shipment;
        shouldReleaseEscrow: boolean;
        orderId: string;
    }> {
        const shipment = this.shipments.get(shipmentId);
        if (!shipment) throw new Error('Gönderi bulunamadı');

        if (shipment.escrowReleased) {
            throw new Error('Escrow zaten serbest bırakıldı');
        }

        shipment.status = 'delivered';
        shipment.deliveredAt = new Date().toISOString();
        shipment.escrowReleased = true;
        shipment.updatedAt = new Date().toISOString();
        this.shipments.set(shipmentId, shipment);

        return {
            shipment,
            shouldReleaseEscrow: true,
            orderId: shipment.orderId,
        };
    }

    // ----------------------------------------------------------
    // CANCEL SHIPMENT
    // ----------------------------------------------------------
    async cancelShipment(shipmentId: string): Promise<Shipment> {
        const shipment = this.shipments.get(shipmentId);
        if (!shipment) throw new Error('Gönderi bulunamadı');

        if (shipment.status === 'delivered') {
            throw new Error('Teslim edilmiş gönderi iptal edilemez');
        }

        shipment.status = 'cancelled';
        shipment.updatedAt = new Date().toISOString();
        this.shipments.set(shipmentId, shipment);
        return shipment;
    }

    // ----------------------------------------------------------
    // LIST CARRIERS
    // ----------------------------------------------------------
    getCarriers(): Array<{ id: CarrierId; name: string; avgDays: number }> {
        return Object.entries(CARRIERS).map(([id, c]) => ({
            id: id as CarrierId,
            name: c.name,
            avgDays: c.avgDays,
        }));
    }

    // ----------------------------------------------------------
    // KVKK: Anonymize address after 30 days post-delivery
    // ----------------------------------------------------------
    async anonymizeDeliveredShipments(olderThanDays: number = 30): Promise<number> {
        let count = 0;
        const cutoff = Date.now() - olderThanDays * 86400000;

        for (const [id, shipment] of this.shipments) {
            if (shipment.deliveredAt && new Date(shipment.deliveredAt).getTime() < cutoff) {
                shipment.from = this.anonymizeAddress(shipment.from);
                shipment.to = this.anonymizeAddress(shipment.to);
                this.shipments.set(id, shipment);
                count++;
            }
        }
        return count;
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private generateTrackingNumber(carrierId: CarrierId): string {
        const prefixes: Record<CarrierId, string> = {
            aras: 'AR', yurtici: 'YK', mng: 'MN', ptt: 'PT', surat: 'SK',
        };
        const random = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 10);
        return `${prefixes[carrierId]}${random}`;
    }

    private sanitizeAddress(addr: ShippingAddress): ShippingAddress {
        return {
            contactName: addr.contactName.trim(),
            phone: addr.phone.replace(/[^0-9+]/g, ''),
            addressLine1: addr.addressLine1.trim(),
            addressLine2: addr.addressLine2?.trim(),
            district: addr.district.trim(),
            city: addr.city.trim(),
            postalCode: addr.postalCode.replace(/\s/g, ''),
            country: addr.country || 'TR',
        };
    }

    private anonymizeAddress(addr: ShippingAddress): ShippingAddress {
        return {
            contactName: '***',
            phone: '***',
            addressLine1: '*** (anonimleştirildi)',
            district: addr.district,  // keep district/city for stats
            city: addr.city,
            postalCode: '***',
            country: addr.country,
        };
    }

    private generateTrackingEvents(shipment: Shipment): TrackingEvent[] {
        const events: TrackingEvent[] = [];
        const created = new Date(shipment.createdAt);

        events.push({
            timestamp: created.toISOString(),
            status: 'Gönderi oluşturuldu',
            location: `${shipment.from.district}, ${shipment.from.city}`,
            description: 'Kargo etiketi oluşturuldu, teslim alınmayı bekliyor.',
        });

        if (['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
            events.push({
                timestamp: new Date(created.getTime() + 3600000).toISOString(),
                status: 'Teslim alındı',
                location: `${shipment.from.district}, ${shipment.from.city}`,
                description: 'Gönderi kurye tarafından teslim alındı.',
            });
        }

        if (['in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
            events.push({
                timestamp: new Date(created.getTime() + 86400000).toISOString(),
                status: 'Transfer merkezinde',
                location: `${shipment.from.city} Transfer Merkezi`,
                description: 'Gönderi transfer merkezine ulaştı.',
            });
        }

        if (['out_for_delivery', 'delivered'].includes(shipment.status)) {
            events.push({
                timestamp: new Date(created.getTime() + 86400000 * 2).toISOString(),
                status: 'Dağıtımda',
                location: `${shipment.to.district}, ${shipment.to.city}`,
                description: 'Gönderi dağıtıma çıktı.',
            });
        }

        if (shipment.status === 'delivered') {
            events.push({
                timestamp: shipment.deliveredAt || new Date().toISOString(),
                status: 'Teslim edildi',
                location: `${shipment.to.district}, ${shipment.to.city}`,
                description: 'Gönderi teslim edildi.',
            });
        }

        return events.reverse(); // newest first
    }

    // ============================================================
    // GELIVER API (production — placeholder for real integration)
    // ============================================================

    private async geliverGetRates(
        from: { city: string; district: string },
        to: { city: string; district: string },
        parcel: ParcelDimensions,
    ): Promise<ShippingRate[]> {
        const resp = await fetch(`${this.config.geliverBaseUrl}/v1/rates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.geliverApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, parcel }),
        });
        if (!resp.ok) throw new Error(`Geliver API error: ${resp.status}`);
        return resp.json();
    }

    private async geliverCreateShipment(
        orderId: string,
        carrierId: CarrierId,
        from: ShippingAddress,
        to: ShippingAddress,
        parcel: ParcelDimensions,
    ): Promise<Shipment> {
        const resp = await fetch(`${this.config.geliverBaseUrl}/v1/shipments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.geliverApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, carrierId, from, to, parcel }),
        });
        if (!resp.ok) throw new Error(`Geliver API error: ${resp.status}`);
        return resp.json();
    }

    private async geliverGetTracking(trackingNumber: string): Promise<TrackingInfo> {
        const resp = await fetch(`${this.config.geliverBaseUrl}/v1/tracking/${trackingNumber}`, {
            headers: { 'Authorization': `Bearer ${this.config.geliverApiKey}` },
        });
        if (!resp.ok) throw new Error(`Geliver API error: ${resp.status}`);
        return resp.json();
    }
}

// ============================================================
// FACTORY
// ============================================================

export function createShippingService(): ShippingService {
    return new ShippingService({
        geliverApiKey: process.env.GELIVER_API_KEY,
        geliverBaseUrl: process.env.GELIVER_BASE_URL || 'https://api.geliver.io',
        webhookUrl: process.env.SHIPPING_WEBHOOK_URL,
    });
}
