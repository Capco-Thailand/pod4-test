import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Email').fill('owner@example.test');
  await page.getByLabel('Password').fill('demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByLabel('Your policy')).toHaveValue(
    '00000000-0000-4000-8000-000000000011',
  );
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

test('FR-03 valid address and frequency: English and Thai proposals remain non-binding in owned history', async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.getByLabel('Request type').selectOption('address');
  await page.getByLabel('Address line 1').fill('1 Demo Road');
  await page.getByLabel('District').fill('Pathum Wan');
  await page.getByLabel('Province').fill('Bangkok');
  await page.getByLabel('Postal code').fill('10330');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(
    page.getByRole('heading', { name: /Request recorded/ }),
  ).toBeFocused();
  await expect(page.getByText(/1 Demo Road/).first()).toBeVisible();
  await page.getByLabel('Request type').selectOption('frequency');
  await page.getByLabel('Proposed frequency').selectOption('quarterly');
  await page.getByRole('button', { name: 'ไทย' }).click();
  await expect(page.getByLabel('ความถี่ที่เสนอ')).toHaveValue('quarterly');
  await page.getByRole('button', { name: 'ส่งคำขอ' }).click();
  await expect(
    page.getByRole('heading', { name: /บันทึกคำขอแล้ว/ }),
  ).toBeFocused();
  await expect(page.getByText(/รายไตรมาส/).last()).toBeVisible();
  await expect(page.getByText(/กรมธรรม์นี้ยังไม่เปลี่ยนแปลง/).first()).toBeVisible();
  await capture(page, testInfo);
});

test('FR-03 invalid input and expired policy refuse request', async ({
  page,
}, testInfo) => {
  await signIn(page);
  await page.getByLabel('Request type').selectOption('address');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('alert')).toHaveText(/valid address/);
  await page.getByLabel('Your policy').selectOption({ label: 'DEMO-002' });
  await expect(page.getByText(/This policy has expired/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Submit request' }),
  ).toHaveCount(0);
  await capture(page, testInfo);
});
