import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

import { E2E_GEAR } from './fixtures';

const prisma = new PrismaClient();

let tentId: string;

test.beforeAll(async () => {
    const tent = await prisma.gear.findFirst({ where: { title: E2E_GEAR[0].title }, orderBy: { createdAt: 'desc' } });

    if (!tent) {
        throw new Error('E2E seed data not found -- run `node e2e/seed.ts` against DATABASE_URL first.');
    }

    tentId = tent.id;
});

test.afterAll(async () => {
    await prisma.$disconnect();
});

// A fresh account, not the seeded E2E_TEST_USER -- favoriting your own
// listed gear is blocked (see app/api/favorites/[gearId]/route.ts), so
// this needs someone who didn't list the seeded gear themselves.
async function registerAndLogin(page: import('@playwright/test').Page) {
    const email = `e2e-favoriter-${Date.now()}@example.com`;
    const password = 'e2e-favoriter-password1';

    await page.goto('/');
    await page.getByText('登入', { exact: true }).click();
    await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
    await page.getByText('建立帳號').click();
    await page.waitForSelector('text=歡迎來到 GearShare', { timeout: 15000 });

    // Switching modals overlaps briefly mid-transition, so scope to
    // the register dialog specifically rather than a bare #email.
    const registerDialog = page.getByRole('dialog', { name: '註冊' });
    await registerDialog.locator('#email').fill(email);
    await registerDialog.locator('#name').fill('E2E Favoriter');
    await registerDialog.locator('#password').fill(password);
    await registerDialog.getByText('Continue').click();

    await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
    const loginDialog = page.getByRole('dialog', { name: '登入' });
    await loginDialog.locator('#email').fill(email);
    await loginDialog.locator('#password').fill(password);
    await loginDialog.getByText('Continue').click();
    await expect(page.locator('button[data-slot="dropdown-menu-trigger"]').last()).toBeVisible({ timeout: 15000 });
}

test('favoriting a gear card makes it show up on the favorites page', async ({ page }) => {
    await registerAndLogin(page);

    await page.goto('/');
    const card = page.locator(`[data-gear-id="${tentId}"]`);
    await card.waitFor({ state: 'visible', timeout: 15000 });

    // Wait for the actual POST to resolve, not just a fixed timeout --
    // the heart toggle is optimistic (SWR updates the UI immediately
    // while the request is still in flight), so navigating away too
    // early can cancel that in-flight request before it ever persists.
    const favoriteRequest = page.waitForResponse(
        (res) => res.url().includes(`/api/favorites/${tentId}`) && res.request().method() === 'POST'
    );
    await card.locator('.absolute.top-3.right-3').click();
    await favoriteRequest;

    await page.goto('/favorites');
    await expect(page.locator(`[data-gear-id="${tentId}"]`)).toBeVisible({ timeout: 15000 });
});
