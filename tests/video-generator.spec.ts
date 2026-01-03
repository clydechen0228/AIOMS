import { test, expect } from '@playwright/test';

test('test application and generate video', async ({ page }) => {
    // 1. Dashboard
    await page.goto('/', { timeout: 60000 });
    // Wait for any content to ensure main app loaded
    await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for hydration

    // 2. Orders
    await page.click('text=Orders');
    await expect(page.getByText('All Orders')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // 3. View Order Details (Order #1)
    await page.click('a[href="/orders/1"]');
    await expect(page.getByText('Order #1')).toBeVisible();

    // Scroll to logs if present
    const logsSection = page.getByText('AI Agent Activity Log');
    if (await logsSection.isVisible()) {
        await logsSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
    } else {
        console.log('Logs section not found, skipping scroll');
    }

    // 4. Products - Add Product
    await page.click('text=Products');
    await page.click('text=Add Product');
    await page.fill('input[placeholder="e.g. L-Leucine"]', 'Automated Test Product');
    await page.fill('input[placeholder="e.g. 61-90-5"]', '00-00-0');
    await page.fill('input[placeholder="e.g. 99.0%"]', '99.9%');
    await page.click('text=Save Product');
    await expect(page.getByText('Product saved successfully')).toBeVisible();
    await page.waitForTimeout(1000);

    // 5. Customers - Add Customer (Not Implemented Check)
    await page.click('text=Customers');
    await page.click('text=Add Customer');
    await expect(page.getByText('Customer management module coming soon')).toBeVisible();
    await page.waitForTimeout(1000);

    // Return to Dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(2000);
});
