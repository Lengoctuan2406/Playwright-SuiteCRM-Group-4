import { test, expect } from '@playwright/test';
import { LeadsPage } from '../../pages/LeadPage';
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from '../../../playwright.config';

test.use({
    channel: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 800,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH,
});

test.describe('TC-RESET1-007: Reset filter Created At cho Lead', () => {
    let leadsPage: LeadsPage;
    let db: DatabaseActions;

    test.beforeEach(async ({ page }) => {
        leadsPage = new LeadsPage(page);
        db = new DatabaseActions();
        await leadsPage.redirect();
    });

    test.afterAll(async () => {
        await db.close();
    });

    test('Kiểm tra nhấn Reset sau filter Created At = Last 7 Days thì dữ liệu trở về đầy đủ', async ({ page }) => {
        await page.locator('button.add-filter-button').click();
        await page.locator('li.filter-item a[data-name="createdAt"]').click();
        await page.locator('a[data-action="applyFilters"]').click();
        await page.waitForLoadState('networkidle');

        const createdAtFilter = page.locator('div.filter.filter-createdAt');
        await expect(createdAtFilter).toBeVisible();
        await expect(createdAtFilter.locator('.selectize-input .item[data-value="lastSevenDays"]')).toBeVisible();

        const filteredUiTotal = await leadsPage.countAllRows();
        const filteredLeads = await db.query<{ total: number }>(`
            SELECT COUNT(id) AS total
            FROM lead
            WHERE deleted = 0
              AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        expect(filteredUiTotal).toBe(filteredLeads[0]?.total ?? 0);

        await page.locator('[data-action="reset"][title="Reset"]').click();
        await page.waitForLoadState('networkidle');
        await expect(createdAtFilter).toBeHidden();

        const resetUiTotal = await leadsPage.countAllRows();
        const allLeads = await db.query<{ total: number }>(`
            SELECT COUNT(id) AS total
            FROM lead
            WHERE deleted = 0
        `);
        expect(resetUiTotal).toBe(allLeads[0]?.total ?? 0);
    });
});
