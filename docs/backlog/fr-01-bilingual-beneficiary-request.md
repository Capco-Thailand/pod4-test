# FR-01: Bilingual beneficiary request

**Title:** [Story] Bilingual beneficiary request
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-01
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Customer can sign in to a synthetic account, view an owned ACTIVE policy, and submit a beneficiary-change request in Thai or English through the first runnable web/API/database path.

## Source and boundaries

PRD §§1–3, 5; initiative R1–R2; architecture AD-1–AD-3, AD-6–AD-8. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] An authenticated demo customer can select an owned ACTIVE policy and save a valid beneficiary request in either language.
- [ ] The API rejects unauthenticated, cross-account, and EXPIRED-policy request creation before persistence.
- [ ] The request and audit event persist without changing the policy or binding coverage.

## Scope and out of scope

In scope: Customer can sign in to a synthetic account, view an owned ACTIVE policy, and submit a beneficiary-change request in Thai or English through the first runnable web/API/database path.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

None; this story establishes React/Vite, Fastify, PostgreSQL, migrations, synthetic seed, Compose baseline, session, request, and audit contracts.

## Accepted decisions and readiness

Use the existing BMad first-epic tracer as the detailed starting point. Set UX and exact request fields at refinement. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Sign-in, owned-policy, English request, and Thai beneficiary references: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [English request](../../design/page/create-endorsement-request.html), [Thai beneficiary](../../design/page/beneficiary-request-th.html).

