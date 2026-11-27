# FR-04: Versioned policy wording

**Title:** [Story] Versioned policy wording
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-04
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Seed synthetic, versioned policy wording for the demo products so authorized policy and future assessment views can cite source passages.

## Source and boundaries

PRD §§1, 3; explicit FR-04 source-document ownership; architecture AD-4, AD-8. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] Each seeded passage has source ID, section ID, version, effective interval, and policy/product scope.
- [ ] The seed covers policy wording needed for all four supported endorsement types with original-language text preserved.
- [ ] An owned policy resolves only to its applicable policy wording version; missing or stale wording is represented explicitly.

## Scope and out of scope

In scope: Seed synthetic, versioned policy wording for the demo products so authorized policy and future assessment views can cite source passages.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-02.

## Accepted decisions and readiness

Confirm the demo product count and source sections during refinement; FR-14's former three-product detail is not yet accepted as this ticket's seed. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Versioned wording appears in existing customer evidence views; no separate customer source-management page: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [evidence mockup](../../design/page/policy-evidence.html).

