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

test.describe('TC-SEARCH1-009: Tìm kiếm Lead bằng keyword', () => {
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

    test('Nhập keyword, nhấn icon lăng kính và hiển thị dữ liệu đúng với keyword', async ({ page }) => {
        const keyword = 'Đào';

        await page.locator('button.filters-button').click();
        await page.waitForSelector('ul.filter-menu', { state: 'visible' });
        await page.click('ul.filter-menu a[data-action="selectPreset"][data-name=""]');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[data-name="textFilter"]');
        await searchInput.fill(keyword);
        await page.locator('button[data-action="search"]').click();
        await page.waitForLoadState('networkidle');

        const uiTotal = await leadsPage.countAllRows();
        const leads = await db.query<{ total: number }>(`
            SELECT COUNT(id) AS total
            FROM lead
            WHERE deleted = 0
              AND CONCAT_WS(' ', first_name, last_name) LIKE ?
        `, [`%${keyword}%`]);

        expect(uiTotal).toBe(leads[0]?.total ?? 0);
        expect(uiTotal).toBeGreaterThan(0);

        const visibleNames = page.locator('tbody tr td:nth-child(2) a');
        const count = await visibleNames.count();
        for (let i = 0; i < count; i++) {
            const text = (await visibleNames.nth(i).textContent())?.trim() ?? '';
            expect(text).toContain(keyword);
        }
    });
});
