import { test, expect } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";

// Sử dụng storageState cho Test này
test.use({
    storageState: CONFIG.COMMON.STORAGE_PATH 
});

// Dùng test.describe để gom nhóm các test case của module Accounts
test.describe('TC-SEARCH-0004: Kiểm tra tính năng chọn nhiều và thực hiện các Options như: Remove, Merge, Mass Update,...', () => {
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

    test("Kiểm tra Remove hàng loạt", async ({
        page,
    }) => {
        // remove 5 records đầu tiên
        const ids = await accountsPage.removeSelectTops(5);
        // Kiểm tra xem 5 ID này còn tồn tại bản ghi nào không, không thì test success
        const isExist = await db.isAnyExists('account', 'id', ids);
        expect(isExist).toBe(false);
    });
});