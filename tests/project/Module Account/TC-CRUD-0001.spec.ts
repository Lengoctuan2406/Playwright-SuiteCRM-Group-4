import { test, expect } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";
import { DataFaker } from '../../../src/utils/DataFaker';

test.use({
    storageState: CONFIG.COMMON.STORAGE_PATH
});

test.describe('TC-CRUD-0001: Kiểm tra Save dữ liệu với tất cả các Fields', () => {
    let accountsPage: AccountsPage;
    let db: DatabaseActions;

    test.beforeEach(async ({ page }) => {
        accountsPage = new AccountsPage(page);
        db = new DatabaseActions();
        await accountsPage.redirect();
    });

    test.afterAll(async () => {
        await db.close();
    });

    test("Kiểm tra Save dữ liệu", async ({
        page,
    }) => {
        await page.goto("/#Account/create", { waitUntil: "domcontentloaded" });
        await page.fill('input[data-name="name"]', DataFaker.getFullName());
        await page.fill('input[data-name="website"]', DataFaker.getWebsite());
        await page.fill('.field[data-name="emailAddress"] input.email-address', DataFaker.getEmail());
        await page.fill('textarea[data-name="billingAddressStreet"]', DataFaker.getStreet());
        await page.fill('textarea[data-name="description"]', DataFaker.getTestDes());
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('button[data-action="save"]')
        ]);
        // Copy id trong URL
        const currentUrl = page.url();
        const match = currentUrl.match(/\/([^/]+)$/);
        const accountId = match ? match[1] : null;
        const isExist = await db.isAnyExists('account', 'id', [accountId]);
        expect(isExist).toBe(true);
    });
});