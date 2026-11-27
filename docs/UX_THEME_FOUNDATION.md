# Customer UX theme foundation

Use [the theme preview](../design/page/shadcn-theme-preview.html) as the visual reference for new customer mockups. [The shared stylesheet](../design/theme.css) owns its tokens, and `design/global.css` applies them to the earlier page patterns. FR-15 reference pages also import the shared theme. This branch contains design artifacts and BMad UX handoffs; the application stylesheet will be established when the new app is built.

## Visual rules

| Role | Foundation |
| --- | --- |
| Typeface | Public Sans, with system sans-serif fallback; maintain a clear heading, body, label, and supporting-text hierarchy. |
| Canvas and surfaces | Pale `--background` canvas from the preview; white `--card` content surfaces. |
| Text and borders | `--foreground`, `--muted`, and `--border` from the preview. |
| Primary action and focus | Rose `--primary`; use text labels and a visible focus outline. |
| Controls | 7px control radius, at least 42px target height, persistent labels, and clear error text. |
| Panels | 10px panel radius and a single light border; avoid decorative shadows. |
| Status | Success, warning, and destructive tokens are secondary to explicit status words. |

Keep each page's layout driven by its task and content. The preview is a theme and component reference, not a template for every screen. For responsive mockups, retain labels beside their values, readable comparisons, and no horizontal scrolling at 320px. Keep synthetic and non-binding explanations where the underlying ticket requires them.

## BMad handoff rule

For new or updated UI work, read this foundation after the ticket and project design standards. In `DESIGN.md`, inherit the named roles from `design/theme.css` and specify only screen-specific visual decisions. In `EXPERIENCE.md`, describe behavior and states without redefining colors or type. Use the shared stylesheet in every `design/page/` mockup; add page CSS only for task-specific layout and components. Check the rendered page at desktop and 320px before finalizing. Older finalized UX contracts remain historical records; this foundation applies to future work and the current mockup styling.
