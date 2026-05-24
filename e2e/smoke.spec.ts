import { test, expect } from '@playwright/test';
import { resetApp } from './helpers';

test.describe('Smoke Tests', () => {
  test('app loads without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('page has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/cinder/i);
  });

  test('CSS theme variables are defined', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-primary')
        .trim()
    );
    expect(bgColor.length).toBeGreaterThan(0);
  });

  test('no critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore Tauri-specific errors in browser context
        if (
          !text.includes('__TAURI__') &&
          !text.includes('tauri') &&
          !text.includes('ipc')
        ) {
          errors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });

  test('app renders welcome or workspace view', async ({ page }) => {
    await resetApp(page);
    await page.waitForTimeout(2000);

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
});
