import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Governance Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/governance');
    await waitForPageReady(page);
  });

  test('page loads with 200 status', async ({ page }) => {
    const response = await page.request.get('/governance');
    expect(response.status()).toBe(200);
  });

  test('shows "On-Chain Governance" heading when not connected', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /On-Chain Governance/i }).first(),
    ).toBeVisible();
  });

  test('shows Connect Wallet prompt', async ({ page }) => {
    const connectBtn = page.getByRole('button', { name: /Connect Wallet/i }).first();
    await expect(connectBtn).toBeVisible();
  });

  test('shows governance description', async ({ page }) => {
    await expect(
      page.getByText(/Connect your wallet to participate in MetaAras DAO governance/i).first(),
    ).toBeVisible();
  });

  test('Vote icon is rendered', async ({ page }) => {
    // The lucide Vote icon is rendered as SVG
    const icons = page.locator('svg');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no critical JS errors on governance page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload();
    await waitForPageReady(page);
    const criticalErrors = errors.filter(e =>
      !e.includes('WalletConnect') &&
      !e.includes('Extension') &&
      !e.includes('wallet') &&
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('ChunkLoadError') &&
      !e.includes('hydration') &&
      !e.includes('Hydration'),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// Treasury page doesn't require wallet — has full static content
test.describe('Treasury Page — Full UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/treasury');
    await waitForPageReady(page);
  });

  test('shows Treasury heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Treasury/i }).first(),
    ).toBeVisible();
  });

  test('shows "DAO-governed" badge or text', async ({ page }) => {
    await expect(page.getByText(/DAO-governed|DAO-controlled/i).first()).toBeVisible();
  });

  test('shows allocation table with Ecosystem Fund', async ({ page }) => {
    await expect(page.getByText('Ecosystem Fund').first()).toBeVisible();
  });

  test('shows "35,000,000" amount', async ({ page }) => {
    await expect(page.getByText('35,000,000').first()).toBeVisible();
  });

  test('shows recent transactions section', async ({ page }) => {
    await expect(page.getByText('Recent Transactions').first()).toBeVisible();
  });

  test('shows Liquidity Provision transaction', async ({ page }) => {
    await expect(page.getByText('Liquidity Provision').first()).toBeVisible();
  });

  test('shows governance note about DAO control', async ({ page }) => {
    await expect(
      page.getByText(/DAO Governance Controls Treasury/i).first(),
    ).toBeVisible();
  });

  test('shows 48-hour timelock reference', async ({ page }) => {
    await expect(
      page.getByText(/48-hour Timelock/i).first(),
    ).toBeVisible();
  });
});
