import { test as createLeadTest, expect } from '@playwright/test';
import { CONFIG } from '../../../playwright.config';
import { DataFaker } from '../../../src/utils/DataFaker';
import { DatabaseActions } from '../../../src/utils/Database';

createLeadTest.use({
    channel: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 800,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH
});

createLeadTest('Create Lead thành công với dữ liệu hợp lệ', async ({ page }) => {
    const db = new DatabaseActions();
    
    try {
        const name = DataFaker.getFullName();
        const website = DataFaker.getWebsite();
        const email = DataFaker.getEmail();
        const street = DataFaker.getStreet();
        const description = DataFaker.getTestDes();

        console.log(`Navigating to ${CONFIG.ENV.PAGE_URL}#/Lead/create`);
        await page.goto("/#Lead/create", { waitUntil: "domcontentloaded", timeout: 20000 });
        
        console.log(`Current URL after navigation: ${page.url()}`);
        await page.getByPlaceholder('Last Name').waitFor({ state: 'visible' });
        
        await page.getByPlaceholder('Last Name').fill(name);
        await page.fill('input[data-name="website"]', website);
        await page.fill('.field[data-name="emailAddress"] input.email-address', email);
        await page.getByPlaceholder('Street').fill(street);
        await page.fill('textarea[data-name="description"]', description);

        await page.click('button[data-action="save"]');
        await expect(page).toHaveURL(/#Lead\/view\//, { timeout: 15000 });
        await expect(page.getByRole('heading', { level: 3, name })).toBeVisible();

        const currentUrl = page.url();
        const match = currentUrl.match(/\/([^/]+)$/);
        const leadId = match ? match[1] : null;
        const isExist = await db.isAnyExists('lead', 'id', [leadId]);
        expect(isExist).toBe(true);
    } finally {
        await db.close();
    }
});
