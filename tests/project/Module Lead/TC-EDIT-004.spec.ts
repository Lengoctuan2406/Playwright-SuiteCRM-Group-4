import { test as editLeadTest, expect } from '@playwright/test';
import { CONFIG } from '../../../playwright.config';

editLeadTest.use({
    channel: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 800,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH
});

editLeadTest('TC-EDIT-004: Chỉnh sửa thông tin Lead', async ({ page }) => {
    await page.goto('/#Lead', { waitUntil: 'networkidle' });

    const firstLeadLink = page.locator('tbody tr a[href*="#Lead/view/"]').first();
    await firstLeadLink.waitFor({ state: 'visible' });
    await firstLeadLink.click();

    const editButton = page.getByRole('button', { name: 'Edit' });
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();

    const newName = 'Ru-en1';
    await page.getByPlaceholder('First Name').fill('');
    await page.getByPlaceholder('Last Name').fill(newName);

    await page.click('button[data-action="save"]');
    await expect(page).toHaveURL(/#Lead\/view\//, { timeout: 15000 });
    await expect(page.getByRole('heading', { level: 3, name: newName })).toBeVisible();
});
