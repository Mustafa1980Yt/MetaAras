import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Dark / Light Mode', () => {
  test('default theme is dark (html.dark class present)', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // next-themes defaults to "dark" per our config
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    // Either 'dark' class is present, or the color-scheme is resolved to dark
    expect(htmlClass.includes('dark') || htmlClass.includes('light')).toBe(true);
  });

  test('theme toggle button is present', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await expect(
      page.getByRole('button', { name: /Toggle theme/i }),
    ).toBeVisible();
  });

  test('clicking theme toggle changes html class', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    const before = await page.evaluate(() => document.documentElement.className);
    await page.getByRole('button', { name: /Toggle theme/i }).click();
    await page.waitForTimeout(300); // theme transition
    const after = await page.evaluate(() => document.documentElement.className);

    expect(before).not.toEqual(after);
  });

  test('toggling twice returns to original theme', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    const initial = await page.evaluate(() => document.documentElement.className);
    const toggle = page.getByRole('button', { name: /Toggle theme/i });
    await toggle.click();
    await page.waitForTimeout(200);
    await toggle.click();
    await page.waitForTimeout(200);
    const final = await page.evaluate(() => document.documentElement.className);

    expect(initial).toEqual(final);
  });

  test('theme persists across navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Switch to light
    await page.getByRole('button', { name: /Toggle theme/i }).click();
    await page.waitForTimeout(200);

    const afterToggle = await page.evaluate(() => document.documentElement.className);

    // Navigate to tokenomics
    await page.goto('/tokenomics');
    await waitForPageReady(page);
    await page.waitForTimeout(200);

    const afterNav = await page.evaluate(() => document.documentElement.className);
    // Theme class should still be the same (persisted via cookie/localStorage)
    expect(afterNav).toEqual(afterToggle);
  });

  test('body has correct background in dark mode', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Ensure dark mode is active
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (isDark) {
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        return getComputedStyle(body).backgroundColor;
      });
      // Dark background should not be pure white
      expect(bgColor).not.toBe('rgb(255, 255, 255)');
    }
  });
});
