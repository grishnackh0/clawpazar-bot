// ClawPazar – KVKK Compliance Service
// Handles consent management, data deletion, export, and audit logging
// Compliant with: KVKK (6698), GDPR-equivalent principles

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

type ConsentType = 'kvkk_general' | 'marketing' | 'data_sharing' | 'ai_processing';

interface ConsentRecord {
    userId: string;
    consentType: ConsentType;
    isGranted: boolean;
    ipAddress: string;
    userAgent: string;
    consentTextVersion: string;
}

interface DeletionRequest {
    userId: string;
    reason: string;
}

interface DataExport {
    user: object;
    vendor?: object;
    listings: object[];
    orders: object[];
    negotiations: object[];
    consents: object[];
    messages: object[];
    favorites: object[];
    exportedAt: string;
    format: 'json';
}

// Active consent text versions — bump when legal text changes
const CONSENT_VERSIONS: Record<ConsentType, string> = {
    kvkk_general: 'v1.0',
    marketing: 'v1.0',
    data_sharing: 'v1.0',
    ai_processing: 'v1.0',
};

// Required consents for registration
const REQUIRED_CONSENTS: ConsentType[] = ['kvkk_general'];

// ============================================================
// KVKK SERVICE
// ============================================================

export class KVKKService {
    private db: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.db = supabaseClient;
    }

    // ----------------------------------------------------------
    // 1. CONSENT MANAGEMENT
    // ----------------------------------------------------------

    /**
     * Record a user's consent grant/revocation.
     * Each consent action creates an immutable log entry.
     */
    async recordConsent(record: ConsentRecord): Promise<{ id: string }> {
        // Validate consent version is current
        const currentVersion = CONSENT_VERSIONS[record.consentType];
        if (record.consentTextVersion !== currentVersion) {
            throw new Error(
                `Consent text version mismatch. Expected ${currentVersion}, got ${record.consentTextVersion}`
            );
        }

        const { data, error } = await this.db
            .from('consent_logs')
            .insert({
                user_id: record.userId,
                consent_type: record.consentType,
                is_granted: record.isGranted,
                ip_address: record.ipAddress,
                user_agent: record.userAgent,
                consent_text_version: record.consentTextVersion,
                granted_at: record.isGranted ? new Date().toISOString() : null,
                revoked_at: !record.isGranted ? new Date().toISOString() : null,
            })
            .select('id')
            .single();

        if (error) throw new Error(`Failed to record consent: ${error.message}`);

        // Audit log
        await this.auditLog(record.userId, 'consent_recorded', 'consent_logs', data.id, {
            consent_type: record.consentType,
            is_granted: record.isGranted,
        });

        return { id: data.id };
    }

    /**
     * Check if user has active consent for a specific type.
     * Returns the latest consent record.
     */
    async hasActiveConsent(userId: string, consentType: ConsentType): Promise<boolean> {
        const { data, error } = await this.db
            .from('consent_logs')
            .select('is_granted')
            .eq('user_id', userId)
            .eq('consent_type', consentType)
            .order('granted_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return false;
        return data.is_granted;
    }

    /**
     * Get all active consents for a user.
     */
    async getUserConsents(userId: string): Promise<Record<ConsentType, boolean>> {
        const result: Record<string, boolean> = {};

        for (const type of Object.keys(CONSENT_VERSIONS) as ConsentType[]) {
            result[type] = await this.hasActiveConsent(userId, type);
        }

        return result as Record<ConsentType, boolean>;
    }

    /**
     * Validate that all required consents are granted before proceeding.
     * Throws if any required consent is missing.
     */
    async validateRequiredConsents(userId: string): Promise<void> {
        for (const type of REQUIRED_CONSENTS) {
            const hasConsent = await this.hasActiveConsent(userId, type);
            if (!hasConsent) {
                throw new Error(`Required consent '${type}' not granted for user ${userId}`);
            }
        }
    }

    /**
     * Revoke all consents for a user (e.g., on account deletion request).
     */
    async revokeAllConsents(userId: string, ipAddress: string, userAgent: string): Promise<void> {
        for (const type of Object.keys(CONSENT_VERSIONS) as ConsentType[]) {
            await this.recordConsent({
                userId,
                consentType: type,
                isGranted: false,
                ipAddress,
                userAgent,
                consentTextVersion: CONSENT_VERSIONS[type],
            });
        }
    }

    // ----------------------------------------------------------
    // 2. DATA DELETION (Right to Erasure)
    // ----------------------------------------------------------

    /**
     * Create a data deletion request.
     * Processes asynchronously — anonymizes PII within 30 days.
     */
    async requestDeletion(request: DeletionRequest): Promise<{ requestId: string }> {
        const { data, error } = await this.db
            .from('data_deletion_requests')
            .insert({
                user_id: request.userId,
                reason: request.reason,
                status: 'pending',
            })
            .select('id')
            .single();

        if (error) throw new Error(`Failed to create deletion request: ${error.message}`);

        await this.auditLog(request.userId, 'deletion_requested', 'data_deletion_requests', data.id, {
            reason: request.reason,
        });

        return { requestId: data.id };
    }

    /**
     * Process a data deletion request.
     * Anonymizes PII instead of hard-deleting to preserve referential integrity.
     * Keeps: order history (legal requirement), audit logs (2-year retention).
     */
    async processDeletion(requestId: string, processedBy: string): Promise<{
        tablesCleared: string[];
        recordsAnonymized: number;
    }> {
        // 1. Get the request
        const { data: request, error } = await this.db
            .from('data_deletion_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (error || !request) throw new Error('Deletion request not found');
        if (request.status !== 'pending') throw new Error('Request already processed');

        const userId = request.user_id;
        let recordsAnonymized = 0;
        const tablesCleared: string[] = [];

        try {
            // 2. Update status to processing
            await this.db
                .from('data_deletion_requests')
                .update({ status: 'processing' })
                .eq('id', requestId);

            // 3. Anonymize user profile
            await this.db
                .from('users')
                .update({
                    email: `deleted_${userId.substring(0, 8)}@anonymized.local`,
                    phone: null,
                    display_name: 'Silinmiş Kullanıcı',
                    avatar_url: null,
                    metadata: {},
                })
                .eq('id', userId);
            recordsAnonymized++;
            tablesCleared.push('users');

            // 4. Anonymize vendor profile (if exists)
            const { data: vendor } = await this.db
                .from('vendors')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (vendor) {
                await this.db
                    .from('vendors')
                    .update({
                        store_name: 'Silinmiş Mağaza',
                        identity_number: null,
                        tax_number: null,
                        iban: null,
                        address: null,
                        status: 'suspended',
                    })
                    .eq('id', vendor.id);
                recordsAnonymized++;
                tablesCleared.push('vendors');
            }

            // 5. Remove favorites
            const { count: favCount } = await this.db
                .from('favorites')
                .delete({ count: 'exact' })
                .eq('user_id', userId);
            recordsAnonymized += favCount || 0;
            tablesCleared.push('favorites');

            // 6. Anonymize messages
            await this.db
                .from('messages')
                .update({ content: '[Silindi]' })
                .eq('sender_id', userId);
            tablesCleared.push('messages');

            // 7. Revoke all consents
            await this.revokeAllConsents(userId, '0.0.0.0', 'system-deletion');
            tablesCleared.push('consent_logs');

            // 8. NOTE: Orders and payments are KEPT for legal/financial compliance
            // They are not deleted but the user profile is anonymized
            // Audit logs are KEPT for 2-year retention requirement

            // 9. Mark request as completed
            await this.db
                .from('data_deletion_requests')
                .update({
                    status: 'completed',
                    processed_at: new Date().toISOString(),
                    processed_by: processedBy,
                    deletion_log: { tables_cleared: tablesCleared, records_anonymized: recordsAnonymized },
                })
                .eq('id', requestId);

            await this.auditLog(processedBy, 'deletion_processed', 'data_deletion_requests', requestId, {
                tables_cleared: tablesCleared,
                records_anonymized: recordsAnonymized,
            });

            return { tablesCleared, recordsAnonymized };
        } catch (err) {
            // Rollback: mark as failed
            await this.db
                .from('data_deletion_requests')
                .update({ status: 'failed' })
                .eq('id', requestId);
            throw err;
        }
    }

    // ----------------------------------------------------------
    // 3. DATA EXPORT (Right to Portability)
    // ----------------------------------------------------------

    /**
     * Export all user data as JSON.
     * Includes: profile, vendor, listings, orders, negotiations, consents, messages, favorites.
     */
    async exportUserData(userId: string): Promise<DataExport> {
        const [
            { data: user },
            { data: vendor },
            { data: listings },
            { data: orders },
            { data: negotiations },
            { data: consents },
            { data: messages },
            { data: favorites },
        ] = await Promise.all([
            this.db.from('users').select('*').eq('id', userId).single(),
            this.db.from('vendors').select('*').eq('user_id', userId).single(),
            this.db.from('listings').select('*').eq('vendor_id', userId),
            this.db.from('orders').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
            this.db.from('negotiations').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
            this.db.from('consent_logs').select('*').eq('user_id', userId),
            this.db.from('messages').select('*').eq('sender_id', userId),
            this.db.from('favorites').select('*').eq('user_id', userId),
        ]);

        await this.auditLog(userId, 'data_exported', 'users', userId, {});

        return {
            user: user || {},
            vendor: vendor || undefined,
            listings: listings || [],
            orders: orders || [],
            negotiations: negotiations || [],
            consents: consents || [],
            messages: messages || [],
            favorites: favorites || [],
            exportedAt: new Date().toISOString(),
            format: 'json',
        };
    }

    // ----------------------------------------------------------
    // 4. AUDIT LOGGING
    // ----------------------------------------------------------

    /**
     * Create an immutable audit log entry.
     * Used for all KVKK-relevant operations.
     */
    private async auditLog(
        actorId: string,
        action: string,
        resourceType: string,
        resourceId: string,
        metadata: object
    ): Promise<void> {
        await this.db.from('audit_logs').insert({
            actor_id: actorId,
            actor_type: 'user',
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            new_value: metadata,
        });
    }

    // ----------------------------------------------------------
    // 5. AYDINALATMA METNİ (Disclosure Text)
    // ----------------------------------------------------------

    /**
     * Get the current KVKK disclosure text.
     * This should be displayed on registration and data collection points.
     */
    static getDisclosureText(): {
        title: string;
        content: string;
        version: string;
        requiredConsents: ConsentType[];
        optionalConsents: ConsentType[];
    } {
        return {
            title: 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni',
            content: `ClawPazar platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında:

1. KİŞİSEL VERİLERİN İŞLENME AMACI
   Kişisel verileriniz; platform hizmetlerinin sunulması, ilan yönetimi, ödeme işlemleri, güvenlik ve dolandırıcılık önleme amacıyla işlenmektedir.

2. İŞLENEN KİŞİSEL VERİLER
   - Kimlik bilgileri (ad, soyad, TC kimlik no)
   - İletişim bilgileri (e-posta, telefon)
   - Ödeme bilgileri (iyzico aracılığıyla tokenize edilir)
   - Kullanım verileri (IP adresi, oturum bilgileri)

3. AKTARIM
   Verileriniz, iyzico ödeme altyapısı ve yasal yükümlülükler kapsamında ilgili kurumlara aktarılabilir.

4. HAKLARINIZ
   KVKK madde 11 kapsamında; verilerinize erişim, düzeltme, silme, taşıma haklarınız mevcuttur.

5. YAPAY ZEKA KULLANIMI
   Platformumuz, ilan oluşturma ve fiyat analizi için yapay zeka teknolojileri kullanmaktadır. AI tarafından üretilen tüm içerikler "Yapay Zeka Tarafından Üretilmiştir" etiketi ile işaretlenir.`,
            version: 'v1.0',
            requiredConsents: REQUIRED_CONSENTS,
            optionalConsents: ['marketing', 'data_sharing', 'ai_processing'] as ConsentType[],
        };
    }
}

// ============================================================
// FACTORY
// ============================================================

export function createKVKKService(supabaseClient: SupabaseClient): KVKKService {
    return new KVKKService(supabaseClient);
}
