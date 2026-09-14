import { expect, test } from '@playwright/test';

test.setTimeout(90000);
const mediaTimeout = 30000;

test('search returns multiple meetings with highlighted contextual passages', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/app');
  const search = page.getByRole('textbox', { name: 'Search meetings' });
  await search.fill('context');

  await expect(
    page.getByRole('heading', { name: '2 meetings found' }),
  ).toBeVisible();
  await expect(page.getByText('4 matching passages for “context”')).toBeVisible();
  await expect(page.locator('.search-result-card')).toHaveCount(2);
  await expect(page.locator('.search-result-card').first()).toContainText(
    'Making handoffs feel effortless',
  );
  await expect(page.locator('.search-result-card').last()).toContainText(
    'Less noise. More context.',
  );
  await expect(page.locator('.search-match-kind.transcript')).toHaveCount(2);
  await expect(page.locator('mark')).toHaveCount(4);

  await page.getByRole('button', { name: 'Customer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '1 meeting found' }),
  ).toBeVisible();
  await expect(page.locator('.search-result-card')).toHaveCount(1);
  await expect(page.locator('.search-result-card')).toContainText(
    'Making handoffs feel effortless',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('title, summary, and participant searches preserve existing discovery', async ({
  page,
}) => {
  await page.goto('/app');
  const search = page.getByRole('textbox', { name: 'Search meetings' });

  await search.fill('noise');
  await expect(page.locator('.search-match-kind.title')).toHaveText('Title');
  await expect(page.locator('.search-result-card')).toContainText(
    'Less noise. More context.',
  );

  await search.fill('definition of activation');
  await expect(page.locator('.search-match-kind.summary')).toHaveText('Summary');
  await expect(page.locator('.search-result-card')).toContainText(
    'A simpler first five minutes',
  );

  await search.fill('taylor');
  await expect(page.locator('.search-match-kind.participant')).toHaveText(
    'Participant',
  );
  await expect(page.locator('.search-result-card')).toContainText(
    'Making handoffs feel effortless',
  );
});

test('real transcript result opens and seeks the recording at its source', async ({
  page,
}) => {
  await page.goto('/app');
  await page
    .getByRole('textbox', { name: 'Search meetings' })
    .fill('video is not getting recorded');
  const result = page.locator('.search-result-card');
  await expect(result).toHaveCount(1);
  await expect(result).toContainText('Transcript');
  await expect(result).toContainText('Participant');
  await expect(result).toContainText('1:37');
  await result
    .getByRole('link', {
      name: 'Open From conversation to recording transcript match at 1:37',
    })
    .click();

  await expect(page).toHaveURL(/t=97\.17.*#search-context$/);
  await expect(page.getByText('Transcript match', { exact: true })).toBeVisible();
  await expect(page.getByText(/Opened at 1:37/)).toBeVisible();
  const video = page.locator('video');
  await expect
    .poll(
      () =>
        video.evaluate(
          (element) => !element.seeking && element.readyState >= 2,
        ),
      { timeout: mediaTimeout },
    )
    .toBe(true);
  await expect
    .poll(() => video.evaluate((element) => element.currentTime), {
      timeout: mediaTimeout,
    })
    .toBeCloseTo(97.17, 1);
  await expect(
    page.locator('[data-segment-id="participant-turn"]'),
  ).toHaveClass(/is-active/);
  await page.getByRole('button', { name: 'View transcript context' }).click();
  await expect
    .poll(() =>
      page
        .locator('[data-segment-id="participant-turn"]')
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.top >= 0 && bounds.bottom <= innerHeight;
        }),
    )
    .toBe(true);
});

test('synthetic transcript result opens labeled matching context', async ({
  page,
}) => {
  await page.goto('/app');
  await page
    .getByRole('textbox', { name: 'Search meetings' })
    .fill('keyboard navigation');
  await page
    .getByRole('link', {
      name: 'Open Less noise. More context. transcript match at 10:38',
    })
    .click();

  await expect(page).toHaveURL(/design-review.*source=transcript.*#search-context$/);
  await expect(
    page.getByRole('heading', { name: 'Matching conversation context' }),
  ).toBeVisible();
  await expect(page.getByText('10:38 sample timestamp')).toBeVisible();
  await expect(page.getByText('Synthetic excerpts remain clearly labeled')).toBeVisible();
  await expect(page.locator('#search-context mark')).toHaveText(
    'keyboard navigation',
  );
  await expect(
    page.getByText('Original synthetic meeting with sample analysis.', {
      exact: false,
    }),
  ).toBeVisible();
});

test('empty search has useful recovery and remains contained on mobile', async ({
  page,
}) => {
  await page.goto('/app');
  await page
    .getByRole('textbox', { name: 'Search meetings' })
    .fill('phrase-that-is-not-in-any-meeting');
  await expect(
    page.getByRole('heading', { name: 'No meetings found' }),
  ).toBeVisible();
  await expect(
    page.getByText('Try a different title, summary phrase, transcript quote'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.meeting-row')).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
