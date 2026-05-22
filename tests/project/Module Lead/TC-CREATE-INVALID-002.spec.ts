import { test as createLeadInvalidTest, expect } from '@playwright/test';
import { CONFIG } from '../../../playwright.config';

createLeadInvalidTest.use({
    channel: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 800,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH
});

createLeadInvalidTest('TC-CREATE-INVALID-002: Tạo Lead với các trường rỗng', async ({ page }) => {
    await page.goto('/#Lead/create', { waitUntil: 'domcontentloaded' });

    await page.click('button[data-action="save"]');

    await expect(page).toHaveURL(/#Lead\/create$/, { timeout: 5000 });

    const nameFieldError = page.locator('.form-group.has-error[data-name="name"]');
    await expect(nameFieldError).toBeVisible();

    await expect(page.getByText('Not valid')).toBeVisible();
});
