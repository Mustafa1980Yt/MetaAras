import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
  });

  test('page loads with 200 status', async ({ page }) => {
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);
  });

  test('shows MetaAras brand name in navbar', async ({ page }) => {
    await expect(page.getByText('MetaAras').first()).toBeVisible();
  });

  test('shows hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /The Future of/i }).first(),
    ).toBeVisible();
  });

  test('shows "Web3 Governance" gradient text', async ({ page }) => {
    await expect(page.getByText(/Web3 Governance/i).first()).toBeVisible();
  });

  test('shows hero description paragraph', async ({ page }) => {
    await expect(
      page.getByText(/MetaAras \(MTA\) combines tiered staking/i).first(),
    ).toBeVisible();
  });

  test('shows "Start Staking" CTA button', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /Start Staking/i }).first(),
    ).toBeVisible();
  });

  test('shows "View Tokenomics" button', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /View Tokenomics/i }).first(),
    ).toBeVisible();
  });

  test('shows hero stats row (100M MTA)', async ({ page }) => {
    await expect(page.getByText('100M MTA').first()).toBeVisible();
  });

  test('shows 40% max staking APY stat', async ({ page }) => {
    await expect(page.getByText('40%').first()).toBeVisible();
  });

  test('shows three feature cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Battle-Tested Security' }).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('heading', { name: 'Tiered Staking' }).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('heading', { name: 'On-Chain Governance' }).first()).toBeVisible({ timeout: 8000 });
  });

  test('footer renders with copyright', async ({ page }) => {
    await expect(
      page.getByText(/MetaAras. All rights reserved/i).first(),
    ).toBeVisible();
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/MetaAras/);
  });

  test('"Start Staking" link points to /staking', async ({ page }) => {
    const link = page.getByRole('link', { name: /Start Staking/i }).first();
    await expect(link).toHaveAttribute('href', '/staking');
  });

  test('"View Tokenomics" link points to /tokenomics', async ({ page }) => {
    const link = page.getByRole('link', { name: /View Tokenomics/i }).first();
    await expect(link).toHaveAttribute('href', '/tokenomics');
  });
});
