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

test.describe('TC-FILTER-005: Kiểm tra filter preset Converted cho Lead', () => {
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

    test('Kiểm tra Show Data với filter Converted', async ({ page }) => {
        await page.locator('button.filters-button').click();
        await page.waitForSelector('ul.filter-menu', { state: 'visible' });
        await page.locator('ul.filter-menu').getByText('Converted', { exact: true }).click();
        await page.waitForLoadState('networkidle');

        const uiTotal = await leadsPage.countAllRows();
        const leads = await db.query<{ total: number }>(`
            SELECT COUNT(id) AS total
            FROM lead
            WHERE deleted = 0
              AND status = 'Converted'
        `);

        expect(uiTotal).toBe(leads[0]?.total ?? 0);

        const visibleStatuses = page.locator('tbody tr td:nth-child(3) .label, tbody tr td:nth-child(3) .label-text, tbody tr td:nth-child(3)');
        const statusCount = await visibleStatuses.count();
        for (let i = 0; i < statusCount; i++) {
            const text = (await visibleStatuses.nth(i).textContent())?.trim();
            if (text) {
                expect(text).toContain('Converted');
            }
        }
    });
});
