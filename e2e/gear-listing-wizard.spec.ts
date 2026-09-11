import { test, expect } from '@playwright/test';

import { E2E_TEST_USER } from './fixtures';

// Stops short of actually submitting a listing: the final step needs a
// real Cloudinary-uploaded cover photo (imageSrc is a required field on
// POST /api/gear), and actually driving Cloudinary's own hosted upload
// widget through Playwright would need real Cloudinary credentials --
// this project's NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is a dummy value in
// CI, same situation LINE Pay is in. POST /api/gear's own validation
// (including the imageSrc requirement) is covered at the unit level in
// app/api/gear/route.test.ts instead. What's genuinely worth covering
// here end-to-end is the wizard navigation itself -- category
// selection, the RegionSelect combobox, back/next -- since that's real
// UI integration a unit test can't reach.
test('gear listing wizard: category -> location -> condition navigation works', async ({ page }) => {
    await page.goto('/');
    await page.getByText('登入', { exact: true }).click();
    await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
    await page.locator('#email').fill(E2E_TEST_USER.email);
    await page.locator('#password').fill(E2E_TEST_USER.password);
    await page.getByText('Continue').click();
    await expect(page.locator('button[data-slot="dropdown-menu-trigger"]').last()).toBeVisible({ timeout: 15000 });

    await page.getByText('在 GearShare 上架裝備').first().click();
    await page.waitForSelector('text=裝備類別', { timeout: 15000 });

    const dialog = page.locator('[role="dialog"]');
    await dialog.getByText('帳篷', { exact: true }).click();
    await dialog.getByText('下一步').click();

    await page.waitForSelector('text=請告訴我們裝備的所在地區', { timeout: 15000 });
    await page.locator('[data-slot="popover-trigger"]').click();
    await page.locator('input[placeholder="搜尋縣市..."]').fill('台北');
    await page.locator('[data-slot="command-item"]').filter({ hasText: '台北市' }).first().click();
    await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('台北市');
    await dialog.getByText('下一步').click();

    await page.waitForSelector('text=新舊狀況', { timeout: 15000 });
    await dialog.locator('button').filter({ hasText: '良好' }).first().click();

    // Back button returns to the location step with the selection kept.
    await dialog.getByText('上一步').click();
    await page.waitForSelector('text=請告訴我們裝備的所在地區', { timeout: 15000 });
    await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('台北市');
});
