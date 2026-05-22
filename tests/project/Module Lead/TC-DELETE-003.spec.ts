import { test as deleteLeadTest, expect } from '@playwright/test';
import { CONFIG } from '../../../playwright.config';
import { DatabaseActions } from '../../../src/utils/Database';
import { LeadsPage } from '../../pages/LeadPage';

deleteLeadTest.use({
    channel: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 800,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH
});

let db: DatabaseActions;
let leadsPage: LeadsPage;

deleteLeadTest.beforeEach(async ({ page }) => {
    db = new DatabaseActions();
    leadsPage = new LeadsPage(page);
    await leadsPage.redirect();
});

deleteLeadTest.afterEach(async () => {
    await db.close();
});

deleteLeadTest('TC-DELETE-003: Xóa 1 Lead', async ({ page }) => {
    const leadList = page.locator('div[data-scope="Lead"]');
    const checkboxes = leadList.locator('tbody input.record-checkbox');

    await checkboxes.first().waitFor({ state: 'visible' });

    const availableCount = await checkboxes.count();
    if (availableCount === 0) {
        return;
    }

    const checkbox = checkboxes.first();
    await checkbox.check();

    const leadId = await checkbox.getAttribute('data-id');
    expect(leadId).toBeTruthy();

    const toolbar = page.locator('.list-buttons-container');
    await toolbar.locator('.actions .actions-button:visible').click();

    const removeOption = toolbar.locator('.actions-menu:visible a[data-action="remove"]').first();
    await removeOption.waitFor({ state: 'visible' });
    await removeOption.click();

    const confirmModal = page.locator('.dialog-confirm.modal.in');
    await confirmModal.waitFor({ state: 'visible' });
    await confirmModal.locator('button[data-name="confirm"]').click();
    await confirmModal.waitFor({ state: 'hidden' });

    const isExist = await db.isAnyExists('lead', 'id', [leadId!]);
    expect(isExist).toBe(false);
});
