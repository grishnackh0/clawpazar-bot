import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        locale: 'tr-TR',
        timezoneId: 'Europe/Istanbul',
    },
    projects: [
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 7'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 14'] },
        },
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
