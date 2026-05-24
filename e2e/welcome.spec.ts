import { test, expect } from '@playwright/test';
import { resetApp, waitForWelcomePage } from './helpers';

test.describe('Welcome Page', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await waitForWelcomePage(page);
  });

  test('displays the Cinder brand title', async ({ page }) => {
    await expect(page.locator('.welcome-title')).toHaveText('Cinder');
  });

  test('displays the app icon', async ({ page }) => {
    const logo = page.locator('.welcome-logo');
    await expect(logo).toBeVisible();
  });

  test('shows "New Workspace" button', async ({ page }) => {
    const btn = page.getByTestId('welcome-create-new');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('New Workspace');
  });

  test('shows "Open Folder" button', async ({ page }) => {
    const btn = page.getByTestId('welcome-open-folder');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('Open Folder');
  });

  test('New Workspace button has description text', async ({ page }) => {
    const btn = page.getByTestId('welcome-create-new');
    await expect(btn).toContainText('Create a fresh folder for your notes');
  });

  test('Open Folder button has description text', async ({ page }) => {
    const btn = page.getByTestId('welcome-open-folder');
    await expect(btn).toContainText('Open an existing folder as workspace');
  });

  test('shows keyboard shortcut hint', async ({ page }) => {
    const hint = page.getByTestId('welcome-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toContainText('to open a folder anytime');
  });

  test('does not show recent workspaces on fresh state', async ({ page }) => {
    const recents = page.getByTestId('recent-workspace');
    await expect(recents).toHaveCount(0);
  });

  test('welcome page has correct layout structure', async ({ page }) => {
    // Brand section exists
    await expect(page.locator('.welcome-brand')).toBeVisible();
    // Actions section exists
    await expect(page.locator('.welcome-actions')).toBeVisible();
  });
});
