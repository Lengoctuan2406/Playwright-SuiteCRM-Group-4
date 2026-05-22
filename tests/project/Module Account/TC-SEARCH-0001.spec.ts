import { test, expect } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";

// Sử dụng storageState cho Test này
test.use({
    storageState: CONFIG.COMMON.STORAGE_PATH 
});

// Dùng test.describe để gom nhóm các test case của module Accounts
test.describe('TC-SEARCH-0001: Kiểm tra Show Data với các Filter sau: All, Starred, Recently Created, Only Me, Followed', () => {
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

    test("Kiểm tra Show Data với các Filter sau: All", async ({
        page,
    }) => {
        // Mở Filter trong thanh Search và Click vào All
        await accountsPage.clickFilter("All");
        // Load dữ liệu bằng Show More đến khi đủ và cộng Data lại
        const UItotal = await accountsPage.countAllRows();
        // Lấy dữ liệu thực tế dưới DB để check với giao diện
        const accounts = await db.query(`SELECT COUNT(id) total 
            FROM account 
            WHERE deleted = 0`);
        // Kiểm tra dữ liệu trên UI và DB có khớp nhau không
        await expect(UItotal).toBe(accounts[0].total);
    });

    test("Kiểm tra Show Data với các Filter sau: Starred", async ({
        page,
    }) => {
        // Mở Filter trong thanh Search và Click vào Starred
        await accountsPage.clickFilter("Starred");
        // Load dữ liệu bằng Show More đến khi đủ và cộng Data lại
        const UItotal = await accountsPage.countAllRows();
        // Lấy dữ liệu thực tế dưới DB để check với giao diện
        const accounts = await db.query(`SELECT COUNT(id) AS total 
            FROM account 
            WHERE deleted = 0 
            AND id IN (
                SELECT entity_id 
                FROM star_subscription 
                WHERE entity_type = 'Account' 
                AND deleted = 0
            );`);
        // Kiểm tra dữ liệu trên UI và DB có khớp nhau không
        await expect(UItotal).toBe(accounts[0].total);
    });
});