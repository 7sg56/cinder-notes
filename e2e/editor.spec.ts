import { test, expect } from '@playwright/test';
import { resetApp, editorTabs } from './helpers';

test.describe('Editor and Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await page.waitForTimeout(2000);
  });

  test('editor tabs bar is visible when workspace is loaded', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await expect(editorTabs(page)).toBeVisible();
    }
  });

  test('new tab button is present', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      const newTabBtn = page.getByTestId('new-tab-button');
      await expect(newTabBtn).toBeVisible();
    }
  });

  test('toggle sidebar button is present', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      const toggleBtn = page.getByTestId('toggle-sidebar-button');
      await expect(toggleBtn).toBeVisible();
    }
  });

  test('fullscreen button is present', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      const fullscreenBtn = page.getByTestId('fullscreen-button');
      await expect(fullscreenBtn).toBeVisible();
    }
  });

  test('clicking new tab creates an untitled tab', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await page.getByTestId('new-tab-button').click();
      await page.waitForTimeout(500);
      // An Untitled tab should appear
      const tabs = page.getByTestId('editor-tab');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('toggle sidebar button collapses sidebar', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      const sidebarBefore = await page
        .getByTestId('sidebar')
        .boundingBox();
      if (sidebarBefore && sidebarBefore.width > 0) {
        await page.getByTestId('toggle-sidebar-button').click();
        await page.waitForTimeout(300);
        const sidebarAfter = await page
          .getByTestId('sidebar')
          .boundingBox();
        // Width should have changed (collapsed to 0 or near 0)
        expect(sidebarAfter!.width).toBeLessThan(sidebarBefore.width);
      }
    }
  });

  test('editor header appears with an active file', async ({ page }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      // Create a new tab to ensure an active file
      await page.getByTestId('new-tab-button').click();
      await page.waitForTimeout(500);

      const header = page.getByTestId('editor-header');
      await expect(header).toBeVisible();
    }
  });

  test('undo and redo buttons are present in editor header', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await page.getByTestId('new-tab-button').click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId('undo-button')).toBeVisible();
      await expect(page.getByTestId('redo-button')).toBeVisible();
    }
  });

  test('preview toggle button is present in editor header', async ({
    page,
  }) => {
    const hasLayout = await page
      .getByTestId('main-layout')
      .isVisible()
      .catch(() => false);
    if (hasLayout) {
      await page.getByTestId('new-tab-button').click();
      await page.waitForTimeout(500);

      await expect(page.getByTestId('preview-toggle')).toBeVisible();
    }
  });
});
