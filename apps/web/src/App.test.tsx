import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, test, expect, vi } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

test('FR-02 expired reload clears protected data and explains sign-in', async () => {
  sessionStorage.setItem('session-seen', '1');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
    })),
  );
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your session has ended. Sign in again.',
  );
  expect(screen.getByRole('alert')).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
  expect(sessionStorage.getItem('session-seen')).toBeNull();
});

test('FR-02 sign-out failure keeps workspace and offers retry', async () => {
  let attempts = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session') && options?.method === 'DELETE') {
        attempts += 1;
        return attempts === 1
          ? {
              ok: false,
              json: async () => ({ error: { code: 'UNAVAILABLE' } }),
            }
          : { ok: true };
      }
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
          ],
        };
      if (url.endsWith('/beneficiary-requests'))
        return { ok: true, json: async () => [] };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Sign-out failed. Try again.',
  );
  expect(screen.getByText('DEMO-001')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toHaveFocus();
  expect(screen.queryByText('DEMO-001')).not.toBeInTheDocument();
});

test('FR-02 expired policy explains read-only state in Thai', async () => {
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
              id: 'expired',
              number: 'DEMO-002',
              status: 'EXPIRED',
              coverage: 'THB 500,000',
            },
          ],
        };
      if (url.endsWith('/beneficiary-requests'))
        return { ok: true, json: async () => [] };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-002');
  await user.click(screen.getByRole('button', { name: 'ไทย' }));
  expect(screen.getByText('หมดอายุ', { exact: true })).toBeVisible();
  expect(
    screen.getByText('กรมธรรม์นี้หมดอายุแล้ว คุณดูข้อมูลได้ แต่ส่งคำขอเปลี่ยนแปลงไม่ได้'),
  ).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'ส่งคำขอ' }),
  ).not.toBeInTheDocument();
});

test('FR-02 reload restores workspace and sign-out clears it', async () => {
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      calls.push(`${options?.method ?? 'GET'} ${url}`);
      if (url.endsWith('/session'))
        return options?.method === 'DELETE'
          ? { ok: true }
          : { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
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
          ],
        };
      if (url.endsWith('/beneficiary-requests') && !options?.method)
        return { ok: true, json: async () => [] };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  expect(await screen.findByText('DEMO-001')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('button', { name: 'Sign in' })).toBeVisible();
  expect(screen.queryByText('DEMO-001')).not.toBeInTheDocument();
  expect(calls).toContain('DELETE /api/v1/session');
});

test('FR-02 switching accounts clears credentials and beneficiary draft', async () => {
  let signedIn = '';
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session') && options?.method === 'POST') {
        signedIn = (JSON.parse(options.body as string) as { email: string })
          .email;
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      }
      if (url.endsWith('/session') && options?.method === 'DELETE')
        return { ok: true };
      if (url.endsWith('/session'))
        return {
          ok: false,
          json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
        };
      if (url.endsWith('/policies'))
        return {
          ok: true,
          json: async () => [
            {
              id: signedIn,
              number:
                signedIn === 'first@example.test' ? 'DEMO-001' : 'DEMO-003',
              status: 'ACTIVE',
              coverage: 'THB 1,000,000',
            },
          ],
        };
      if (url.endsWith('/beneficiary-requests'))
        return { ok: true, json: async () => [] };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.type(await screen.findByLabelText('Email'), 'first@example.test');
  await user.type(screen.getByLabelText('Password'), 'first-secret');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByText('DEMO-001');
  await user.type(
    screen.getByLabelText('Beneficiary name'),
    'First Account Name',
  );
  await user.type(screen.getByLabelText('Relationship'), 'Sister');
  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  await screen.findByRole('heading', { name: 'Sign in' });
  expect(screen.getByLabelText('Email')).toHaveValue('');
  expect(screen.getByLabelText('Password')).toHaveValue('');
  await user.type(screen.getByLabelText('Email'), 'second@example.test');
  await user.type(screen.getByLabelText('Password'), 'second-secret');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByText('DEMO-003');
  expect(screen.getByLabelText('Beneficiary name')).toHaveValue('');
  expect(screen.getByLabelText('Relationship')).toHaveValue('');
  expect(screen.queryByText('First Account Name')).not.toBeInTheDocument();
});

test('FR-02 opening history reads the owned request detail', async () => {
  const calls: string[] = [];
  const item = {
    id: 'request-1',
    policyId: 'active',
    policyNumber: 'DEMO-001',
    proposedName: 'Mali',
    proposedRelationship: 'Sister',
    submittedAt: '2026-11-27T09:00:00.000Z',
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url);
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
          ],
        };
      if (url.endsWith('/beneficiary-requests'))
        return { ok: true, json: async () => [item] };
      if (url.endsWith('/beneficiary-requests/request-1'))
        return { ok: true, json: async () => item };
      throw Error('unexpected request');
    }),
  );
  render(<App />);
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: 'DEMO-001 · Mali' }));
  expect(calls).toContain('/api/v1/beneficiary-requests/request-1');
  expect(
    await screen.findByText('Request recorded; policy unchanged'),
  ).toBeVisible();
});

test('FR-01 bilingual request preserves fields and shows non-binding success', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session') && !options?.method)
        return {
          ok: false,
          json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
        };
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/beneficiary-requests') && !options?.method)
        return { ok: true, json: async () => [] };
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
  await user.type(await screen.findByLabelText('Email'), 'owner@example.test');
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
  expect(
    screen.getByText('การส่งคำขอไม่เปลี่ยนแปลงกรมธรรม์หรือความคุ้มครอง'),
  ).toBeVisible();
});

test('FR-01 changing policy clears the previous request confirmation', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session') && !options?.method)
        return {
          ok: false,
          json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
        };
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/beneficiary-requests') && !options?.method)
        return { ok: true, json: async () => [] };
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
  await user.type(await screen.findByLabelText('Email'), 'owner@example.test');
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
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session') && !options?.method)
        return {
          ok: false,
          json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
        };
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/beneficiary-requests') && !options?.method)
        return { ok: true, json: async () => [] };
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
  await user.type(await screen.findByLabelText('Email'), 'owner@example.test');
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
