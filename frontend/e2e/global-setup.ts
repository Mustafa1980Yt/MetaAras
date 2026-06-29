import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const PAGES = [
  '/', '/tokenomics', '/roadmap', '/whitepaper', '/docs',
  '/faq', '/contact', '/dashboard', '/staking', '/vesting',
  '/governance', '/treasury',
];

/**
 * Pre-warm all routes so Turbopack compiles and caches CSS/JS before tests run.
 * Without this, concurrent compilation under test load corrupts Turbopack's CSS output.
 */
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const path of PAGES) {
    try {
      await page.goto(BASE_URL + path, { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    } catch {
      // ignore individual warm-up failures — tests will surface real failures
    }
  }

  await browser.close();
}
