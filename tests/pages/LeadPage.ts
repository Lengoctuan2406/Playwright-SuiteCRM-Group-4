import { Locator, Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";

export class LeadsPage extends LoginPage {
    readonly showMoreButton: Locator;
    readonly listRows: Locator;
    constructor(page: Page) {
        super(page);
        this.showMoreButton = page.locator("a[data-action=\"showMore\"]");
        this.listRows = page.locator(".list-row");
    }

    async redirect(): Promise<void> {
        await this.page.goto("/#Lead", {
            waitUntil: "networkidle"
        });
    }

    async countAllRows(): Promise<number> {
        while (await this.showMoreButton.isVisible()) {
            const currentCount = await this.listRows.count();
            await this.showMoreButton.click();
            await this.page.waitForFunction(
                (oldValue) => document.querySelectorAll(".list-row").length > oldValue,
                currentCount,
            );
        }
        return await this.listRows.count();
    }
}