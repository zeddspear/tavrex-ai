import { expect, test } from '@playwright/test';

// Real provider tests are explicit to bound demo quotas. No traces: upload URLs
// and guest credentials must not be included in test artifacts.
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test('real private upload transcribes, persists, seeks, and remains isolated', async ({
  page,
  browser,
}, testInfo) => {
  test.skip(
    !process.env.TAVREX_INGESTION_LIVE || testInfo.project.name !== 'chromium',
  );
  test.setTimeout(240000);
  await page.goto('/app');
  await page
    .getByRole('link', { name: 'Upload recording', exact: true })
    .click();
  await page
    .getByLabel('Recording file')
    .setInputFiles(
      'apps/web/public/media/recording-walkthrough-optimized.webm',
    );
  await expect(
    page.getByRole('button', { name: 'Upload & transcribe' }),
  ).toBeEnabled();
  await page.getByLabel('Meeting title').fill('Private ingestion verification');
  await page.getByRole('button', { name: 'Upload & transcribe' }).click();
  await expect(page).toHaveURL(/\/app\/meetings\/[a-f0-9-]{36}$/, {
    timeout: 25000,
  });
  const meetingUrl = page.url();
  await expect(
    page.getByRole('heading', { name: 'Private ingestion verification' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByText('AI transcript · Speaker identities are not inferred'),
  ).toBeVisible({ timeout: 175000 });
  await expect(page.locator('.transcript-turn').first()).toBeVisible();
  const recording = page.locator('video');
  await page
    .getByRole('button', { name: 'Play recording', exact: true })
    .click();
  await expect
    .poll(() => recording.evaluate((video) => video.currentTime), {
      timeout: 30000,
    })
    .toBeGreaterThan(0);
  await page
    .getByRole('button', { name: 'Pause recording', exact: true })
    .click();
  const timestamps = page.locator('.transcript-turn .timestamp-button');
  await timestamps.last().click();
  await expect
    .poll(() => recording.evaluate((video) => video.currentTime), {
      timeout: 30000,
    })
    .toBeGreaterThan(60);
  await expect
    .poll(
      () =>
        recording.evaluate((video) => !video.seeking && video.readyState >= 2),
      { timeout: 30000 },
    )
    .toBe(true);
  await expect(
    page.getByText('AI analysis · grounded in your transcript'),
  ).toBeVisible({ timeout: 120000 });
  await page.getByRole('button', { name: /Sales \/ Customer/ }).click();
  await expect(page.locator('.summary-kicker')).toContainText(
    'Sales / Customer',
  );
  await page.reload();
  await expect(
    page.getByText('AI transcript · Speaker identities are not inferred'),
  ).toBeVisible();
  await expect(
    page.getByText('AI analysis · grounded in your transcript'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Open public view/ }),
  ).toHaveCount(0);
  const stranger = await browser.newContext();
  const external = await stranger.newPage();
  await external.goto(meetingUrl);
  await expect(external.getByRole('alert')).toContainText('browser');
  await expect(external.locator('.transcript-turn')).toHaveCount(0);
  const id = new URL(meetingUrl).pathname.split('/').at(-1);
  const response = await stranger.request.get(
    new URL(`/api/uploads/${id}/media`, meetingUrl).href,
  );
  expect(response.status()).toBe(401);
  await stranger.close();
  await page.getByRole('link', { name: 'All meetings', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Your private recordings' }),
  ).toContainText('Private ingestion verification');
});
