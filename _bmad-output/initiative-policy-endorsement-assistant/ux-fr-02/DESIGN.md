---
name: Policy Endorsement Assistant
description: FR-02 session, owned policy, and request history extension.
status: final
updated: 2026-11-27
colors:
  canvas: '#F6FAF7'
  surface: '#FFFFFF'
  ink: '#163C32'
  muted: '#4B685E'
  accent: '#006B4F'
  border: '#D5E7DF'
  mint: '#D9F5E9'
  amber: '#FFBE24'
  danger: '#A32929'
typography:
  body: { fontFamily: 'Inter, "Noto Sans Thai", system-ui, sans-serif', fontSize: '16px', lineHeight: '1.6' }
  title: { fontFamily: 'Inter, "Noto Sans Thai", system-ui, sans-serif', fontSize: 'clamp(2.1rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.14' }
rounded: { sm: '9px', md: '16px' }
spacing: { gutter: '28px', section: '42px' }
components:
  primary-button: { background: '{colors.accent}', text: '{colors.surface}', radius: '{rounded.sm}' }
  secondary-button: { background: '{colors.surface}', text: '{colors.ink}', border: '{colors.border}', radius: '{rounded.sm}' }
  status-chip: { background: '{colors.mint}', text: '{colors.ink}', radius: '{rounded.sm}' }
---

# Brand & Style

Extend the FR-01 customer interface and its provisional green and mint direction. Session controls and request history are quiet parts of the policy task, with no new brand treatment. The [FR-01 DESIGN.md](../ux-fr-01/DESIGN.md) supplies the existing visual context.

# Colors

Use {colors.ink} for all policy and request facts. Use {colors.danger} for access and session errors. An expired status can use a neutral border or small {colors.amber} accent, but the word `EXPIRED` or its Thai equivalent remains visible.

# Typography

Use {typography.body} for Thai and English copy. Policy numbers, request details, and status must remain readable at 16px body size.

# Layout & Spacing

Keep one task-led reading flow: account controls, owned policy selection and status, request action or refusal, then request history. On wide screens the policy and request panels may sit side by side; on narrow screens stack them in that order with 16px side gutters. The sign-out control stays discoverable without competing with the request action.

# Elevation & Depth

Use the FR-01 light panel border and single subtle shadow. Avoid nested panels for each history field.

# Shapes

Keep {rounded.sm} controls and {rounded.md} panels. Controls have a minimum 44px target height and a visible focus ring.

# Components

Sign-out uses {components.secondary-button}. Policy status uses {components.status-chip} with text. An expired policy replaces the request form with an explanatory read-only state; it does not show an apparently usable submit button. Request history uses a simple ordered list with policy number, proposed details, timestamp, and a non-binding note.

# Do's and Don'ts

Say that submitted requests and expired policies do not change coverage. Do not use success styling for a refused action or expose another account's existence through labels or counts.

[Session and policy mockup](../../../design/page/session-and-policies.html)
