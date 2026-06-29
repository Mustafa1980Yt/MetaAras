import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

const INVALID_ROUTES = [
  '/this-does-not-exist',
  '/dashboard/xyz',
  '/staking/nonexistent-position',
  '/tokenomics/subpage',
  '/admin',
  '/api/secret',
  '/../../etc/passwd',
] as const;

test.describe('404 — Not Found Page', () => {
  for (const route of INVALID_ROUTES) {
    test(`${route} returns 404 status`, async ({ page }) => {
      const response = await page.goto(route);
      // Next.js returns 404 for unknown routes
      expect(response?.status()).toBe(404);
    });
  }

  test('/this-does-not-exist renders not-found UI', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await waitForPageReady(page);

    // Next.js default not-found page or our custom one
    const body = await page.content();
    const isNotFound =
      body.includes('404') ||
      body.includes('Not Found') ||
      body.includes('not found') ||
      body.includes('not-found');
    expect(isNotFound).toBe(true);
  });

  test('404 page does not show blank screen', async ({ page }) => {
    await page.goto('/nonexistent-route');
    await waitForPageReady(page);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });

  test('navigating to valid route from 404 works', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await waitForPageReady(page);
    await page.goto('/');
    await waitForPageReady(page);
    expect(page.url()).toContain('localhost:3000');
    await expect(page.getByText('MetaAras').first()).toBeVisible();
  });

  test('query string on valid route is handled (no 404)', async ({ page }) => {
    const response = await page.goto('/?ref=test&utm_source=playwright');
    expect(response?.status()).toBe(200);
  });

  test('case-sensitive URL — /Tokenomics is 404', async ({ page }) => {
    const response = await page.goto('/Tokenomics');
    // Next.js is case-sensitive; /Tokenomics should be 404
    expect(response?.status()).toBe(404);
  });
});

test.describe('Valid Routes — All return 200', () => {
  const VALID_ROUTES = [
    '/',
    '/tokenomics',
    '/roadmap',
    '/whitepaper',
    '/docs',
    '/faq',
    '/contact',
    '/dashboard',
    '/staking',
    '/vesting',
    '/governance',
    '/treasury',
  ] as const;

  for (const route of VALID_ROUTES) {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }
});
