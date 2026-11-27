import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import type { Pool } from 'pg';
import type {
  AuditEvent,
  BeneficiaryRequest,
  DetailRequest,
  Policy,
  Store,
} from './app.js';

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
export const passwordHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString('hex');
const checkPassword = (password: string, stored: string) => {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const actual = Buffer.from(passwordHash(password, salt), 'hex');
  const expected = Buffer.from(digest, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export function createStore(pool: Pick<Pool, 'query' | 'connect'>): Store {
  const appendAudit = (event: AuditEvent) =>
    pool.query(
      'INSERT INTO audit_events (id, actor_id, policy_id, request_id, action, outcome, occurred_at) VALUES ($1, $2, $3, NULL, $4, $5, now())',
      [
        randomUUID(),
        event.actorId,
        event.policyId,
        event.action,
        event.outcome,
      ],
    );
  return {
    async audit(event) {
      await appendAudit(event);
    },
    async signIn(email, password) {
      const result = await pool.query<{ id: string; password_hash: string }>(
        'SELECT id, password_hash FROM customers WHERE lower(email) = lower($1)',
        [email],
      );
      const customer = result.rows[0];
      return customer && checkPassword(password, customer.password_hash)
        ? { id: customer.id }
        : null;
    },
    async createSession(actorId) {
      const token = randomBytes(32).toString('hex');
      const csrf = randomBytes(32).toString('hex');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          "INSERT INTO sessions (id, actor_id, token_hash, csrf_token, expires_at) VALUES ($1, $2, $3, $4, now() + interval '30 minutes')",
          [randomUUID(), actorId, hash(token), csrf],
        );
        await client.query(
          'INSERT INTO audit_events (id, actor_id, policy_id, request_id, action, outcome, occurred_at) VALUES ($1, $2, NULL, NULL, $3, $4, now())',
          [randomUUID(), actorId, 'SIGN_IN', 'SUCCESS'],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      return { token, csrf };
    },
    async session(token) {
      const result = await pool.query<{ actor_id: string; csrf_token: string }>(
        "UPDATE sessions SET expires_at = now() + interval '30 minutes' WHERE token_hash = $1 AND expires_at > now() RETURNING actor_id, csrf_token",
        [hash(token)],
      );
      const row = result.rows[0];
      return row ? { actorId: row.actor_id, csrf: row.csrf_token } : null;
    },
    async revokeSession(token, actorId) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'DELETE FROM sessions WHERE token_hash = $1 AND actor_id = $2',
          [hash(token), actorId],
        );
        await client.query(
          'INSERT INTO audit_events (id, actor_id, policy_id, request_id, action, outcome, occurred_at) VALUES ($1, $2, NULL, NULL, $3, $4, now())',
          [randomUUID(), actorId, 'SIGN_OUT', 'SUCCESS'],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async policies(actorId) {
      const result = await pool.query<Policy>(
        'SELECT id, number, status, coverage FROM policies WHERE owner_id = $1 ORDER BY number',
        [actorId],
      );
      return result.rows;
    },
    async policy(actorId, policyId) {
      const result = await pool.query<Policy>(
        'SELECT id, number, status, coverage FROM policies WHERE id = $1 AND owner_id = $2',
        [policyId, actorId],
      );
      return result.rows[0] ?? null;
    },
    async requests(actorId) {
      const result = await pool.query<BeneficiaryRequest>(
        'SELECT r.id, r.policy_id AS "policyId", p.number AS "policyNumber", r.proposed_name AS "proposedName", r.proposed_relationship AS "proposedRelationship", r.created_at AS "submittedAt" FROM beneficiary_requests r JOIN policies p ON p.id = r.policy_id WHERE r.actor_id = $1 AND p.owner_id = $1 ORDER BY r.created_at DESC, r.id DESC',
        [actorId],
      );
      return result.rows;
    },
    async request(actorId, requestId) {
      const result = await pool.query<BeneficiaryRequest>(
        'SELECT r.id, r.policy_id AS "policyId", p.number AS "policyNumber", r.proposed_name AS "proposedName", r.proposed_relationship AS "proposedRelationship", r.created_at AS "submittedAt" FROM beneficiary_requests r JOIN policies p ON p.id = r.policy_id WHERE r.id = $1 AND r.actor_id = $2 AND p.owner_id = $2',
        [requestId, actorId],
      );
      return result.rows[0] ?? null;
    },
    async detailRequests(actorId) {
      const result = await pool.query<DetailRequest>(
        'SELECT r.id, r.policy_id AS "policyId", p.number AS "policyNumber", r.type, r.status, r.proposed_address AS "proposedAddress", r.proposed_frequency AS "proposedFrequency", r.created_at AS "submittedAt" FROM detail_requests r JOIN policies p ON p.id = r.policy_id WHERE r.actor_id = $1 AND p.owner_id = $1 ORDER BY r.created_at DESC, r.id DESC',
        [actorId],
      );
      return result.rows;
    },
    async createDetailRequest(actorId, policyId, proposal) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const id = randomUUID();
        await client.query(
          'INSERT INTO detail_requests (id, actor_id, policy_id, type, proposed_address, proposed_frequency) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            id,
            actorId,
            policyId,
            proposal.type,
            proposal.type === 'address'
              ? JSON.stringify(proposal.proposedAddress)
              : null,
            proposal.type === 'frequency' ? proposal.proposedFrequency : null,
          ],
        );
        await client.query(
          'INSERT INTO audit_events (id, actor_id, policy_id, detail_request_id, action, outcome, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, now())',
          [
            randomUUID(),
            actorId,
            policyId,
            id,
            proposal.type === 'address'
              ? 'ADDRESS_REQUEST_CREATED'
              : 'FREQUENCY_REQUEST_CREATED',
            'SUCCESS',
          ],
        );
        await client.query('COMMIT');
        return id;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async createRequest(actorId, policyId, name, relationship) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query<{ id: string }>(
          'INSERT INTO beneficiary_requests (id, actor_id, policy_id, proposed_name, proposed_relationship) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [randomUUID(), actorId, policyId, name, relationship],
        );
        const requestId = result.rows[0].id;
        await client.query(
          'INSERT INTO audit_events (id, actor_id, policy_id, request_id, action, outcome, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, now())',
          [
            randomUUID(),
            actorId,
            policyId,
            requestId,
            'BENEFICIARY_REQUEST_CREATED',
            'SUCCESS',
          ],
        );
        await client.query('COMMIT');
        return requestId;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
