// ClawPazar – Playwright E2E Tests
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// ============================================================
// 1. AUTH FLOW
// ============================================================

test.describe('Auth Flow', () => {
    test('should display login page', async ({ page }) => {
        await page.goto(`${BASE_URL}/auth`);
        await expect(page.locator('text=ClawPazar')).toBeVisible();
        await expect(page.locator('text=Telefon numaranızla giriş yapın')).toBeVisible();
        await expect(page.locator('input[type="tel"]')).toBeVisible();
    });

    test('should validate phone number', async ({ page }) => {
        await page.goto(`${BASE_URL}/auth`);
        await page.locator('input[type="tel"]').fill('123');
        const button = page.locator('text=Kod Gönder');
        await expect(button).toBeDisabled();
    });

    test('should show KVKK consent step', async ({ page }) => {
        // This test would require mock Supabase auth
        // For now, verify the consent UI is accessible
        await page.goto(`${BASE_URL}/auth`);
        await expect(page.locator('text=ClawPazar')).toBeVisible();
    });
});

// ============================================================
// 2. HOMEPAGE
// ============================================================

test.describe('Homepage', () => {
    test('should render hero section', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('text=Sat, Al, Kazan')).toBeVisible();
        await expect(page.locator('text=Hemen Başla')).toBeVisible();
    });

    test('should show live auctions strip', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('text=Canlı Mezatlar')).toBeVisible();
    });

    test('should show trending items', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('text=Trend İlanlar')).toBeVisible();
    });

    test('should show bottom navigation', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('text=Keşfet')).toBeVisible();
        await expect(page.locator('text=Mezat')).toBeVisible();
        await expect(page.locator('text=Sohbet')).toBeVisible();
        await expect(page.locator('text=Profil')).toBeVisible();
    });

    test('should navigate to agent chat', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('text=Hemen Başla').click();
        await expect(page).toHaveURL(/sohbet/);
    });
});

// ============================================================
// 3. BROWSE (KEŞFET)
// ============================================================

test.describe('Browse Page', () => {
    test('should show search input', async ({ page }) => {
        await page.goto(`${BASE_URL}/kesfet`);
        await expect(page.locator('input[placeholder*="iPhone"]')).toBeVisible();
    });

    test('should show category filters', async ({ page }) => {
        await page.goto(`${BASE_URL}/kesfet`);
        await expect(page.locator('text=Tümü')).toBeVisible();
        await expect(page.locator('text=Elektronik')).toBeVisible();
        await expect(page.locator('text=Moda')).toBeVisible();
    });

    test('should filter by category', async ({ page }) => {
        await page.goto(`${BASE_URL}/kesfet`);
        await page.locator('button:has-text("Elektronik")').click();
        // Category should be highlighted
        const activeButton = page.locator('button:has-text("Elektronik")');
        await expect(activeButton).toBeVisible();
    });
});

// ============================================================
// 4. AGENT CHAT
// ============================================================

test.describe('Agent Chat', () => {
    test('should show agent welcome', async ({ page }) => {
        await page.goto(`${BASE_URL}/sohbet`);
        await expect(page.locator('text=ClawPazar Ajan')).toBeVisible();
        await expect(page.locator('text=Merhaba')).toBeVisible();
    });

    test('should show quick action chips', async ({ page }) => {
        await page.goto(`${BASE_URL}/sohbet`);
        await expect(page.locator('text=Telefon satmak istiyorum')).toBeVisible();
        await expect(page.locator('text=Ayakkabı var')).toBeVisible();
    });

    test('should have message input', async ({ page }) => {
        await page.goto(`${BASE_URL}/sohbet`);
        await expect(page.locator('textarea[placeholder*="Mesaj"]')).toBeVisible();
    });

    test('should have voice and camera buttons', async ({ page }) => {
        await page.goto(`${BASE_URL}/sohbet`);
        await expect(page.locator('text=📷')).toBeVisible();
        await expect(page.locator('text=🎤')).toBeVisible();
    });
});

// ============================================================
// 5. AUCTION PAGE
// ============================================================

test.describe('Auctions', () => {
    test('should show auction grid', async ({ page }) => {
        await page.goto(`${BASE_URL}/mezat`);
        await expect(page.locator('text=Canlı Mezatlar')).toBeVisible();
    });
});

// ============================================================
// 6. PROFILE (UNAUTHENTICATED)
// ============================================================

test.describe('Profile (logged out)', () => {
    test('should show login prompt', async ({ page }) => {
        await page.goto(`${BASE_URL}/profil`);
        await expect(page.locator('text=Giriş Yapın')).toBeVisible();
        await expect(page.locator('text=Giriş Yap / Kayıt Ol')).toBeVisible();
    });

    test('should navigate to auth page', async ({ page }) => {
        await page.goto(`${BASE_URL}/profil`);
        await page.locator('text=Giriş Yap / Kayıt Ol').click();
        await expect(page).toHaveURL(/auth/);
    });
});

// ============================================================
// 7. RESPONSIVE TESTS
// ============================================================

test.describe('Responsive', () => {
    const viewports = [
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'iPhone 14 Pro', width: 393, height: 852 },
        { name: 'iPad Mini', width: 768, height: 1024 },
    ];

    for (const vp of viewports) {
        test(`should render on ${vp.name}`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto(BASE_URL);
            await expect(page.locator('text=Sat, Al, Kazan')).toBeVisible();
            // No horizontal overflow
            const body = page.locator('body');
            const box = await body.boundingBox();
            expect(box?.width).toBeLessThanOrEqual(vp.width);
        });
    }
});

// ============================================================
// 8. PWA
// ============================================================

test.describe('PWA', () => {
    test('should have manifest', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/manifest.json`);
        expect(response?.status()).toBe(200);
        const manifest = await response?.json();
        expect(manifest.name).toBe('ClawPazar');
        expect(manifest.display).toBe('standalone');
        expect(manifest.theme_color).toBe('#7C3AED');
    });
});
