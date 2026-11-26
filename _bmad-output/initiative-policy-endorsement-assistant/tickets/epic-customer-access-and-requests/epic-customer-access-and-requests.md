---
type: epic
title: "Customers access policies and create requests"
parent: initiative-policy-endorsement-assistant
covers: [R1, R2]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions:
  - _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md
after: []
refined: true
risk: high
---

# Customers access policies and create requests

## Description

Establish the runnable application and test baseline, sign-in and sign-out, account-scoped policy access, and creation of one of the four supported request types for an active policy. Establish the audit event contract later epics use.

## Outcome

A signed-in customer can see their own policies and submit a supported request only for an active policy in the running demo app.

## Requirements

R1 (parent R1): A customer can sign in and out with a synthetic account, view only their own policies and requests, and receive a rejected result for unauthenticated or cross-account access.

R2 (parent R2): A customer can submit beneficiary, correspondence-address, payment-frequency, or accidental-death-rider requests for an owned ACTIVE policy; an owned EXPIRED policy remains viewable but cannot create a request.

## Constraints

- C1 (parent C1): All accounts, policy records, and request data are synthetic.
- C2 (parent C2): Fastify derives the actor from a server-managed session, checks ownership before protected reads, and checks active status before request creation.
- C5 (parent C5): The rider request neither collects nor assesses medical evidence and discloses that real coverage may need further review.
- C6 (parent C6): A request never changes policy or coverage data or binds coverage.
- C7 (parent C7): Sign-in, policy, and request screens support Thai and English; source passages, when displayed, retain their original wording.

## Done when

- A demo customer signs in and out and sees only policies linked to their account.
- A customer submits each supported request type for an active policy; an owned expired policy is visible but cannot create a request.
- Unauthorized and cross-account access is rejected for reads and writes, and the capability runs in the integrated demo environment.
- A customer can use the sign-in, policy, and request journey in Thai or English.

## Boundaries

- This epic owns the app baseline and shared request and audit contracts; cited assessment belongs to the next epic.
- No request here changes a policy or binds coverage.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R1–R2 and Constraints
- architecture — _bmad-output/initiative-policy-endorsement-assistant/architecture-policy-endorsement-assistant/architecture-policy-endorsement-assistant.md, AD-1–AD-3 and AD-6–AD-8

## Notes

- Decision: 2026-11-26 — Shared service, data, session, and audit contracts are settled in the adopted architecture spine.
- Decision: 2026-11-26 — Customer-facing UI supports Thai and English; the UX handoff still sets visual style and language-switch behavior.
- Decision: 2026-11-26 — Draft the first story as a bilingual beneficiary request through web, API, database, and audit, establishing the runnable baseline for the remaining request types.
