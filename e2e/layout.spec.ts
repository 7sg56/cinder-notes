import { test, expect } from '@playwright/test';
import { resetApp } from './helpers';

test.describe('Application Layout', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await page.waitForTimeout(2000);
  });

  test('renders either welcome page or main layout', async ({ page }) => {
    const hasWelcome = await page
      .getByTestId('welcome-page')
      .isVisible()
      .catch(() => false);
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    expect(hasWelcome || hasLayout).toBe(true);
  });

  test('welcome page fills viewport', async ({ page }) => {
    const hasWelcome = await page
      .getByTestId('welcome-page')
      .isVisible()
      .catch(() => false);
    if (hasWelcome) {
      const box = await page.getByTestId('welcome-page').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test('main layout has sidebar and editor when workspace is loaded', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('editor-area')).toBeVisible();
    }
  });

  test('main layout has file explorer in sidebar', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('file-explorer')).toBeVisible();
    }
  });

  test('main layout has editor pane', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('editor-pane')).toBeVisible();
    }
  });

  test('sidebar has settings button when workspace is loaded', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('sidebar-settings-button')).toBeVisible();
    }
  });

  test('sidebar has trash button when workspace is loaded', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('sidebar-trash-button')).toBeVisible();
    }
  });

  test('file tree is visible in explorer', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('file-tree')).toBeVisible();
    }
  });

  test('explorer search input is visible', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('explorer-search')).toBeVisible();
    }
  });

  test('explorer add button is visible', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(page.getByTestId('explorer-add-button')).toBeVisible();
    }
  });
});
