# FR-02: Session and policy ownership

**Title:** [Story] Session and policy ownership
**Labels:** `type:story`, `role:dev`
**GitHub Issue:** Pending ticket/UX PR merge
**Feature ID:** FR-02
**Product context:** [PRD](../PRD.md)
**Risk:** High
**State:** Backlog draft

## Summary and objective

Customers can sign out and view only their own policies and requests; owned EXPIRED policies remain readable but cannot start a request.

## Source and boundaries

PRD §§1–3, 5; initiative R1–R2; architecture AD-2, AD-3, AD-7. All work uses synthetic data. Authorization and non-binding coverage rules apply at the API boundary.

## Acceptance criteria (draft)

- [ ] The API derives the actor from an opaque server-managed session and invalidates it on sign-out.
- [ ] Protected reads and writes reject missing sessions and cross-account policy or request IDs without leaking another customer's data.
- [ ] An owned EXPIRED policy is viewable in Thai and English, while request creation is refused.
- [ ] Cookie-authenticated state changes enforce CSRF protection and create appropriate audit outcomes.

## Scope and out of scope

In scope: Customers can sign out and view only their own policies and requests; owned EXPIRED policies remain readable but cannot start a request.

Out of scope: production identity and customer data, document upload, eKYC, underwriting, insurer integration, issuance, live-policy updates, and coverage binding.

## Dependencies

FR-01.

## Accepted decisions and readiness

Rebuild or review the former FR-02 ticket before implementation; settle session expiry and negative-case details. A selected draft still needs detailed contracts, relevant UX references, and reviewed acceptance criteria before implementation.

## UX handoff references

Session, owned-policy, and expired read-only design: [UX handoff](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/ux-endorsement-backlog.md), [DESIGN.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/DESIGN.md), [EXPERIENCE.md](../../_bmad-output/initiative-policy-endorsement-assistant/ux-endorsement-backlog/EXPERIENCE.md), [sign-in](../../design/page/sign-in.html), [policies](../../design/page/policies.html), [policy detail](../../design/page/policy-detail.html).

