# FR-12: Audit and safety verification

**Title:** [Story] Audit and safety verification
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-12
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Verify that the complete workflow is auditable and that protected actions and decisions never mutate live policy or coverage data.

## Source and boundaries

PRD §§3–5; initiative R8; architecture AD-3, AD-7. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Sign-in, sign-out, request, assessment, calculation, proposal, decision, and rejected protected actions have append-only audit events with actor, references, outcome, version, and time where applicable.
- [ ] A state mutation and its audit event commit atomically; logs exclude session tokens, raw prompts, and full personal-data payloads.
- [ ] Automated checks prove unauthorized approval, cross-account access, duplicate decision, and live-policy-write counts are zero.

## Scope and out of scope

In scope: Verify that the complete workflow is auditable and that protected actions and decisions never mutate live policy or coverage data.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-11; audit event contract starts in FR-01.

## Accepted decisions and readiness

This is a cross-flow verification draft; keep audit instrumentation with the owning feature tickets. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

No new customer screen; verify the boundary and failure states across the existing journey: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [mockup index](../../design/page/index.html).

