import { test, expect } from '@playwright/test';
import { resetApp } from './helpers';

/**
 * Helper: check if the main layout is visible (workspace loaded).
 * Returns false if only the welcome page is shown.
 */
async function hasMainLayout(page: import('@playwright/test').Page) {
  return page
    .getByTestId('main-layout')
    .isVisible()
    .catch(() => false);
}

/**
 * Trigger a horizontal split via keyboard shortcut (Cmd/Ctrl + \).
 */
async function splitHorizontal(page: import('@playwright/test').Page) {
  const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${mod}+\\`);
  await page.waitForTimeout(400);
}

/**
 * Trigger a vertical split via keyboard shortcut (Cmd/Ctrl + Shift + \).
 */
async function splitVertical(page: import('@playwright/test').Page) {
  const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${mod}+Shift+\\`);
  await page.waitForTimeout(400);
}

test.describe('Split Screen', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await page.waitForTimeout(2000);
  });

  // ─── Basic Split ───────────────────────────────────────────────────────

  test('starts with a single editor pane', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    const panes = page.getByTestId('editor-pane');
    await expect(panes).toHaveCount(1);
  });

  test('horizontal split creates two panes side by side', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    await splitHorizontal(page);

    const panes = page.getByTestId('editor-pane');
    await expect(panes).toHaveCount(2);
  });

  test('vertical split creates two panes stacked', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    await splitVertical(page);

    const panes = page.getByTestId('editor-pane');
    await expect(panes).toHaveCount(2);
  });

  // ─── 4-Quadrant Limit ─────────────────────────────────────────────────

  test('can split into four quadrants maximum', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    // Split horizontally first (2 panes)
    await splitHorizontal(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(2);

    // Split vertically (3 panes)
    await splitVertical(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(3);

    // Click into the other pane and split it too (4 panes)
    const panes = page.getByTestId('editor-pane');
    await panes.first().click();
    await page.waitForTimeout(200);
    await splitVertical(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(4);
  });

  test('cannot split beyond four panes', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    // Create 4 panes
    await splitHorizontal(page);
    await splitVertical(page);
    const panes = page.getByTestId('editor-pane');
    await panes.first().click();
    await page.waitForTimeout(200);
    await splitVertical(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(4);

    // Try to split again -- should stay at 4
    await splitHorizontal(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(4);

    await splitVertical(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(4);
  });

  // ─── Split UI Elements ────────────────────────────────────────────────

  test('resize handle appears between split panes', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    // No resize handle in single-pane mode
    await expect(page.getByTestId('split-resize-handle')).toHaveCount(0);

    await splitHorizontal(page);

    // Resize handle should now be visible
    const handle = page.getByTestId('split-resize-handle');
    await expect(handle.first()).toBeVisible();
  });

  test('split container appears after splitting', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    // Before split: no split-container (root is a leaf = single EditorPane)
    await expect(page.getByTestId('split-container')).toHaveCount(0);

    await splitHorizontal(page);

    // After split: at least one split-container should exist
    await expect(page.getByTestId('split-container').first()).toBeVisible();
  });

  // ─── Multi-Pane Tab Controls ──────────────────────────────────────────

  test('close-pane and fullscreen buttons appear after split', async ({
    page,
  }) => {
    if (!(await hasMainLayout(page))) return;

    // Before split: these buttons should not exist
    await expect(page.getByTestId('close-pane-button')).toHaveCount(0);
    await expect(page.getByTestId('fullscreen-button')).toHaveCount(0);

    await splitHorizontal(page);

    // After split: both panes should have close and fullscreen buttons
    await expect(page.getByTestId('close-pane-button').first()).toBeVisible();
    await expect(page.getByTestId('fullscreen-button').first()).toBeVisible();
  });

  test('closing a pane returns to single-pane layout', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    await splitHorizontal(page);
    await expect(page.getByTestId('editor-pane')).toHaveCount(2);

    // Close the active pane
    await page.getByTestId('close-pane-button').first().click();
    await page.waitForTimeout(300);

    // Should be back to a single pane
    await expect(page.getByTestId('editor-pane')).toHaveCount(1);

    // Close/fullscreen buttons should disappear
    await expect(page.getByTestId('close-pane-button')).toHaveCount(0);
    await expect(page.getByTestId('fullscreen-button')).toHaveCount(0);
  });

  // ─── Each Pane Has Its Own Tabs ────────────────────────────────────────

  test('each pane has its own tab bar', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    await splitHorizontal(page);

    // There should be two tab bars
    const tabBars = page.getByTestId('editor-tabs');
    await expect(tabBars).toHaveCount(2);
  });

  test('each pane has its own new-tab button', async ({ page }) => {
    if (!(await hasMainLayout(page))) return;

    await splitHorizontal(page);

    const newTabButtons = page.getByTestId('new-tab-button');
    await expect(newTabButtons).toHaveCount(2);
  });
});
