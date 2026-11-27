# FR-11: Decision history

**Title:** [Story] Decision history
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-11
**Product context:** [PRD](../PRD.md)
**Risk:** Medium
**State:** Backlog draft

## Summary and objective

Customers can see their own approved or rejected proposal decisions with proposed values and decision time.

## Source and boundaries

PRD §§2, 5; initiative R7; architecture AD-2, AD-3, AD-6. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] A decision appears in the owner's history with outcome, proposed values, and UTC decision time after it is recorded.
- [ ] History is scoped to the authenticated customer and rejects cross-account access.
- [ ] Thai and English views clearly distinguish a recorded proposal decision from a live policy update.

## Scope and out of scope

In scope: Customers can see their own approved or rejected proposal decisions with proposed values and decision time.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-10.

## Accepted decisions and readiness

Set pagination, ordering, and UX states during refinement. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Approved and rejected decision records with time and non-binding boundary: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [history mockup](../../design/page/change-history.html).

