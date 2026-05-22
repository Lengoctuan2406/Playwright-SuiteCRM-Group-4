import { test as crud } from "@playwright/test";
import { LeadsPage } from "../../pages/LeadPage";
import { DatabaseActions } from '../../../src/utils/Database';
import { CONFIG } from "../../../playwright.config";
import { DataFaker } from '../../../src/utils/DataFaker';

crud.use({
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
        slowMo: 0,
    },
    storageState: CONFIG.COMMON.STORAGE_PATH
});

const numberRecords = 30;

crud.describe('Chạy các hàm Create Data mẫu cho Lead', () => {
    let leadsPage: LeadsPage;
    let db: DatabaseActions;
    crud.beforeEach(async ({ page }) => {
        leadsPage = new LeadsPage(page);
        db = new DatabaseActions();
        await leadsPage.redirect();
    });
    crud.afterAll(async () => {
        await db.close();
    });
    crud("Tạo Data mẫu cho Lead", async ({
        page,
    }) => {
        const rows = await db.query<{ amountToCreate: number }>(`
            SELECT GREATEST(? - COUNT(id), 0) AS amountToCreate 
            FROM lead 
            WHERE deleted = 0
        `, [numberRecords]);
        const amountToCreate = rows[0]?.amountToCreate || 0;
        if (amountToCreate === 0) {
            return;
        }
        for (let i = 0; i < amountToCreate; i++) {
            await page.goto("/#Lead/create", { waitUntil: "domcontentloaded" });
            await page.fill('input[data-name="name"]', DataFaker.getFullName());
            await page.fill('input[data-name="website"]', DataFaker.getWebsite());
            await page.fill('.field[data-name="emailAddress"] input.email-address', DataFaker.getEmail());
            await page.fill('textarea[data-name="billingAddressStreet"]', DataFaker.getStreet());
            await page.fill('textarea[data-name="description"]', DataFaker.getTestDes());
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                page.click('button[data-action="save"]')
            ]);
        }
    });

    crud("Tạo Data mẫu cho Lead với Assigned User là Admin", async ({
        page,
    }) => {
        const rows = await db.query<{ amountToCreate: number }>(`
            SELECT GREATEST(? - COUNT(id), 0) AS amountToCreate 
            FROM lead 
            WHERE deleted = 0
            AND assigned_user_id IN (
                SELECT id 
                FROM user 
                WHERE user_name = 'admin' 
                AND deleted = 0
            )
        `, [numberRecords]);
        const amountToCreate = rows[0]?.amountToCreate || 0;
        if (amountToCreate === 0) {
            return;
        }
        for (let i = 0; i < amountToCreate; i++) {
            await page.goto("/#Lead/create", { waitUntil: "domcontentloaded" });
            await page.fill('input[data-name="name"]', DataFaker.getFullName());
            await page.fill('input[data-name="website"]', DataFaker.getWebsite());
            await page.fill('.field[data-name="emailAddress"] input.email-address', DataFaker.getEmail());
            await page.fill('textarea[data-name="billingAddressStreet"]', DataFaker.getStreet());
            await page.fill('textarea[data-name="description"]', DataFaker.getTestDes());
            await page.fill('.field[data-name="assignedUser"] input[data-name="assignedUserName"]', 'Admin');
            await page.locator('.autocomplete-suggestions:visible .autocomplete-suggestion', {
                hasText: 'Admin'
            }).first().click();
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                page.click('button[data-action="save"]')
            ]);
        }
    });
});