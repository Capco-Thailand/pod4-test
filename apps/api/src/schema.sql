CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL
);
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES customers(id), number text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED')), coverage text NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES customers(id), token_hash text UNIQUE NOT NULL,
  csrf_token text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS beneficiary_requests (
  id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES customers(id), policy_id uuid NOT NULL REFERENCES policies(id),
  proposed_name text NOT NULL, proposed_relationship text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS detail_requests (
  id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES customers(id), policy_id uuid NOT NULL REFERENCES policies(id),
  type text NOT NULL CHECK (type IN ('address', 'frequency')),
  proposed_address jsonb, proposed_frequency text CHECK (proposed_frequency IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status = 'SUBMITTED'), created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((type = 'address' AND proposed_address IS NOT NULL AND proposed_frequency IS NULL) OR (type = 'frequency' AND proposed_address IS NULL AND proposed_frequency IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY, actor_id uuid REFERENCES customers(id), policy_id uuid REFERENCES policies(id),
  request_id uuid UNIQUE REFERENCES beneficiary_requests(id), action text NOT NULL, outcome text NOT NULL,
  occurred_at timestamptz NOT NULL
);
ALTER TABLE audit_events ALTER COLUMN actor_id DROP NOT NULL;
ALTER TABLE audit_events ALTER COLUMN policy_id DROP NOT NULL;
ALTER TABLE audit_events ALTER COLUMN request_id DROP NOT NULL;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS detail_request_id uuid UNIQUE REFERENCES detail_requests(id);
