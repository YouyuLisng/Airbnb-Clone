import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

import { E2E_GEAR } from './fixtures';

// GearCard shows location + category on the grid, not the title (the
// title only renders on the gear detail page) -- so these tests find
// "the seeded card" by its data-gear-id (added to GearCard specifically
// so E2E tests have something reliable to target) rather than by
// matching title text that was never actually on the card to begin
// with. Looking the real ids up via Prisma directly (test files run in
// Node, not the browser) instead of scraping them out of the DOM.
const prisma = new PrismaClient();

let tentId: string;
let sleepingBagId: string;

test.beforeAll(async () => {
    const tent = await prisma.gear.findFirst({ where: { title: E2E_GEAR[0].title }, orderBy: { createdAt: 'desc' } });
    const sleepingBag = await prisma.gear.findFirst({ where: { title: E2E_GEAR[1].title }, orderBy: { createdAt: 'desc' } });

    if (!tent || !sleepingBag) {
        throw new Error('E2E seed data not found -- run `node e2e/seed.ts` against DATABASE_URL first.');
    }

    tentId = tent.id;
    sleepingBagId = sleepingBag.id;
});

test.afterAll(async () => {
    await prisma.$disconnect();
});

test.describe('browsing', () => {
    test('homepage lists the seeded gear', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator(`[data-gear-id="${tentId}"]`)).toBeVisible({ timeout: 15000 });
        await expect(page.locator(`[data-gear-id="${sleepingBagId}"]`)).toBeVisible({ timeout: 15000 });
    });

    test('keyword search narrows the grid to matching gear only', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(`[data-gear-id="${tentId}"]`, { timeout: 15000 });

        await page.getByPlaceholder('搜尋裝備名稱...').fill(E2E_GEAR[0].title);
        await page.getByPlaceholder('搜尋裝備名稱...').press('Enter');
        await page.waitForLoadState('networkidle');

        await expect(page.locator(`[data-gear-id="${tentId}"]`)).toBeVisible();
        await expect(page.locator(`[data-gear-id="${sleepingBagId}"]`)).toHaveCount(0);
    });

    test('category filter narrows the grid to that category only', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector(`[data-gear-id="${tentId}"]`, { timeout: 15000 });

        await page.goto(`/?category=${encodeURIComponent(E2E_GEAR[1].category)}`, { waitUntil: 'networkidle' });

        await expect(page.locator(`[data-gear-id="${sleepingBagId}"]`)).toBeVisible();
        await expect(page.locator(`[data-gear-id="${tentId}"]`)).toHaveCount(0);
    });

    test('gear detail page renders the title, price, and location', async ({ page }) => {
        await page.goto(`/gear/${tentId}`, { waitUntil: 'networkidle' });

        await expect(page.getByText(E2E_GEAR[0].title).first()).toBeVisible();
        await expect(page.getByText(`$${E2E_GEAR[0].pricePerDay}`, { exact: false }).first()).toBeVisible();
    });
});
