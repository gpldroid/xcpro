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
  await expect(page.getByRole('heading', { name: /Everything you need to edit images online/ })).toBeVisible();
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
  await page.goto('/tools/convert-image.html');
  await expect(mobileNav.locator('.is-active')).toHaveCount(1);
  await mobileNav.getByRole('button', { name: 'More' }).click();
  await expect(mobileNav.locator('.is-active')).toHaveCount(1);
  await expect(mobileNav.getByRole('link', { name: 'About' })).toBeVisible();
});


test('text and interactive color tokens meet WCAG AA contrast in both themes', async ({ page }) => {
  const contrast = (foreground: string, background: string) => {
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
      const linear = channels.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const a = luminance(foreground);
    const b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };

  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => {
      (element as HTMLElement).dataset.theme = value;
    }, theme);
    const tokens = await page.locator('html').evaluate((element) => {
      const styles = getComputedStyle(element);
      return Object.fromEntries(['--muted', '--bg', '--surface', '--surface-soft', '--brand', '--brand-button', '--success', '--danger']
        .map((name) => [name, styles.getPropertyValue(name).trim()]));
    });
    const resolve = (name: string) => tokens[name];
    const rgb = (hex: string) => {
      const value = hex.replace('#', '');
      return `rgb(${parseInt(value.slice(0,2),16)}, ${parseInt(value.slice(2,4),16)}, ${parseInt(value.slice(4,6),16)})`;
    };
    for (const surface of ['--bg', '--surface', '--surface-soft']) {
      expect(contrast(rgb(resolve('--muted')), rgb(resolve(surface))), `${theme}: muted text on ${surface}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rgb(resolve('--brand')), rgb(resolve(surface))), `${theme}: brand text on ${surface}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rgb(resolve('--success')), rgb(resolve(surface))), `${theme}: success text on ${surface}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rgb(resolve('--danger')), rgb(resolve(surface))), `${theme}: error text on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast('rgb(255, 255, 255)', rgb(resolve('--brand-button'))), `${theme}: primary button text`).toBeGreaterThanOrEqual(4.5);
  }
});
