# FR-06: Authorized evidence retrieval

**Title:** [Story] Authorized evidence retrieval
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-06
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Retrieve cited policy wording and applicable rules from vector storage only after authorization and eligibility gates.

## Source and boundaries

PRD §§2–4; initiative R3; architecture AD-2, AD-4. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] The API checks session, policy ownership, and ACTIVE status before endorsement retrieval.
- [ ] Ranking is limited to the authorized policy, product, change type, and effective date; results include source, version, section, and exact cited span.
- [ ] Missing, stale, or contradictory sources cannot be silently replaced with unrelated passages.
- [ ] Cross-account and ineligible requests cause no retrieval call.

## Scope and out of scope

In scope: Retrieve cited policy wording and applicable rules from vector storage only after authorization and eligibility gates.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-04 and FR-05.

## Accepted decisions and readiness

Choose embedding model, retrieval threshold, and bounded result count in the detailed ticket. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Authorized retrieval results and unresolved evidence use existing customer views; no retrieval control: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [evidence mockup](../../design/page/policy-evidence.html).

