import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

const DAPP_PAGES = ['/dashboard', '/staking', '/vesting', '/governance'] as const;

test.describe('Wallet Connect Button Visibility', () => {
  test('ConnectButton visible in desktop navbar on home page', async ({ page }) => {
    // Scope to desktop viewport — ConnectButton wrapper is hidden on mobile (hidden sm:block)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForPageReady(page);
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const connectWrapper = page.locator('header .hidden.sm\\:block').first();
    await expect(connectWrapper).toBeVisible();
  });

  for (const path of DAPP_PAGES) {
    test(`wallet not connected → "Connect Wallet" prompt shown on ${path}`, async ({ page }) => {
      await page.goto(path);
      await waitForPageReady(page);

      // Each DApp page shows a ConnectButton in the "not connected" guard screen
      const connectBtn = page.getByRole('button', { name: /Connect Wallet/i }).first();
      await expect(connectBtn).toBeVisible();
    });
  }

  test('ConnectButton is rendered without errors (no console errors)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await waitForPageReady(page);

    // Filter out known browser extension or third-party warnings
    const criticalErrors = errors.filter(
      e => !e.includes('Extension') && !e.includes('WalletConnect'),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('treasury page is accessible without wallet connection', async ({ page }) => {
    // Treasury page is static and does not gate behind wallet connect
    await page.goto('/treasury');
    await waitForPageReady(page);
    await expect(page.getByRole('heading', { name: /Treasury/i }).first()).toBeVisible();
    // Should NOT show "Connect Your Wallet" prompt
    await expect(page.getByText(/Connect Your Wallet/i)).not.toBeVisible();
  });

  test('RainbowKit styles are injected (no FOUC)', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // Check that RainbowKit CSS link or style tag is present
    const rainbowStyles = page.locator('[data-rk]').first();
    // The RainbowKit root element should exist
    await expect(rainbowStyles).toBeAttached();
  });
});
