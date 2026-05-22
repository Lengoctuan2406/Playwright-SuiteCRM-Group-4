import { test, expect } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";
import { DataFaker } from '../../../src/utils/DataFaker';

// Sử dụng storageState cho Test này
test.use({
    storageState: CONFIG.COMMON.STORAGE_PATH
});

// Dùng test.describe để gom nhóm các test case của module Accounts
test.describe('TC-RELATIONSHIP-0001: Kiểm tra Create mới Relationship với Contacts', () => {
    // Khởi tạo các biến dùng chung
    let accountsPage: AccountsPage;
    let db: DatabaseActions;

    // Chạy trước mỗi test case trong group này
    test.beforeEach(async ({ page }) => {
        accountsPage = new AccountsPage(page);
        db = new DatabaseActions();
        await accountsPage.redirect();
    });

    // Chạy sau khi tất cả các test case trong group này hoàn thành
    test.afterAll(async () => {
        await db.close();
    });

    test("Kiểm tra Create Account với Required Fields", async ({
        page,
    }) => {
        const website = DataFaker.getWebsite();
        await page.goto("/#Account/create", { waitUntil: "domcontentloaded" });
        await page.fill('input[data-name="website"]', website);
        await page.fill('.field[data-name="emailAddress"] input.email-address', DataFaker.getEmail());
        await page.fill('textarea[data-name="billingAddressStreet"]', DataFaker.getStreet());
        await page.fill('textarea[data-name="description"]', CONFIG.ENV.TEST_KEY);
        await page.click('button[data-action="save"]')
        // Kiểm tra có Create không
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toContain('/#Account/create');
        // Kiểm tra cả dưới DB
        const isExist = await db.isAnyExists('account', 'website', [website]);
        expect(isExist).toBe(false);
    });
});