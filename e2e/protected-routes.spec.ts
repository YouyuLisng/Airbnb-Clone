import { test, expect } from '@playwright/test';

// Session strategy is JWT (see app/api/auth/[...nextauth]/options.ts), so
// these checks never touch the database -- safe to run without a real
// DATABASE_URL/Mongo instance.
const PROTECTED_ROUTES = ['/trips', '/reservations', '/properties', '/favorites'];

for (const route of PROTECTED_ROUTES) {
    test(`unauthenticated visit to ${route} is redirected away`, async ({ page }) => {
        await page.goto(route);

        // The proxy/middleware (proxy.ts) should bounce an anonymous
        // request before it ever reaches the page component.
        await expect(page).not.toHaveURL(new RegExp(`${route}$`));
    });
}

test('an unknown route renders the not-found page instead of crashing', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
});
