import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, test, expect, vi } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('FR-01 bilingual request preserves fields and shows non-binding success', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/policies'))
        return {
          ok: true,
          json: async () => [
            {
              id: 'policy-1',
              number: 'DEMO-001',
              status: 'ACTIVE',
              coverage: 'THB 1,000,000',
            },
          ],
        };
      return { ok: true, json: async () => ({ requestId: 'request-1' }) };
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('Email'), 'owner@example.test');
  await user.type(screen.getByLabelText('Password'), 'demo-password');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByText('DEMO-001');
  await user.type(screen.getByLabelText('Beneficiary name'), 'Mali');
  await user.type(screen.getByLabelText('Relationship'), 'Sister');
  await user.click(screen.getByRole('button', { name: 'ไทย' }));
  expect(screen.getByLabelText('ชื่อผู้รับผลประโยชน์')).toHaveValue('Mali');
  await user.click(screen.getByRole('button', { name: 'ส่งคำขอ' }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: /บันทึกคำขอแล้ว/ })).toHaveFocus(),
  );
  expect(screen.getByText(/ไม่เปลี่ยนแปลงกรมธรรม์หรือความคุ้มครอง/)).toBeVisible();
});

test('FR-01 changing policy clears the previous request confirmation', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/policies'))
        return {
          ok: true,
          json: async () => [
            {
              id: 'active',
              number: 'DEMO-001',
              status: 'ACTIVE',
              coverage: 'THB 1,000,000',
            },
            {
              id: 'expired',
              number: 'DEMO-002',
              status: 'EXPIRED',
              coverage: 'THB 500,000',
            },
          ],
        };
      return { ok: true, json: async () => ({ requestId: 'request-1' }) };
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('Email'), 'owner@example.test');
  await user.type(screen.getByLabelText('Password'), 'demo-password');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByText('DEMO-001');
  await user.type(screen.getByLabelText('Beneficiary name'), 'Mali');
  await user.type(screen.getByLabelText('Relationship'), 'Sister');
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(
    await screen.findByRole('heading', {
      name: 'Request recorded. Your policy is unchanged.',
    }),
  ).toBeVisible();
  await user.selectOptions(screen.getByLabelText('Your policy'), 'expired');
  expect(
    screen.queryByRole('heading', {
      name: 'Request recorded. Your policy is unchanged.',
    }),
  ).not.toBeInTheDocument();
});

test('FR-01 failed policy load returns to retryable sign-in with an error', async () => {
  let policyLoads = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/policies')) {
        policyLoads += 1;
        if (policyLoads === 1)
          return {
            ok: false,
            json: async () => ({ error: { code: 'UNAVAILABLE' } }),
          };
        return {
          ok: true,
          json: async () => [
            {
              id: 'active',
              number: 'DEMO-001',
              status: 'ACTIVE',
              coverage: 'THB 1,000,000',
            },
          ],
        };
      }
      throw new Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText('Email'), 'owner@example.test');
  await user.type(screen.getByLabelText('Password'), 'demo-password');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The service is unavailable. Try again.',
  );
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('DEMO-001')).toBeVisible();
  expect(policyLoads).toBe(2);
});
