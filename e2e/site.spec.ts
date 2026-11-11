import { expect, test } from '@playwright/test';

const toolSlugs = [
  'compress-image',
  'resize-image',
  'crop-image',
  'convert-image',
  'photo-editor',
  'remove-background',
  'upscale-image',
  'watermark-image',
  'meme-generator',
  'rotate-image',
];

test('homepage exposes the ten image tools', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Make every image/ })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(10);
});

test('legacy HTML tool URLs resolve and expose a file picker', async ({ page }) => {
  for (const slug of toolSlugs) {
    await page.goto(`/tools/${slug}.html`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose image' })).toBeVisible();
  }
});

test('sample image can be cropped in the browser and previewed', async ({ page }) => {
  await page.goto('/tools/crop-image.html');
  await page.getByRole('button', { name: 'Use sample image' }).click();
  await expect(page.getByText('xconvert-sample.jpg')).toBeVisible();
  await page.getByRole('button', { name: 'Apply and preview' }).click();
  await expect(page.locator('.status--success')).toContainText('768 × 512 px', { timeout: 20_000 });
});

test('theme switch and mobile navigation work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole('button', { name: 'More' }).click();
  await expect(mobileNav.getByRole('link', { name: 'About' })).toBeVisible();
});
