// ClawPazar – Test Suite
// Framework: Vitest
// Run: npm test

import { describe, it, expect, beforeAll, vi } from 'vitest';

// ============================================================
// 1. IYZICO SERVICE TESTS
// ============================================================

describe('IyzicoService', () => {
    describe('Commission Calculator', () => {
        it('should calculate 5% platform fee correctly', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const result = IyzicoService.calculateCommission(1000, 0.05);

            expect(result.platformFee).toBe(50);
            expect(result.sellerPayout).toBe(950);
            expect(result.iyzicoCommission).toBeCloseTo(25.15, 2); // 2.49% + 0.25
        });

        it('should handle zero price', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const result = IyzicoService.calculateCommission(0, 0.05);

            expect(result.platformFee).toBe(0);
            expect(result.sellerPayout).toBe(0);
        });

        it('should handle custom commission rates', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const result = IyzicoService.calculateCommission(500, 0.10); // 10%

            expect(result.platformFee).toBe(50);
            expect(result.sellerPayout).toBe(450);
        });

        it('should handle high-value transactions', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const result = IyzicoService.calculateCommission(50000, 0.05);

            expect(result.platformFee).toBe(2500);
            expect(result.sellerPayout).toBe(47500);
        });
    });

    describe('Webhook Verification', () => {
        it('should verify valid HMAC signature', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const crypto = await import('crypto');

            const secretKey = 'test-secret-key';
            const service = new IyzicoService({
                apiKey: 'test-key',
                secretKey,
                baseUrl: 'https://sandbox-api.iyzipay.com',
            });

            const payload = '{"test": "data"}';
            const validSignature = crypto
                .createHmac('sha256', secretKey)
                .update(payload)
                .digest('hex');

            expect(service.verifyWebhookSignature(payload, validSignature)).toBe(true);
        });

        it('should reject invalid HMAC signature', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const service = new IyzicoService({
                apiKey: 'test-key',
                secretKey: 'test-secret',
                baseUrl: 'https://sandbox-api.iyzipay.com',
            });

            expect(() =>
                service.verifyWebhookSignature('payload', 'invalid-signature')
            ).toThrow();
        });
    });

    describe('Webhook Processing', () => {
        it('should handle idempotent webhook calls', async () => {
            const { IyzicoService } = await import('../services/iyzico.service');
            const crypto = await import('crypto');

            const secretKey = 'test-secret';
            const service = new IyzicoService({
                apiKey: 'test-key',
                secretKey,
                baseUrl: 'https://sandbox-api.iyzipay.com',
            });

            const payload = {
                iyziEventType: 'CREDIT_PAYMENT_AUTH',
                iyziEventTime: Date.now(),
                token: 'test-token',
                paymentConversationId: 'conv-123',
                status: 'SUCCESS',
                merchantId: 1,
            };

            const rawBody = JSON.stringify(payload);
            const signature = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
            const processedIds = new Set<string>();

            // First call
            const result1 = await service.processWebhook(payload, rawBody, signature, processedIds);
            expect(result1.action).toBe('payment_authorized');

            // Second call (idempotent)
            const result2 = await service.processWebhook(payload, rawBody, signature, processedIds);
            expect(result2.action).toBe('already_processed');
        });
    });
});

// ============================================================
// 2. WATERMARK SERVICE TESTS
// ============================================================

describe('WatermarkService', () => {
    describe('Text Watermarking', () => {
        it('should embed invisible watermark in text', async () => {
            const { WatermarkService } = await import('../services/watermark.service');
            const service = new WatermarkService();

            const original = 'Bu harika bir ilan açıklaması. Ürün çok temiz ve kullanılmamış.';
            const { watermarkedText, result } = service.watermarkText({
                text: original,
                aiModel: 'test-model',
                contentType: 'description',
            });

            // Text should look identical to humans
            expect(watermarkedText.replace(/[\u200B\u200C\u200D\uFEFF]/g, '')).toBe(original);

            // But should contain watermark
            expect(watermarkedText.length).toBeGreaterThan(original.length);
            expect(result.isDisclosed).toBe(true);
            expect(result.contentHash).toHaveLength(64); // SHA-256
            expect(result.watermarkHash).toHaveLength(64);
        });

        it('should verify watermarked text', async () => {
            const { WatermarkService } = await import('../services/watermark.service');
            const service = new WatermarkService();

            const { watermarkedText } = service.watermarkText({
                text: 'Test açıklama metni. Bu bir test cümlesidir.',
                aiModel: 'test-model',
                contentType: 'text',
            });

            const verification = service.verifyTextWatermark(watermarkedText);
            expect(verification.hasWatermark).toBe(true);
            expect(verification.extractedSignature).toBeTruthy();
        });

        it('should not find watermark in plain text', async () => {
            const { WatermarkService } = await import('../services/watermark.service');
            const service = new WatermarkService();

            const verification = service.verifyTextWatermark('Normal bir metin, watermark yok.');
            expect(verification.hasWatermark).toBe(false);
            expect(verification.extractedSignature).toBeNull();
        });
    });

    describe('Image Watermarking', () => {
        it('should inject EXIF comment into JPEG', async () => {
            const { WatermarkService } = await import('../services/watermark.service');
            const service = new WatermarkService();

            // Create minimal JPEG buffer (SOI marker)
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);

            const { watermarkedBuffer, result } = await service.watermarkImage({
                imageBuffer: jpegBuffer,
                aiModel: 'test-model',
                contentType: 'image',
            });

            expect(watermarkedBuffer.length).toBeGreaterThan(jpegBuffer.length);
            expect(result.isDisclosed).toBe(true);

            // Verify
            const verification = service.verifyImageWatermark(watermarkedBuffer);
            expect(verification.hasWatermark).toBe(true);
        });
    });

    describe('Disclosure Badge', () => {
        it('should return correct disclosure info', async () => {
            const { WatermarkService } = await import('../services/watermark.service');
            const badge = WatermarkService.getDisclosureBadge('image');

            expect(badge.emoji).toBe('🤖');
            expect(badge.text_tr).toContain('Yapay Zeka');
            expect(badge.cssClass).toBe('ai-disclosure-badge');
        });
    });
});

// ============================================================
// 3. SWARM MANAGER TESTS
// ============================================================

describe('SwarmManager', () => {
    describe('Task Submission', () => {
        it('should queue tasks with priorities', async () => {
            const { SwarmManager } = await import('../agents/swarm-manager');
            const swarm = new SwarmManager();
            await swarm.start();

            const taskId = swarm.submitTask({
                agentType: 'listing_creator',
                taskType: 'create_listing',
                priority: 3,
                userId: 'user-1',
                inputPayload: { message: 'iPhone 15 satılık 500 TL', channel: 'web' },
            });

            expect(taskId).toBeTruthy();
            const task = swarm.getTaskStatus(taskId);
            expect(task).toBeTruthy();
            expect(task?.agentType).toBe('listing_creator');

            await swarm.stop();
        });
    });

    describe('Agent Status', () => {
        it('should report correct swarm status', async () => {
            const { SwarmManager } = await import('../agents/swarm-manager');
            const swarm = new SwarmManager();
            await swarm.start();

            const status = swarm.getStatus();
            expect(status.isRunning).toBe(true);
            expect(status.agents.length).toBeGreaterThan(0);
            expect(status.queueLength).toBe(0);

            await swarm.stop();
            const stoppedStatus = swarm.getStatus();
            expect(stoppedStatus.isRunning).toBe(false);
        });
    });
});

// ============================================================
// 4. IRONCLAW BRIDGE TESTS
// ============================================================

describe('IronClawBridge', () => {
    describe('Content Moderation', () => {
        it('should approve clean content', async () => {
            const { IronClawBridge } = await import('../agents/ironclaw-bridge');
            const bridge = new IronClawBridge();
            await bridge.initialize();

            const result = await bridge.moderateContent({
                text: 'Güzel bir ürün, temiz kullanılmış',
                category: 'elektronik',
            });

            expect(result.success).toBe(true);
            expect(result.result?.approved).toBe(true);
            expect(result.result?.flags).toHaveLength(0);
        });

        it('should flag prohibited content', async () => {
            const { IronClawBridge } = await import('../agents/ironclaw-bridge');
            const bridge = new IronClawBridge();
            await bridge.initialize();

            const result = await bridge.moderateContent({
                text: 'Sahte marka çanta satılık',
                category: 'moda',
            });

            expect(result.success).toBe(true);
            expect(result.result?.approved).toBe(false);
            expect(result.result?.flags).toContain('counterfeit');
        });

        it('should detect multiple violations', async () => {
            const { IronClawBridge } = await import('../agents/ironclaw-bridge');
            const bridge = new IronClawBridge();
            await bridge.initialize();

            const result = await bridge.moderateContent({
                text: 'Sahte replika silah satılık',
                category: 'diger',
            });

            expect(result.success).toBe(true);
            expect(result.result?.approved).toBe(false);
            expect(result.result?.flags.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Price Analysis', () => {
        it('should return price suggestions for electronics', async () => {
            const { IronClawBridge } = await import('../agents/ironclaw-bridge');
            const bridge = new IronClawBridge();
            await bridge.initialize();

            const result = await bridge.analyzePrice({
                title: 'iPhone 14 Pro',
                description: 'Az kullanılmış, kutulu',
                category: 'elektronik',
                condition: 'like_new',
            });

            expect(result.success).toBe(true);
            expect(result.result?.suggestedPrice.avg).toBeGreaterThan(0);
            expect(result.result?.suggestedPrice.min).toBeLessThan(result.result?.suggestedPrice.max || 0);
        });

        it('should adjust price based on condition', async () => {
            const { IronClawBridge } = await import('../agents/ironclaw-bridge');
            const bridge = new IronClawBridge();
            await bridge.initialize();

            const newResult = await bridge.analyzePrice({
                title: 'Test Product',
                description: 'Test',
                category: 'elektronik',
                condition: 'new',
            });

            const usedResult = await bridge.analyzePrice({
                title: 'Test Product',
                description: 'Test',
                category: 'elektronik',
                condition: 'used',
            });

            expect(newResult.result?.suggestedPrice.avg).toBeGreaterThan(
                usedResult.result?.suggestedPrice.avg || 0
            );
        });
    });
});

// ============================================================
// 5. KVKK SERVICE TESTS (with mocked Supabase)
// ============================================================

describe('KVKKService', () => {
    describe('Disclosure Text', () => {
        it('should return valid disclosure text', async () => {
            const { KVKKService } = await import('../services/kvkk.service');
            const disclosure = KVKKService.getDisclosureText();

            expect(disclosure.title).toContain('Kişisel Verilerin Korunması');
            expect(disclosure.content).toContain('KVKK');
            expect(disclosure.content).toContain('6698');
            expect(disclosure.requiredConsents).toContain('kvkk_general');
            expect(disclosure.version).toBe('v1.0');
        });
    });

    describe('Consent Management', () => {
        it('should require kvkk_general as mandatory consent', async () => {
            const { KVKKService } = await import('../services/kvkk.service');
            const disclosure = KVKKService.getDisclosureText();

            expect(disclosure.requiredConsents).toContain('kvkk_general');
            expect(disclosure.optionalConsents).toContain('marketing');
            expect(disclosure.optionalConsents).toContain('ai_processing');
        });
    });
});

// ============================================================
// 6. DATABASE SCHEMA VALIDATION (SQL parse test)
// ============================================================

describe('Database Schema', () => {
    it('should contain all required tables', async () => {
        const fs = await import('fs');
        const schema = fs.readFileSync(
            new URL('../db/migrations/001_core_schema.sql', import.meta.url),
            'utf-8'
        );

        const requiredTables = [
            'users', 'vendors', 'categories', 'listings', 'auctions', 'bids',
            'negotiations', 'orders', 'payments', 'ai_content_logs',
            'consent_logs', 'data_deletion_requests', 'takedown_requests',
            'audit_logs', 'agent_tasks', 'favorites', 'messages',
        ];

        for (const table of requiredTables) {
            expect(schema).toContain(`CREATE TABLE ${table}`);
        }
    });

    it('should have pgvector extension', async () => {
        const fs = await import('fs');
        const schema = fs.readFileSync(
            new URL('../db/migrations/001_core_schema.sql', import.meta.url),
            'utf-8'
        );

        expect(schema).toContain('CREATE EXTENSION IF NOT EXISTS "vector"');
        expect(schema).toContain('vector(1536)');
    });

    it('should have high-value listing trigger', async () => {
        const fs = await import('fs');
        const schema = fs.readFileSync(
            new URL('../db/migrations/001_core_schema.sql', import.meta.url),
            'utf-8'
        );

        expect(schema).toContain('check_high_value_listing');
        expect(schema).toContain('10000');
    });
});

// ============================================================
// 7. RLS POLICIES VALIDATION
// ============================================================

describe('RLS Policies', () => {
    it('should enable RLS on all relevant tables', async () => {
        const fs = await import('fs');
        const rls = fs.readFileSync(
            new URL('../db/migrations/002_rls_policies.sql', import.meta.url),
            'utf-8'
        );

        const rlsTables = [
            'users', 'vendors', 'listings', 'auctions', 'bids',
            'negotiations', 'orders', 'payments', 'consent_logs',
            'favorites', 'messages', 'ai_content_logs', 'agent_tasks',
        ];

        for (const table of rlsTables) {
            expect(rls).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        }
    });

    it('should have admin policies for all tables', async () => {
        const fs = await import('fs');
        const rls = fs.readFileSync(
            new URL('../db/migrations/002_rls_policies.sql', import.meta.url),
            'utf-8'
        );

        expect(rls).toContain('auth.is_admin()');
    });
});

// ============================================================
// 8. SECURITY TESTS
// ============================================================

describe('Security', () => {
    it('should never store raw card numbers', async () => {
        const fs = await import('fs');
        const schema = fs.readFileSync(
            new URL('../db/migrations/001_core_schema.sql', import.meta.url),
            'utf-8'
        );

        // Schema should only store bin_number (first 6) and last_four
        expect(schema).toContain('bin_number');
        expect(schema).toContain('last_four');
        expect(schema).not.toContain('card_number');
        expect(schema).not.toContain('full_card');
    });

    it('should use timing-safe comparison for webhooks', async () => {
        const fs = await import('fs');
        const iyzicoCode = fs.readFileSync(
            new URL('../services/iyzico.service.ts', import.meta.url),
            'utf-8'
        );

        expect(iyzicoCode).toContain('timingSafeEqual');
    });

    it('should have KVKK consent_logs immutability', async () => {
        const fs = await import('fs');
        const rls = fs.readFileSync(
            new URL('../db/migrations/002_rls_policies.sql', import.meta.url),
            'utf-8'
        );

        // Admin should NOT be able to modify consent (only read)
        expect(rls).toContain('consent_admin_read');
        expect(rls).toContain('FOR SELECT');
    });
});
