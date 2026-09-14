import { firefox } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.TAVREX_VERIFY_URL || 'http://127.0.0.1:5173';
await mkdir('/tmp/tavrex-qa', { recursive: true });
const browser = await firefox.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  const response = await page.goto(`${baseURL}/app`);
  await page
    .getByRole('heading', { name: 'Your conversations. All connected.' })
    .waitFor();
  await page.screenshot({
    path: '/tmp/tavrex-qa/dashboard-desktop.png',
    fullPage: true,
  });
  await page
    .locator('.meeting-row')
    .filter({ hasText: 'A simpler first five minutes' })
    .click();
  await page.getByRole('heading', { name: 'Meeting overview' }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'Meeting overview' }).waitFor();
  await page.screenshot({
    path: '/tmp/tavrex-qa/meeting-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/app`);
  await page
    .getByRole('heading', { name: 'Your conversations. All connected.' })
    .waitFor();
  await page.screenshot({
    path: '/tmp/tavrex-qa/dashboard-mobile.png',
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  if (response.status() !== 200 || overflow)
    throw new Error('Reviewer entry failed HTTP/layout checks');
  console.log(
    JSON.stringify({
      baseURL,
      status: response.status(),
      cleanContext: true,
      mobileOverflow: overflow,
      screenshots: '/tmp/tavrex-qa',
    }),
  );
} finally {
  await browser.close();
}
