import { type Page, expect } from '@playwright/test';

/** Sayfanın tam yüklenmesini bekle (hydration + LCP) */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Next.js hydration tamamlanana kadar bekle
  await page.waitForFunction(() => document.readyState === 'complete');
}

/** Dark mode class'ının `<html>` üzerinde olup olmadığını kontrol et */
export async function isDarkMode(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.classList.contains('dark'));
}

/** Sayfanın belirli bir metni içerdiğini doğrula */
export async function expectText(page: Page, text: string) {
  await expect(page.locator(`text=${text}`).first()).toBeVisible();
}

/** Navbar linkleri helper */
export const NAV_LINKS = [
  { label: 'Tokenomics', href: '/tokenomics' },
  { label: 'Roadmap',    href: '/roadmap' },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Docs',       href: '/docs' },
  { label: 'Dashboard',  href: '/dashboard' },
  { label: 'Staking',    href: '/staking' },
  { label: 'Vesting',    href: '/vesting' },
  { label: 'Governance', href: '/governance' },
  { label: 'Treasury',   href: '/treasury' },
] as const;
