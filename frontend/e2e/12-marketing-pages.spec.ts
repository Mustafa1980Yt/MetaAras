import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers';

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
    await waitForPageReady(page);
  });

  test('page title contains FAQ or MetaAras', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/FAQ|MetaAras/i);
  });

  test('shows "Frequently Asked Questions" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Frequently Asked Questions/i }).first(),
    ).toBeVisible();
  });

  test('shows "Help Center" badge', async ({ page }) => {
    await expect(page.getByText('Help Center')).toBeVisible();
  });

  test('renders at least 5 FAQ items', async ({ page }) => {
    // Each FAQ is a Card — count headings within cards
    const h2s = page.locator('h2');
    const count = await h2s.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('first FAQ about MetaAras identity is visible', async ({ page }) => {
    await expect(
      page.getByText(/What is MetaAras/i).first(),
    ).toBeVisible();
  });

  test('FAQ about total supply is present', async ({ page }) => {
    await expect(
      page.getByText(/total MTA supply/i).first(),
    ).toBeVisible();
  });

  test('FAQ about staking is present', async ({ page }) => {
    await expect(
      page.getByText(/How does staking work/i).first(),
    ).toBeVisible();
  });

  test('security/audit FAQ is present', async ({ page }) => {
    await expect(
      page.getByText(/Is the protocol audited/i).first(),
    ).toBeVisible();
  });
});

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await waitForPageReady(page);
  });

  test('shows "Contact Us" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Contact.*Us|Us.*Contact/i }).first(),
    ).toBeVisible();
  });

  test('shows "Get In Touch" badge', async ({ page }) => {
    await expect(page.getByText('Get In Touch')).toBeVisible();
  });

  test('contact form is rendered', async ({ page }) => {
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('Name field is present', async ({ page }) => {
    await expect(
      page.getByLabel('Name').first(),
    ).toBeVisible();
  });

  test('Email field is present', async ({ page }) => {
    await expect(
      page.getByLabel('Email').first(),
    ).toBeVisible();
  });

  test('Message textarea is present', async ({ page }) => {
    await expect(
      page.getByLabel('Message').first(),
    ).toBeVisible();
  });

  test('Subject select is present', async ({ page }) => {
    await expect(
      page.getByLabel('Subject').first(),
    ).toBeVisible();
  });

  test('Send Message button is present', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Send Message/i }).first(),
    ).toBeVisible();
  });

  test('form submission shows success state', async ({ page }) => {
    await page.getByLabel('Name').fill('Playwright Test');
    await page.getByLabel('Email').fill('test@playwright.dev');
    await page.getByLabel('Message').fill('This is an automated E2E test message.');
    await page.getByRole('button', { name: /Send Message/i }).click();
    // Success state appears after 1.2s mock delay
    await expect(
      page.getByText(/Message sent!/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('"Send another" button appears after form success', async ({ page }) => {
    await page.getByLabel('Name').fill('Test');
    await page.getByLabel('Email').fill('t@t.com');
    await page.getByLabel('Message').fill('msg');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(
      page.getByRole('button', { name: /Send another/i }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('"Send another" resets form', async ({ page }) => {
    await page.getByLabel('Name').fill('Test');
    await page.getByLabel('Email').fill('t@t.com');
    await page.getByLabel('Message').fill('msg');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await page.getByRole('button', { name: /Send another/i }).click({ timeout: 5000 });
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('shows email channel info', async ({ page }) => {
    await expect(page.getByText(/hello@metaaras.io/).first()).toBeVisible();
  });

  test('shows security reports note', async ({ page }) => {
    await expect(page.getByText(/Security Reports/i).first()).toBeVisible();
  });
});

test.describe('Whitepaper Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/whitepaper');
    await waitForPageReady(page);
  });

  test('shows Whitepaper heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Whitepaper/i }).first(),
    ).toBeVisible();
  });

  test('shows version badge', async ({ page }) => {
    await expect(page.getByText(/v[12]\.\d/i).first()).toBeVisible();
  });

  test('shows Introduction section', async ({ page }) => {
    await expect(page.getByText(/1\. Introduction/).first()).toBeVisible();
  });

  test('shows download button (disabled)', async ({ page }) => {
    const downloadBtn = page.getByRole('button', { name: /Download PDF/i }).first();
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeDisabled();
  });

  test('shows disclaimer text', async ({ page }) => {
    await expect(page.getByText(/Disclaimer/i).first()).toBeVisible();
  });
});
