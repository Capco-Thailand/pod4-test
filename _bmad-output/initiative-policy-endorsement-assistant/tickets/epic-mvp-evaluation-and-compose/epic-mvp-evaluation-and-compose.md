---
type: epic
title: "The complete MVP runs and meets its evaluation targets"
parent: initiative-policy-endorsement-assistant
covers: [R9, R10]
sources:
  - _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md
companions: []
after: [epic-decisions-and-audit-history]
refined: false
risk: high
---

# The complete MVP runs and meets its evaluation targets

## Description

Integrate the customer journey from sign-in through decision history in Docker Compose with seeded synthetic data. Run and report the PRD's classification, retrieval, assessment, proposal, quote, access, and policy-write evaluations.

## Outcome

The complete synthetic MVP runs reproducibly and meets every evaluation target in the PRD.

## Done when

- The full customer journey runs with seeded synthetic data through Docker Compose.
- The evaluation report meets all targets in PRD section 4 and the protocol in the testing standard.
- Safety checks show zero unauthenticated protected actions, unauthorized approvals, cross-account access, live policy writes, and coverage binding in the integrated demo environment.

## Boundaries

- This epic owns full-system evaluation and reproducible Compose delivery; each preceding epic owns its feature checks.
- Production identity, insurer integration, medical underwriting, issuance, and live coverage changes remain outside scope.

## References

- parent — _bmad-output/initiative-policy-endorsement-assistant/initiative-policy-endorsement-assistant.md, Requirements R9–R10 and Constraints
- testing — docs/TESTING_STANDARD.md, Evaluation protocol

## Notes

- Waits on epic-decisions-and-audit-history because: the complete journey and audit evidence are needed for integrated evaluation.
