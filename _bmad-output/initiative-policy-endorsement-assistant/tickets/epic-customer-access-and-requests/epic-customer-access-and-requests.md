---
type: epic
title: "Customers access policies and create requests"
parent: initiative-policy-endorsement-assistant
covers: [R1, R2]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions: []
after: []
refined: false
risk: high
---

# Customers access policies and create requests

## Description

Establish the runnable application and test baseline, sign-in and sign-out, account-scoped policy access, and creation of one of the four supported request types for an active policy. Establish the audit event contract later epics use.

## Outcome

A signed-in customer can see their own policies and submit a supported request only for an active policy in the running demo app.

## Done when

- A demo customer signs in and out and sees only policies linked to their account.
- A customer submits each supported request type for an active policy; expired policies cannot create requests.
- Unauthorized and cross-account access is rejected, and the capability runs in the integrated demo environment.

## Boundaries

- This epic owns the app baseline and shared request and audit contracts; cited assessment belongs to the next epic.
- No request here changes a policy or binds coverage.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R1–R2 and Constraints

## Notes

- Open question: Shared service, data, session, and audit contracts require an architecture decision before dependent stories are built.
