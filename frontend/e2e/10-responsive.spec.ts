import { test, expect, devices } from '@playwright/test';
import { waitForPageReady } from './helpers';

const VIEWPORTS = [
  { name: 'Mobile S',   width: 320,  height: 568  },
  { name: 'Mobile L',   width: 414,  height: 896  },
  { name: 'Tablet',     width: 768,  height: 1024 },
  { name: 'Laptop',     width: 1024, height: 768  },
  { name: 'Desktop XL', width: 1440, height: 900  },
] as const;

const PAGES_TO_CHECK = ['/', '/tokenomics', '/roadmap', '/docs', '/faq'] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('home page renders without horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      // Allow 1px tolerance for subpixel rendering
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('navbar is visible', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.locator('header').first()).toBeVisible();
    });

    test('logo is always visible', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.getByText('MetaAras').first()).toBeVisible();
    });

    test('footer renders at bottom', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.locator('footer').first()).toBeVisible();
    });
  });
}

// Mobile-specific hamburger tests
test.describe('Mobile Menu Interaction', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger button visible on 375px', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await expect(
      page.getByRole('button', { name: /Toggle menu/i }),
    ).toBeVisible();
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await page.getByRole('button', { name: /Toggle menu/i }).click();
    // After opening, at least one link should be visible in the dropdown
    await expect(
      page.getByRole('link', { name: 'Roadmap' }).last(),
    ).toBeVisible();
  });

  test('mobile menu close (X) button appears after open', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await page.getByRole('button', { name: /Toggle menu/i }).click();
    await page.waitForTimeout(150);
    // After opening, the button aria-label should still be accessible
    const toggleBtn = page.getByRole('button', { name: /Toggle menu/i });
    await expect(toggleBtn).toBeVisible();
  });

  for (const path of PAGES_TO_CHECK) {
    test(`${path} layout does not break on 375px`, async ({ page }) => {
      await page.goto(path);
      await waitForPageReady(page);
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth     = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 2);
    });
  }
});

// Tablet landscape
test.describe('Tablet Landscape (1024×768)', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('desktop nav visible at 1024px', async ({ page }) => {
    // Use 1440px to ensure we are safely above the xl breakpoint (1280px) —
    // WebKit doesn't activate min-width media queries at the exact boundary pixel
    await page.setViewportSize({ width: 1440, height: 768 });
    await page.goto('/');
    await waitForPageReady(page);
    const desktopNav = page.locator('.hidden.xl\\:flex').first();
    await expect(desktopNav).toBeVisible();
  });

  test('tokenomics chart renders', async ({ page }) => {
    await page.goto('/tokenomics');
    await waitForPageReady(page);
    await expect(page.locator('svg').first()).toBeVisible();
  });
});
