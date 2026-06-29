import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('Roadmap Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roadmap');
    await waitForPageReady(page);
  });

  test('page title contains Roadmap', async ({ page }) => {
    await expect(page).toHaveTitle(/Roadmap.*MetaAras|MetaAras.*Roadmap/i);
  });

  test('renders main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Development.*Roadmap|Roadmap/i }).first(),
    ).toBeVisible();
  });

  test('shows "Project Timeline" badge', async ({ page }) => {
    await expect(page.getByText('Project Timeline')).toBeVisible();
  });

  test('renders all 5 phase cards', async ({ page }) => {
    for (const phase of ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5']) {
      await expect(page.getByText(phase).first()).toBeVisible();
    }
  });

  test('Phase 1 is marked as Completed', async ({ page }) => {
    await expect(page.getByText('Completed').first()).toBeVisible();
  });

  test('Phase 2 is marked as In Progress', async ({ page }) => {
    await expect(page.getByText('In Progress').first()).toBeVisible();
  });

  test('shows Phase 1 title "Foundation"', async ({ page }) => {
    await expect(page.getByText('Foundation').first()).toBeVisible();
  });

  test('shows Phase 2 title "Frontend & Dashboard"', async ({ page }) => {
    await expect(page.getByText('Frontend & Dashboard').first()).toBeVisible();
  });

  test('shows Phase 4 "Mainnet Launch"', async ({ page }) => {
    await expect(page.getByText('Mainnet Launch').first()).toBeVisible();
  });

  test('shows Q4 2025 period for Phase 1', async ({ page }) => {
    await expect(page.getByText('Q4 2025').first()).toBeVisible();
  });

  test('shows smart contract content in Phase 1', async ({ page }) => {
    await expect(page.getByText(/97\/97 test coverage/i).first()).toBeVisible();
  });

  test('shows "Ethereum mainnet" in Phase 4', async ({ page }) => {
    await expect(page.getByText(/Ethereum mainnet/i).first()).toBeVisible();
  });

  test('shows description paragraph', async ({ page }) => {
    await expect(
      page.getByText(/transparent.*milestone/i).first(),
    ).toBeVisible();
  });
});
