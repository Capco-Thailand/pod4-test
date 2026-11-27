export type Policy = {
  id: string;
  number: string;
  status: 'ACTIVE' | 'EXPIRED';
  coverage: string;
};
export type BeneficiaryRequest = {
  id: string;
  policyId: string;
  policyNumber: string;
  proposedName: string;
  proposedRelationship: string;
  submittedAt: string;
};
export type Address = {
  addressLine1: string;
  addressLine2: string;
  district: string;
  province: string;
  postalCode: string;
  country: 'Thailand';
};
export type DetailRequest = {
  id: string;
  policyId: string;
  policyNumber: string;
  status: 'SUBMITTED';
  submittedAt: string;
} & (
  | { type: 'address'; proposedAddress: Address }
  | {
      type: 'frequency';
      proposedFrequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
    }
);
export type DetailPayload =
  | {
      type: 'address';
      addressLine1: string;
      addressLine2?: string;
      district: string;
      province: string;
      postalCode: string;
    }
  | {
      type: 'frequency';
      frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
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
  restore: async () =>
    read<{ csrfToken: string }>(
      await fetch('/api/v1/session', { credentials: 'same-origin' }),
    ),
  signOut: async (csrf: string) => {
    const response = await fetch('/api/v1/session', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'x-csrf-token': csrf },
    });
    if (!response.ok) await read(response);
  },
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
  detailRequests: async () =>
    read<DetailRequest[]>(
      await fetch('/api/v1/detail-requests', { credentials: 'same-origin' }),
    ),
  detailRequest: async (
    policyId: string,
    csrf: string,
    payload: DetailPayload,
  ) =>
    read<{ requestId: string }>(
      await fetch(
        `/api/v1/policies/${encodeURIComponent(policyId)}/detail-requests`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify(payload),
        },
      ),
    ),
  requests: async () =>
    read<BeneficiaryRequest[]>(
      await fetch('/api/v1/beneficiary-requests', {
        credentials: 'same-origin',
      }),
    ),
  requestDetail: async (id: string) =>
    read<BeneficiaryRequest>(
      await fetch(`/api/v1/beneficiary-requests/${encodeURIComponent(id)}`, {
        credentials: 'same-origin',
      }),
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
