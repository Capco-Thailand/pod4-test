import { expect, test } from '@playwright/test';

async function signIn(
  page: import('@playwright/test').Page,
  email = 'owner@example.test',
) {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your policies and requests' }),
  ).toBeVisible();
}
async function capture(
  page: import('@playwright/test').Page,
  testInfo: import('@playwright/test').TestInfo,
) {
  await testInfo.attach('rendered application', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

test('FR-01 success: bilingual beneficiary request remains non-binding', async ({
  page,
}, testInfo) => {
  await signIn(page);
  await expect(page.getByLabel('Your policy')).toHaveValue(
    '00000000-0000-4000-8000-000000000011',
  );
  await expect(page.getByText('ACTIVE')).toBeVisible();
  await page.getByLabel('Beneficiary name').fill('Mali');
  await page.getByLabel('Relationship').fill('Sister');
  await page.getByRole('button', { name: 'ไทย' }).click();
  await expect(page.getByLabel('ชื่อผู้รับผลประโยชน์')).toHaveValue('Mali');
  await page.getByRole('button', { name: 'ส่งคำขอ' }).click();
  await expect(
    page.getByRole('heading', { name: /บันทึกคำขอแล้ว/ }),
  ).toBeFocused();
  await expect(page.getByText(/การส่งคำขอไม่เปลี่ยนแปลงกรมธรรม์/)).toBeVisible();
  await capture(page, testInfo);
});

test('FR-01 refusal: invalid form and expired policy cannot submit', async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await page.getByLabel('Your policy').selectOption({ label: 'DEMO-002' });
  await expect(page.getByText('EXPIRED', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit request' }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      'This policy has expired. You can view it, but cannot submit a change request.',
    ),
  ).toBeVisible();
  await capture(page, testInfo);
});

test('FR-01 access: anonymous and cross-account policy access are refused', async ({
  page,
}, testInfo) => {
  const anonymous = await page.request.get('/api/v1/policies');
  expect(anonymous.status()).toBe(401);
  await signIn(page);
  const foreign = '00000000-0000-4000-8000-000000000013';
  expect((await page.request.get(`/api/v1/policies/${foreign}`)).status()).toBe(
    404,
  );
  const foreignWrite = await page.request.post(
    `/api/v1/policies/${foreign}/beneficiary-requests`,
    { data: { name: 'Mali', relationship: 'Sister' } },
  );
  expect(foreignWrite.status()).toBe(404);
  expect((await foreignWrite.json()).error.code).toBe('POLICY_NOT_FOUND');
  const owned = '00000000-0000-4000-8000-000000000011';
  const missingCsrf = await page.request.post(
    `/api/v1/policies/${owned}/beneficiary-requests`,
    { data: { name: 'Mali', relationship: 'Sister' } },
  );
  expect(missingCsrf.status()).toBe(403);
  expect((await missingCsrf.json()).error.code).toBe('CSRF_INVALID');
  await expect(page.getByText('DEMO-003')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: /Request recorded/ }),
  ).toHaveCount(0);
  await capture(page, testInfo);
});

test('FR-01 narrow viewport keeps the request form readable', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.getByLabel('Beneficiary name')).toBeVisible();
  await expect(
    page.getByText(
      'Submitting a request does not change your policy or coverage.',
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await capture(page, testInfo);
});
