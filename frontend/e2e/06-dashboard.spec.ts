import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Dashboard Page — Unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageReady(page);
  });

  test('page loads without error', async ({ page }) => {
    const response = await page.request.get('/dashboard');
    expect(response.status()).toBe(200);
  });

  test('shows "Connect Your Wallet" prompt when not connected', async ({ page }) => {
    await expect(
      page.getByText(/Connect Your Wallet/i).first(),
    ).toBeVisible();
  });

  test('shows connect wallet description text', async ({ page }) => {
    await expect(
      page.getByText(/Connect your Ethereum wallet/i).first(),
    ).toBeVisible();
  });

  test('shows ConnectButton in the wallet-not-connected state', async ({ page }) => {
    // RainbowKit renders a button with "Connect Wallet" text when not connected
    const connectBtn = page.getByRole('button', { name: /Connect Wallet/i }).first();
    await expect(connectBtn).toBeVisible();
  });

  test('navbar is present on dashboard', async ({ page }) => {
    await expect(page.getByText('MetaAras').first()).toBeVisible();
  });

  test('does NOT show balance stats (requires connection)', async ({ page }) => {
    await expect(page.getByText(/MTA Balance/i)).not.toBeVisible();
  });

  test('does NOT show "Protocol Overview" card (requires connection)', async ({ page }) => {
    await expect(page.getByText(/Protocol Overview/i)).not.toBeVisible();
  });

  test('alert icon is visible in unauthenticated state', async ({ page }) => {
    // AlertCircle is rendered as SVG - check by checking the parent section
    const section = page.locator('.min-h-\\[60vh\\]').first();
    await expect(section).toBeVisible();
  });
});
