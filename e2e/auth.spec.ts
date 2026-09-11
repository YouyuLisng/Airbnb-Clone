import { test, expect } from '@playwright/test';

import { E2E_TEST_USER } from './fixtures';

test.describe('authentication', () => {
    test('registers a new account, then logs in with it', async ({ page }) => {
        const email = `e2e-register-${Date.now()}@example.com`;
        const password = 'e2e-register-password1';

        await page.goto('/');
        await page.getByText('登入', { exact: true }).click();
        await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
        await page.getByText('建立帳號').click();
        await page.waitForSelector('text=歡迎來到 GearShare', { timeout: 15000 });

        // Switching modals overlaps briefly mid-transition (the login
        // dialog animating out while the register one animates in), so
        // both #email inputs can exist in the DOM at once -- scope to
        // the register dialog specifically rather than a bare #email.
        const registerDialog = page.getByRole('dialog', { name: '註冊' });
        await registerDialog.locator('#email').fill(email);
        await registerDialog.locator('#name').fill('E2E Register Test');
        await registerDialog.locator('#password').fill(password);
        await registerDialog.getByText('Continue').click();

        // Registering closes that modal and reopens the login one.
        await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
        const loginDialog = page.getByRole('dialog', { name: '登入' });
        await loginDialog.locator('#email').fill(email);
        await loginDialog.locator('#password').fill(password);
        await loginDialog.getByText('Continue').click();

        await expect(page.locator('button[data-slot="dropdown-menu-trigger"]').last()).toBeVisible({ timeout: 15000 });
    });

    test('logs in with the seeded test user and can log back out', async ({ page }) => {
        await page.goto('/');
        await page.getByText('登入', { exact: true }).click();
        await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
        await page.locator('#email').fill(E2E_TEST_USER.email);
        await page.locator('#password').fill(E2E_TEST_USER.password);
        await page.getByText('Continue').click();

        const menuTrigger = page.locator('button[data-slot="dropdown-menu-trigger"]').last();
        await expect(menuTrigger).toBeVisible({ timeout: 15000 });

        await menuTrigger.click();
        await page.getByText('登出', { exact: true }).click();

        await expect(page.getByText('登入', { exact: true })).toBeVisible({ timeout: 15000 });
    });

    test('shows an error toast for wrong credentials instead of logging in', async ({ page }) => {
        await page.goto('/');
        await page.getByText('登入', { exact: true }).click();
        await page.waitForSelector('text=歡迎回來', { timeout: 15000 });
        await page.locator('#email').fill(E2E_TEST_USER.email);
        await page.locator('#password').fill('definitely-the-wrong-password');
        await page.getByText('Continue').click();

        await expect(page.getByText('Invalid credentials')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('button[data-slot="dropdown-menu-trigger"]')).toHaveCount(0);
    });
});
