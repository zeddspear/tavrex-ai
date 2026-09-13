import { expect, test } from '@playwright/test';

test('clean reviewer can explore, filter, sort, recover, and open a meeting', async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  }
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole('heading', { name: 'Your conversations. All connected.' }),
  ).toBeVisible();
  await expect(page.locator('.meeting-row')).toHaveCount(3);
  await page.getByRole('button', { name: 'Customer', exact: true }).click();
  await expect(page.locator('.meeting-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'All meetings', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search meetings' }).fill('pilot');
  await expect(page.locator('.meeting-row')).toHaveCount(2);
  await page
    .getByRole('textbox', { name: 'Search meetings' })
    .fill('no-such-meeting');
  await expect(
    page.getByRole('heading', { name: 'No meetings found' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page
    .getByRole('combobox', { name: 'Sort meetings' })
    .selectOption('oldest');
  await expect(page.locator('.meeting-row').first()).toContainText(
    'Less noise. More context.',
  );
  await page.getByRole('link', { name: 'Explore meeting' }).click();
  await expect(
    page.getByRole('heading', { name: 'A simpler first five minutes' }),
  ).toBeVisible();
  await expect(
    page.getByText('Original synthetic meeting with sample analysis.', {
      exact: false,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Meeting overview' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Copy overview' }).click();
  await expect(
    page.getByRole('button', { name: 'Copied', exact: true }),
  ).toBeVisible();
  if (browserName === 'chromium') {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      'Synthetic demo / sample analysis',
    );
  }
  await page.getByRole('link', { name: 'All meetings', exact: true }).click();
  await expect(page.locator('.meeting-row')).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('invalid deep link has a working recovery route', async ({ page }) => {
  await page.goto('/app/meetings/missing');
  await expect(
    page.getByRole('heading', { name: 'Meeting not found' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Back to meetings' }).click();
  await expect(page.locator('.meeting-row')).toHaveCount(3);
});

test('about dialog is keyboard accessible and returns focus', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'mobile',
    'Sidebar help is hidden in compact navigation.',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/app');
  const trigger = page.getByRole('button', { name: 'About this demo' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
