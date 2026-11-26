# ADR 0001: Endorsement MVP architecture

**Status:** Accepted

**Date:** 2026-11-26

The approved PRD needs one consistent API trust boundary, cited vector evidence, a separate deterministic calculator, and non-binding customer decisions. Build a React + Vite web app, a modular TypeScript/Fastify API, an internal calculator, and PostgreSQL with pgvector under Docker Compose; use API-managed sessions and transactional state with append-only audit records. This keeps synthetic MVP behavior reproducible while leaving real customer data, identity integration, issuance, and production hosting for a later decision.

The enforceable cross-epic rules, contracts, version seed, and deferred choices are in the [architecture spine](../../_bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md).
