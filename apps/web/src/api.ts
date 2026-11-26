export type Policy = {
  id: string;
  number: string;
  status: 'ACTIVE' | 'EXPIRED';
  coverage: string;
};
export class ApiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
async function read<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error?.code ?? 'UNAVAILABLE');
  return data as T;
}
export const api = {
  signIn: async (email: string, password: string) =>
    read<{ csrfToken: string }>(
      await fetch('/api/v1/session', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
    ),
  policies: async () =>
    read<Policy[]>(
      await fetch('/api/v1/policies', { credentials: 'same-origin' }),
    ),
  request: async (
    policyId: string,
    csrf: string,
    name: string,
    relationship: string,
  ) =>
    read<{ requestId: string }>(
      await fetch(
        `/api/v1/policies/${encodeURIComponent(policyId)}/beneficiary-requests`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify({ name, relationship }),
        },
      ),
    ),
};
