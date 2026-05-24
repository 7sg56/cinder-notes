import { expect, type Page } from '@playwright/test';

/**
 * Reset the app to a clean state by clearing localStorage and reloading.
 */
export async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/**
 * Wait for the welcome page to be visible.
 */
export async function waitForWelcomePage(page: Page) {
  await expect(page.getByTestId('welcome-page')).toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Locate the sidebar element.
 */
export function sidebar(page: Page) {
  return page.getByTestId('sidebar');
}

/**
 * Locate the file explorer element.
 */
export function fileExplorer(page: Page) {
  return page.getByTestId('file-explorer');
}

/**
 * Locate the editor pane element.
 */
export function editorPane(page: Page) {
  return page.getByTestId('editor-pane');
}

/**
 * Locate the editor tabs bar.
 */
export function editorTabs(page: Page) {
  return page.getByTestId('editor-tabs');
}

/**
 * Locate the search modal.
 */
export function searchModal(page: Page) {
  return page.getByTestId('search-modal');
}

/**
 * Open the search panel with keyboard shortcut.
 */
export async function openSearch(page: Page) {
  const isMac = process.platform === 'darwin';
  if (isMac) {
    await page.keyboard.press('Meta+Shift+f');
  } else {
    await page.keyboard.press('Control+Shift+f');
  }
}

/**
 * Click the "New Tab" button in the editor tab bar.
 */
export async function clickNewTab(page: Page) {
  await page.getByTestId('new-tab-button').click();
}

/**
 * Click the explorer add button and select "New Note".
 */
export async function createNewNoteFromExplorer(page: Page) {
  await page.getByTestId('explorer-add-button').click();
  await page.getByTestId('explorer-new-note').click();
}

/**
 * Click the explorer add button and select "New Folder".
 */
export async function createNewFolderFromExplorer(page: Page) {
  await page.getByTestId('explorer-add-button').click();
  await page.getByTestId('explorer-new-folder').click();
}
