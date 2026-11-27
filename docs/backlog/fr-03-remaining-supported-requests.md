# FR-03: Remaining supported requests

**Title:** [Story] Remaining supported requests
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-03
**Product context:** [PRD](../PRD.md)
**Risk:** Medium
**State:** Backlog draft

## Summary and objective

Customers can submit correspondence-address, payment-frequency, and accidental-death-rider changes for an owned ACTIVE policy.

## Source and boundaries

PRD §§1–3, 5; initiative R2; architecture AD-2, AD-3, AD-6, AD-7. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Each supported change has validated input, a saved request, and Thai and English customer-facing labels.
- [ ] Invalid input, EXPIRED policies, and cross-account policies create no request and no policy change.
- [ ] The rider flow collects no medical evidence and tells customers that real coverage may need further review.

## Scope and out of scope

In scope: Customers can submit correspondence-address, payment-frequency, and accidental-death-rider changes for an owned ACTIVE policy.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-02.

## Accepted decisions and readiness

Refine field validation and whether these three change types should be split into separate implementation tickets. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Address, frequency, and rider form states: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [English request](../../design/page/create-endorsement-request.html), [Thai labels](../../design/page/request-types-th.html).

