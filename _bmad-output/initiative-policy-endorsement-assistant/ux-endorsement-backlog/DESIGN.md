---
name: I02 Policy Endorsement Assistant
description: Responsive customer UI for synthetic, non-binding endorsement requests.
status: draft
updated: 2026-11-27
sources:
  - docs/backlog/README.md
  - docs/UX_THEME_FOUNDATION.md
colors:
  background: 'design/theme.css --background'
  card: 'design/theme.css --card'
  foreground: 'design/theme.css --foreground'
  muted: 'design/theme.css --muted'
  border: 'design/theme.css --border'
  primary: 'design/theme.css --primary'
  success: 'design/theme.css --success-foreground'
  warning: 'design/theme.css --warning-foreground'
  destructive: 'design/theme.css --destructive'
typography:
  body:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    note: 'Use the shared theme hierarchy for heading, body, label, and supporting text.'
rounded:
  control: 7px
  panel: 10px
spacing:
  page-mobile: 16px
  page-desktop: 32px
  section: 24px
components:
  primary-action:
    background: '{colors.primary}'
    radius: '{rounded.control}'
    minHeight: 42px
  fact-panel:
    background: '{colors.card}'
    border: '{colors.border}'
    radius: '{rounded.panel}'
  status-label:
    note: 'Pair semantic color with explicit status words.'
---

# I02 backlog visual contract

## Brand & Style

A calm, factual customer service interface. The shared [theme](../../../design/theme.css) is the visual source. Each page leads with the customer's immediate question, keeps the synthetic context visible, and places consequences next to actions. This draft covers FR-01–FR-14; the [experience contract](EXPERIENCE.md) owns behavior. The contracts win if a mockup differs.

## Colors

Use `{colors.background}` for the canvas, `{colors.card}` for content, and `{colors.foreground}` for primary text. `{colors.primary}` marks the main action and focus. Status colors are secondary to words such as Active, Needs review, and Rejected. Never use color alone to distinguish current from proposed values.

## Typography

Use `{typography.body.fontFamily}` and the shared theme's heading, body, label, and support hierarchy. Keep policy IDs, dates, amounts, currency, and period readable. Use tabular numerals for money and percentages. Thai and English must both wrap without clipping.

## Layout & Spacing

Use one clear reading path. At desktop, comparisons may align columns within one field group. At 320px, stack the current and proposed values under the same field label, retain both labels, and use `{spacing.page-mobile}`. Place the non-binding notice before decision controls. The [policy detail](../../../design/page/policy-detail.html) and [proposal review](../../../design/page/proposal-review.html) are visual references; other delivered pages are listed in the [handoff](ux-endorsement-backlog.md).

### Redesigned screen hierarchy

The six-part journey strip groups Access, Policies, Request, Evidence, Assessment, and Decision. Its highlighted item means the current section, not completed work or a verified outcome. Each page leads with its task and a plain-language description; state previews sit after the customer content and use a subdued dashed treatment. Sign-in uses a reading column beside the form on desktop and one column on mobile. Policy cards keep status, term, and action together. Form choices have a visible selected border. Evidence quotes receive their own text hierarchy. Assessment results group status, reason, and next action. Proposal rows keep current and proposed values in one field group and retain both labels when stacked.

## Elevation & Depth

Separate sections with space and one light border. Avoid decorative shadows, gradients, and repeated cards around single facts.

## Shapes

Controls use `{rounded.control}`; major panels use `{rounded.panel}`. Status labels can be compact, but text carries their meaning.

## Components

| Part | Visual contract |
| --- | --- |
| Policy snapshot | Product, ID, status, term, and current facts stay together. |
| Request form | Persistent labels and error text; beneficiary allocations show exact percentages and a total. |
| Evidence reference | Visible source title, version, section, and link to the quoted span. |
| Assessment result | Status word, reason, next action, and any unresolved source are adjacent. |
| Proposal comparison | Each current/proposed pair includes unit and period; changed or unchanged is written. |
| Decision area | Non-binding boundary, then decision controls or recorded outcome. |
| History row | Outcome, proposal summary, decision time, and unchanged-policy meaning. |

## Do's and Don'ts

Show exact server-returned money and benefits; never add browser-calculated deltas. Show missing or conflicting evidence as unresolved; never fill it with a guess. Label recorded requests, eligibility results, proposals, and decisions as different stages. Do not style any stage as issued coverage. Avoid generic dashboard layouts and decorative charts.
