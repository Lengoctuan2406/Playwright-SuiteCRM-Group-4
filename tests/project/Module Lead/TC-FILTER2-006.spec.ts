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

test.describe('TC-FILTER-006: Kiểm tra advanced filter Created At Last 7 Days cho Lead', () => {
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

    test('Kiểm tra Show Data với filter Created At = Last 7 Days', async ({ page }) => {
        await page.locator('button.add-filter-button').click();
        await page.locator('li.filter-item a[data-name=createdAt]').click();
        await page.locator('a[data-action=applyFilters]').click();
        await page.waitForLoadState('networkidle');

        const createdAtFilter = page.locator('div.filter.filter-createdAt');
        await expect(createdAtFilter).toBeVisible();
        await expect(createdAtFilter.locator('.selectize-input .item[data-value=lastSevenDays]')).toBeVisible();

        const uiTotal = await leadsPage.countAllRows();
        const leads = await db.query<{ total: number }>(`
            SELECT COUNT(id) AS total
            FROM lead
            WHERE deleted = 0
              AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        expect(uiTotal).toBe(leads[0]?.total ?? 0);
    });
});
