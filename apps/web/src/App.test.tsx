import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, test, expect, vi } from 'vitest';
import { App } from './App';

const activePolicy = {
  id: 'active',
  number: 'DEMO-001',
  status: 'ACTIVE',
  coverage: 'THB 1,000,000',
};
function mockWorkspace(
  detailResponse: (
    method?: string,
  ) => Promise<{ ok: boolean; json: () => Promise<unknown> }>,
) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/session'))
        return { ok: true, json: async () => ({ csrfToken: 'csrf' }) };
      if (url.endsWith('/policies'))
        return { ok: true, json: async () => [activePolicy] };
      if (url.endsWith('/beneficiary-requests'))
        return { ok: true, json: async () => [] };
      if (url.endsWith('/detail-requests'))
        return detailResponse(options?.method);
      throw Error(`unexpected request ${url}`);
    }),
  );
}

test('FR-03 address errors name the field beside its label and focus first invalid input', async () => {
  mockWorkspace(async () => ({ ok: true, json: async () => [] }));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-001');
  await user.selectOptions(screen.getByLabelText('Request type'), 'address');
  expect(
    screen.getByRole('heading', { name: 'Correspondence address' }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(screen.getByLabelText('Address line 1')).toHaveFocus();
  expect(
    screen.getByLabelText('Address line 1').closest('.field'),
  ).toHaveTextContent('Address line 1 is required');
  await user.type(screen.getByLabelText('Address line 1'), '1 Demo Road');
  await user.type(screen.getByLabelText('District'), 'Pathum Wan');
  await user.type(screen.getByLabelText('Province'), 'Bangkok');
  await user.type(screen.getByLabelText('Postal code'), '1234');
  await user.click(screen.getByRole('button', { name: 'ไทย' }));
  await user.click(screen.getByRole('button', { name: 'ส่งคำขอ' }));
  expect(screen.getByLabelText('รหัสไปรษณีย์')).toHaveFocus();
  expect(
    screen.getByLabelText('รหัสไปรษณีย์').closest('.field'),
  ).toHaveTextContent('รหัสไปรษณีย์ต้องมีตัวเลข 5 หลัก');
});

test('FR-03 failed history refresh retries GET without reposting confirmed proposal', async () => {
  let posts = 0;
  let reads = 0;
  mockWorkspace(async (method) => {
    if (method === 'POST') {
      posts++;
      return { ok: true, json: async () => ({ requestId: 'frequency-1' }) };
    }
    reads++;
    if (reads === 3)
      return {
        ok: false,
        json: async () => ({ error: { code: 'UNAVAILABLE' } }),
      };
    return {
      ok: true,
      json: async () =>
        reads > 3
          ? [
              {
                id: 'frequency-1',
                policyId: 'active',
                policyNumber: 'DEMO-001',
                type: 'frequency',
                proposedFrequency: 'annual',
                status: 'SUBMITTED',
                submittedAt: '2026-11-27T00:00:00Z',
              },
            ]
          : [],
    };
  });
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-001');
  await user.selectOptions(screen.getByLabelText('Request type'), 'frequency');
  expect(
    screen.getByRole('heading', { name: 'Payment frequency' }),
  ).toBeVisible();
  await user.selectOptions(
    screen.getByLabelText('Proposed frequency'),
    'annual',
  );
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(
    await screen.findByRole('heading', { name: /Request recorded/ }),
  ).toBeVisible();
  expect(
    await screen.findByRole('button', { name: 'Retry request history' }),
  ).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'Retry request history' }),
  );
  expect(await screen.findByText('Proposed: Annual')).toBeVisible();
  expect(posts).toBe(1);
});

test('FR-03 detail-history 401 clears protected workspace', async () => {
  let reads = 0;
  mockWorkspace(async () => {
    reads++;
    return reads === 1
      ? { ok: true, json: async () => [] }
      : {
          ok: false,
          json: async () => ({ error: { code: 'UNAUTHENTICATED' } }),
        };
  });
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-001');
  await user.selectOptions(screen.getByLabelText('Request type'), 'address');
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeVisible();
  expect(screen.queryByText('DEMO-001')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Your session has ended. Sign in again.',
  );
});

test('FR-03 address draft survives language switch and submission appears in history', async () => {
  let history: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
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
      if (url.endsWith('/detail-requests') && options?.method === 'POST') {
        const body = JSON.parse(String(options.body));
        history = [
          {
            id: 'address-1',
            policyId: 'active',
            policyNumber: 'DEMO-001',
            type: 'address',
            status: 'SUBMITTED',
            submittedAt: '2026-11-27T00:00:00Z',
            proposedAddress: { ...body, country: 'Thailand' },
          },
        ];
        return { ok: true, json: async () => ({ requestId: 'address-1' }) };
      }
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => history };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-001');
  await user.selectOptions(screen.getByLabelText('Request type'), 'address');
  await user.type(screen.getByLabelText('Address line 1'), '1 Demo Road');
  await user.type(screen.getByLabelText('District'), 'Pathum Wan');
  await user.type(screen.getByLabelText('Province'), 'Bangkok');
  await user.type(screen.getByLabelText('Postal code'), '10330');
  await user.click(screen.getByRole('button', { name: 'ไทย' }));
  expect(screen.getByLabelText('ที่อยู่บรรทัดที่ 1')).toHaveValue('1 Demo Road');
  await user.click(screen.getByRole('button', { name: 'ส่งคำขอ' }));
  expect(
    await screen.findByRole('heading', { name: /บันทึกคำขอแล้ว/ }),
  ).toHaveFocus();
  expect(await screen.findByText(/1 Demo Road/)).toBeVisible();
});

test('FR-03 frequency failure retains draft and retry confirms only after server response', async () => {
  let attempts = 0;
  const history: unknown[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options?: RequestInit) => {
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
      if (url.endsWith('/detail-requests') && options?.method === 'POST') {
        attempts++;
        if (attempts === 1)
          return {
            ok: false,
            json: async () => ({ error: { code: 'UNAVAILABLE' } }),
          };
        history.push({
          id: 'frequency-1',
          policyId: 'active',
          policyNumber: 'DEMO-001',
          type: 'frequency',
          proposedFrequency: 'quarterly',
          status: 'SUBMITTED',
          submittedAt: '2026-11-27T00:00:00Z',
        });
        return { ok: true, json: async () => ({ requestId: 'frequency-1' }) };
      }
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => history };
      throw Error('unexpected request');
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('DEMO-001');
  await user.selectOptions(screen.getByLabelText('Request type'), 'frequency');
  await user.selectOptions(
    screen.getByLabelText('Proposed frequency'),
    'quarterly',
  );
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The service is unavailable. Try again.',
  );
  expect(screen.getByLabelText('Proposed frequency')).toHaveValue('quarterly');
  expect(
    screen.queryByRole('heading', { name: /Request recorded/ }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(
    await screen.findByRole('heading', { name: /Request recorded/ }),
  ).toHaveFocus();
  expect(await screen.findByText('Proposed: Quarterly')).toBeVisible();
});

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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
      if (url.endsWith('/detail-requests'))
        return { ok: true, json: async () => [] };
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
