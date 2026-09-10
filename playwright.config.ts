import { defineConfig, devices } from '@playwright/test';

// These E2E tests are intentionally scoped to flows that don't touch the
// database (auth is JWT-session based, so redirect-when-unauthenticated
// checks don't need Prisma/Mongo). That keeps them safe to run in CI
// without provisioning a real database. Anything that needs real data
// (home page listings, booking flow, etc.) should be tested locally
// against a seeded DATABASE_URL instead.
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
