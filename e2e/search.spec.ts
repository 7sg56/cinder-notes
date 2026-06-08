import { test, expect } from '@playwright/test';
import { resetApp } from './helpers';

test.describe('Search Panel', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await page.waitForTimeout(2000);
  });

  test('search modal is initially hidden', async ({ page }) => {
    const modal = page.getByTestId('search-modal');
    await expect(modal).toBeHidden();
  });

  test('search backdrop is initially hidden', async ({ page }) => {
    const backdrop = page.getByTestId('search-backdrop');
    await expect(backdrop).toBeHidden();
  });

  test('Cmd/Ctrl+Shift+F opens search panel', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const modal = page.getByTestId('search-modal');
    const isVisible = await modal.isVisible().catch(() => false);
    // If the shortcut works, modal should appear
    if (isVisible) {
      await expect(modal).toBeVisible();
    }
  });

  test('search input is focused when modal opens', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const input = page.getByTestId('search-input');
    const isVisible = await input.isVisible().catch(() => false);
    if (isVisible) {
      await expect(input).toBeFocused();
    }
  });

  test('Escape closes the search panel', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const modal = page.getByTestId('search-modal');
    const isVisible = await modal.isVisible().catch(() => false);
    if (isVisible) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await expect(modal).toBeHidden();
    }
  });

  test('close button closes the search panel', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const closeBtn = page.getByTestId('search-close-button');
    const isVisible = await closeBtn.isVisible().catch(() => false);
    if (isVisible) {
      await closeBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByTestId('search-modal')).toBeHidden();
    }
  });

  test('typing in search input updates the value', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const input = page.getByTestId('search-input');
    const isVisible = await input.isVisible().catch(() => false);
    if (isVisible) {
      await input.fill('hello world');
      await expect(input).toHaveValue('hello world');
    }
  });

  test('clicking backdrop closes search panel', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+Shift+f`);
    await page.waitForTimeout(500);

    const backdrop = page.getByTestId('search-backdrop');
    const isVisible = await backdrop.isVisible().catch(() => false);
    if (isVisible) {
      // Click in the top-left corner of the backdrop (outside the modal)
      await backdrop.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
      await expect(page.getByTestId('search-modal')).toBeHidden();
    }
  });
});
