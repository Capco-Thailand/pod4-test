import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function capture(page: Page, info: TestInfo) {
  await info.attach('rendered application', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}
async function signIn(page: Page, email: string) {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies and requests' }),
  ).toBeVisible();
}

test('FR-02 owned history, reload, expired refusal, and sign-out', async ({
  page,
}, info) => {
  await signIn(page, 'owner@example.test');
  await expect(page.getByText('DEMO-003')).toHaveCount(0);
  await page.getByLabel('Beneficiary name').fill('Mali');
  await page.getByLabel('Relationship').fill('Sister');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(
    page.getByRole('button', { name: 'DEMO-001 · Mali' }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'DEMO-001 · Mali' }).first().click();
  await expect(
    page.getByText('Request recorded; policy unchanged'),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'DEMO-001 · Mali' }).first(),
  ).toBeVisible();
  await page.getByLabel('Your policy').selectOption({ label: 'DEMO-002' });
  await expect(
    page.getByText(
      'This policy has expired. You can view it, but cannot submit a change request.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit request' }),
  ).toHaveCount(0);
  await capture(page, info);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'DEMO-001 · Mali' }),
  ).toHaveCount(0);
  await capture(page, info);
});

test('FR-02 second account sees only its own policies and requests', async ({
  page,
}, info) => {
  await signIn(page, 'owner@example.test');
  await page.getByLabel('Beneficiary name').fill('Foreign Boundary');
  await page.getByLabel('Relationship').fill('Sister');
  const createdResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/beneficiary-requests') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Submit request' }).click();
  const foreignRequestId = (await (await createdResponse).json())
    .requestId as string;
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await signIn(page, 'other@example.test');
  await expect(page.getByLabel('Your policy')).toHaveValue(
    '00000000-0000-4000-8000-000000000013',
  );
  await expect(page.getByText('DEMO-001')).toHaveCount(0);
  const foreign = await page.request.get(
    `/api/v1/beneficiary-requests/${foreignRequestId}`,
  );
  const unknown = await page.request.get(
    '/api/v1/beneficiary-requests/00000000-0000-4000-8000-000000000098',
  );
  expect(foreign.status()).toBe(404);
  expect(await foreign.json()).toEqual(await unknown.json());
  await capture(page, info);
});

test('FR-02 narrow workspace keeps policy, expired guidance, and history in reading order', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, 'owner@example.test');
  const policy = page.getByRole('heading', { name: 'Your policy' });
  const request = page.getByRole('heading', {
    name: 'Request a beneficiary change',
  });
  const history = page.getByRole('heading', { name: 'Your requests' });
  expect(await policy.boundingBox()).toBeTruthy();
  expect((await policy.locator('..').boundingBox())!.x).toBe(16);
  expect((await policy.boundingBox())!.y).toBeLessThan(
    (await request.boundingBox())!.y,
  );
  expect((await request.boundingBox())!.y).toBeLessThan(
    (await history.boundingBox())!.y,
  );
  await expect(page.getByText('ACTIVE', { exact: true })).toBeVisible();
  await page.getByLabel('Your policy').selectOption({ label: 'DEMO-002' });
  await expect(page.getByText('EXPIRED', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      'This policy has expired. You can view it, but cannot submit a change request.',
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await capture(page, info);
});
