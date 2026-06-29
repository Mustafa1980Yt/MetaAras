import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

const MARKETING_LINKS = [
  { label: 'Tokenomics', href: '/tokenomics', heading: /Tokenomics/ },
  { label: 'Roadmap',    href: '/roadmap',    heading: /Roadmap/ },
  { label: 'Whitepaper', href: '/whitepaper', heading: /Whitepaper/ },
  { label: 'Docs',       href: '/docs',       heading: /Documentation/ },
] as const;

const DAPP_LINKS = [
  { label: 'Dashboard',  href: '/dashboard',  heading: /Dashboard|Connect/i },
  { label: 'Staking',    href: '/staking',    heading: /Staking|Connect/i },
  { label: 'Vesting',    href: '/vesting',    heading: /Vesting|Connect/i },
  { label: 'Governance', href: '/governance', heading: /Governance|Connect/i },
  { label: 'Treasury',   href: '/treasury',   heading: /Treasury/ },
] as const;

test.describe('Navbar — Desktop', () => {
  // 1440px: safely above xl breakpoint (1280px) on all browsers including WebKit
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
  });

  test('logo is visible and links to home', async ({ page }) => {
    const logo = page.getByRole('link', { name: /MetaAras/i }).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('theme toggle button is visible', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /Toggle theme/i });
    await expect(toggle).toBeVisible();
  });

  for (const link of MARKETING_LINKS) {
    test(`marketing link "${link.label}" navigates to ${link.href}`, async ({ page }) => {
      // Scope to desktop nav to avoid picking up mobile links
      const desktopNav = page.locator('.hidden.xl\\:flex').first();
      const navLink = desktopNav.getByRole('link', { name: link.label });
      await expect(navLink).toBeVisible();
      await navLink.click();
      // waitForURL handles both sync and async SPA navigation
      await page.waitForURL(`**${link.href}`, { timeout: 20000 });
      await expect(page.getByRole('heading', { name: link.heading }).first()).toBeVisible({ timeout: 8000 });
    });
  }

  for (const link of DAPP_LINKS) {
    test(`dapp link "${link.label}" navigates to ${link.href}`, async ({ page }) => {
      const desktopNav = page.locator('.hidden.xl\\:flex').first();
      const navLink = desktopNav.getByRole('link', { name: link.label });
      await expect(navLink).toBeVisible();
      await navLink.click();
      await page.waitForURL(`**${link.href}`, { timeout: 20000 });
      expect(page.url()).toContain(link.href);
    });
  }

  test('active link gets brand highlight on tokenomics page', async ({ page }) => {
    await page.goto('/tokenomics');
    await waitForPageReady(page);
    // Active link should have brand color class
    const activeLink = page.getByRole('link', { name: 'Tokenomics' }).first();
    const className = await activeLink.getAttribute('class');
    expect(className).toContain('brand');
  });
});

test.describe('Navbar — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    const hamburger = page.getByRole('button', { name: /Toggle menu/i });
    await expect(hamburger).toBeVisible();
  });

  test('desktop nav links are hidden on mobile', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // Desktop nav container should not be visible on mobile
    const desktopNav = page.locator('.hidden.xl\\:flex').first();
    await expect(desktopNav).toBeHidden();
  });

  test('mobile menu opens and shows links', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    const hamburger = page.getByRole('button', { name: /Toggle menu/i });
    await hamburger.click();
    // After click, some nav links should appear
    await expect(page.getByRole('link', { name: 'Tokenomics' }).first()).toBeVisible();
  });

  test('mobile menu closes after clicking a link', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await page.getByRole('button', { name: /Toggle menu/i }).click();
    // Use href-based selector to avoid emoji-prefixed accessible name issues across browsers
    const mobileLink = page.locator('a[href="/tokenomics"]').last();
    await expect(mobileLink).toBeVisible({ timeout: 10000 });
    // Wait for mobile menu animation to complete before clicking
    await page.waitForTimeout(300);
    await mobileLink.click();
    await page.waitForURL('**/tokenomics', { timeout: 15000 });
    expect(page.url()).toContain('/tokenomics');
  });
});
