---
name: I02 endorsement backlog experience
status: draft
updated: 2026-11-27
sources:
  - docs/backlog/README.md
  - docs/PRD.md
---

# I02 backlog experience contract

## Foundation

Responsive web for authenticated customers with synthetic policy data. [DESIGN.md](DESIGN.md) owns visual tokens and component appearance. This file owns customer journeys, behavior, and states. The UI never changes a live policy or binds coverage. The shared design system is the [theme](../../../design/theme.css); application component choices remain open until implementation.

## Information Architecture

The journey strip links the six customer sections. It marks the section currently being viewed; it does not imply that a request, assessment, or decision is complete. Policy detail and expanded coverage share the Policies section; both request language variants share Request; decision history shares Decision. Authorization and stage eligibility remain enforced by the eventual application, not by the visual navigation.

| Surface | Backlog | Customer answer and next action | Mockup |
| --- | --- | --- | --- |
| Sign-in | FR-01, FR-02 | Identify the synthetic account; continue to owned policies. | [Sign-in](../../../design/page/sign-in.html) |
| Policy list and detail | FR-01, FR-02, FR-14 | See owned policies, current facts, status, and available requests. | [List](../../../design/page/policies.html), [detail](../../../design/page/policy-detail.html), [expanded detail](../../../design/page/policy-detail-coverage.html) |
| Request capture | FR-01, FR-03 | Enter one beneficiary, address, frequency, or rider request; see that it was recorded only. | [English request](../../../design/page/create-endorsement-request.html), [Thai beneficiary](../../../design/page/beneficiary-request-th.html), [Thai other requests](../../../design/page/request-types-th.html) |
| Policy and rule evidence | FR-04–FR-06 | Inspect available source identity, version, section, and unresolved state. | [Evidence](../../../design/page/policy-evidence.html) |
| Eligibility | FR-07 | See Can proceed, Cannot proceed, or Needs review with reason and cited support. | [Assessment](../../../design/page/check-endorsement-eligibility.html) |
| Proposal and decision | FR-08–FR-10 | Review exact current/proposed values and source-backed assessment; record one decision. | [Proposal and decision](../../../design/page/proposal-review.html) |
| History | FR-11 | See approved and rejected decisions with times and proposals; policy remains unchanged. | [History](../../../design/page/change-history.html) |

FR-12 audit and safety checks and FR-13 integrated evaluation/Compose add no customer surface. Their UI obligation is to verify these surfaces and their failure states. FR-04–FR-06 and FR-08 are service work; their customer-facing presentation belongs to evidence, assessment, and proposal screens. FR-14 is post-MVP. The [handoff map](ux-endorsement-backlog.md) records criterion coverage and limits.

## Voice and Tone

Use short, literal Thai and English copy. Keep technical source IDs in evidence metadata, not as the only explanation. Use “Request recorded,” “Can proceed,” “Needs review,” “Proposed change,” and “Decision recorded” for distinct stages. Say “Approval records your decision; it does not change your policy or coverage.” Never say “Policy updated” for an approved proposal.

## Component Patterns

| Component | Behavior |
| --- | --- |
| Language switch | Switch UI labels and explanations without changing source quotations, numeric values, or decision state. Preserve the current page and form content where safe. |
| Policy row | Open only an owner-authorized policy. An EXPIRED policy remains readable and has no request action. |
| Request fields | Change type reveals only its fields. Validate beneficiary total and required inputs before submission; server remains authoritative. |
| Source link | Opens the exact versioned passage with source title, section, version, effective interval, and original language. Broken or unavailable support becomes an unresolved explanation. |
| Assessment result | Shows a reason and next action for each status. Only Can proceed can lead to proposal preparation. |
| Proposal comparison | Group each field's current and proposed values, unit, period, and change state. Display server values verbatim; no client calculation. |
| Decision control | Confirm the selected action. Disable repeat submission while pending. Show only the recorded result after success; a stale proposal returns to reassessment. |
| History row | Open the recorded proposal; display approved and rejected outcomes, decision time, and the non-binding meaning. |

## State Patterns

| State | Treatment |
| --- | --- |
| Loading | Name the item being loaded; keep heading and navigation available. |
| Empty | Explain that no owned policy, request, or decision exists, with a relevant next action. |
| Validation error | Place an error at the field and a short summary near submit; preserve entered values. |
| Session ended | Clear protected content and return to sign-in with a session-ended explanation. |
| Unowned or missing | Use one non-disclosing unavailable state; never reveal another account's identifier or content. |
| EXPIRED policy | Allow read-only facts and citations; remove request action. |
| Missing, stale, conflicting evidence | State Needs review and the gap; do not show a positive assessment, quote, or decision action. |
| Dependency failure | Explain temporary unavailability and offer retry when safe; never present a fabricated result. |
| Quote unavailable or expired | Show no calculated amount or decision control; offer reassessment. |
| Pending proposal | Show non-binding notice, comparison, citations, and one decision area. |
| Approved or rejected proposal | Show recorded outcome and time; remove decision controls; policy stays unchanged. |

## Interaction Primitives

Use semantic form controls, buttons, anchors, and a labelled confirmation dialog. Keep visible focus and keyboard order consistent with reading order. Move focus to validation or submitted-result heading when the page changes. Prevent double submission in the UI, while the API enforces atomic and idempotent decisions. Do not perform eligibility, rating, premium, or benefit calculations in the browser.

## Accessibility Floor

Persist labels; connect field errors and live results to controls. Use text with every status and changed/unchanged indicator. Source links and decision controls must work by keyboard. Maintain readable amounts, percentages, Thai copy, and long source metadata at 320px without horizontal scrolling. A dialog must have a name, focus entry, Escape/cancel behavior, and focus return.

## Responsive & Platform

Desktop can use paired subcolumns for current/proposed facts. At 320px, keep each pair in one stacked group and retain “Current” and “Proposed” labels. No hover-only disclosure or different data set on mobile. Use `{spacing.page-mobile}` and `{colors.primary}` from DESIGN.md.

## Key Flows

### Narin records a beneficiary request

1. Narin signs in to the synthetic account, opens an owned ACTIVE policy, and chooses beneficiary change.
2. Narin enters the complete replacement list in Thai or English and sees exact allocations and total.
3. The server accepts the request. **Climax:** Narin sees “Request recorded” and understands no policy change or coverage approval has occurred.
4. If the policy is EXPIRED or not owned, no request is recorded.

### Narin assesses and decides on a payment change

1. Narin records a frequency change, then opens the assessment with policy wording and rule citations.
2. If both supports are valid, the result says Can proceed and a proposal shows exact server-returned amount, period, and unchanged fields.
3. Narin reads the non-binding notice, confirms approval or rejection, and sees the recorded time. **Climax:** the decision appears in history while the underlying policy remains unchanged.
4. Missing or conflicting evidence gives Needs review; an expired quote requires reassessment; neither exposes a decision action.

### Narin inspects a disputed source

1. Narin opens a sourced policy fact or assessment reason.
2. The source view exposes title, version, section, effective interval, and original-language excerpt.
3. **Climax:** Narin can distinguish a confirmed fact from an unresolved one without accepting an invented value.
