import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Tokenomics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tokenomics');
    await waitForPageReady(page);
  });

  test('page title contains Tokenomics', async ({ page }) => {
    await expect(page).toHaveTitle(/Tokenomics.*MetaAras|MetaAras.*Tokenomics/i);
  });

  test('renders main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /MTA.*Tokenomics|Tokenomics/i }).first(),
    ).toBeVisible();
  });

  test('shows "Token Distribution" badge', async ({ page }) => {
    await expect(page.getByText('Token Distribution')).toBeVisible();
  });

  test('renders pie chart container', async ({ page }) => {
    // recharts renders an svg
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('shows all 6 allocation labels', async ({ page }) => {
    // Scope to main content to avoid hidden navbar links (desktop nav hidden on mobile)
    const main = page.locator('main');
    const labels = ['Ecosystem', 'Liquidity', 'Team', 'Treasury', 'Seed', 'Public'];
    for (const label of labels) {
      await expect(main.getByText(label).first()).toBeVisible({ timeout: 8000 });
    }
  });

  test('shows allocation percentages', async ({ page }) => {
    await expect(page.getByText('35%').first()).toBeVisible();
    await expect(page.getByText('20%').first()).toBeVisible();
    await expect(page.getByText('15%').first()).toBeVisible();
  });

  test('shows staking tiers section heading', async ({ page }) => {
    await expect(page.getByText('Staking Tiers')).toBeVisible();
  });

  test('renders all 4 staking tier cards', async ({ page }) => {
    for (const tier of ['Bronze', 'Silver', 'Gold', 'Platinum']) {
      await expect(page.getByText(tier).first()).toBeVisible();
    }
  });

  test('shows correct APY values', async ({ page }) => {
    await expect(page.getByText('8%').first()).toBeVisible();
    await expect(page.getByText('15%').first()).toBeVisible();
    await expect(page.getByText('25%').first()).toBeVisible();
    await expect(page.getByText('40%').first()).toBeVisible();
  });

  test('shows key metrics section', async ({ page }) => {
    await expect(page.getByText('Early Exit Penalty')).toBeVisible();
    await expect(page.getByText('Proposal Threshold')).toBeVisible();
    await expect(page.getByText('Governance Quorum')).toBeVisible();
  });

  test('shows total supply text', async ({ page }) => {
    await expect(page.getByText(/100,000,000|100M/).first()).toBeVisible();
  });

  test('navbar is visible on tokenomics page', async ({ page }) => {
    await expect(page.getByText('MetaAras').first()).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    await expect(
      page.getByText(/All rights reserved/i).first(),
    ).toBeVisible();
  });
});
