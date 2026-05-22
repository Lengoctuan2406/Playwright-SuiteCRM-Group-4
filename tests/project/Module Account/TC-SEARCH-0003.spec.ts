import { test, expect } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";

// Sử dụng storageState cho Test này
test.use({
    storageState: CONFIG.COMMON.STORAGE_PATH 
});

// Dùng test.describe để gom nhóm các test case của module Accounts
test.describe('TC-SEARCH-0003: Kiểm tra thanh Search', () => {
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

    test("Kiểm tra thanh Search", async ({
        page,
    }) => {
        const key_search = await db.query<{ name: string }>(`SELECT name 
            FROM account 
            ORDER BY RAND()
            LIMIT 1`);
        // Mở Filter trong thanh Search và Click vào All
        await accountsPage.seachingInput(key_search[0].name);
        // Load dữ liệu bằng Show More đến khi đủ và cộng Data lại
        const UItotal = await accountsPage.countAllRows();
        // Lấy dữ liệu thực tế dưới DB để check với giao diện
        const accounts = await db.query(`SELECT COUNT(id) total 
            FROM account 
            WHERE deleted = 0
            AND name LIKE '%`+ key_search[0].name +`%'`);
        // Kiểm tra dữ liệu trên UI và DB có khớp nhau không
        await expect(UItotal).toBe(accounts[0].total);
    });
});