# Design standard

PO/UX design output is browser-viewable HTML, CSS, and JavaScript under `design/`. These files show intended pages and interactions; the new project's application architecture determines where the implemented UI lives.

For the current I02 customer mockups, the [UX theme foundation](UX_THEME_FOUNDATION.md) defines the shared visual roles. `design/theme.css` supplies the [theme preview](../design/page/shadcn-theme-preview.html) tokens to every mockup. The older pages use `design/global.css`, which imports that theme; FR-15 pages import the theme directly. Keep page layouts specific to their tasks.

For every UI or UX design task, use [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) to check each affected screen's layout, type hierarchy, responsive behavior, interaction, and accessibility. This includes design exploration, mockups, edits, and reviews inside or outside `bmad-ux`. Record applied checks and accepted choices in the UX handoff or review; keep `DESIGN.md`, `EXPERIENCE.md`, and the shared theme tokens in `design/theme.css` authoritative.

## Layout

- `design/theme.css`: shared colors, typography, control and status tokens for customer mockups.
- `design/global.css`: shared page styles for older mockups; imports `design/theme.css`.
- `design/components/<name>.html`: reusable component markup; add component-specific CSS or JavaScript beside it when needed.
- `design/page/<name>.html`: complete page mockups that reference shared components and either `global.css` or `theme.css` plus page-specific CSS.
- `design/page/index.html`: navigation page linking to the available page mockups.

Use semantic HTML and working relative asset paths. Keep page-specific behavior in a page JavaScript file so a mockup can be previewed without the application.

## BMad UI handoff

For UI work, `bmad-ux` reads the ticket requirements first, then this standard, the [UX theme foundation](UX_THEME_FOUNDATION.md), and [VISUAL_UX_CONSTRAINTS.md](VISUAL_UX_CONSTRAINTS.md). It records visual and behavior decisions in `DESIGN.md` and `EXPERIENCE.md`, creates browser-viewable `design/page/<pagename>.html` mockups using the shared theme, and links them from `design/page/index.html`. The UX handoff names the delivered page paths. The two UX documents govern if a mockup differs.

Sofia (`bmad-agent-po`) adds the UX documents and page paths to the ticket. `bmad-build` reads those references before implementing the UI and verifies the ticket's UI states and accessibility behavior. Add API and browser E2E coverage where the criterion needs them; a human walkthrough complements the automated evidence.

The UX/UI process ends with one pull request containing the requirement ticket and completed handoff. After validating the UX documents and browser-viewable mockups, commit the ticket and handoff files on a task branch, push it, and open a PR against the intended base. Include the ticket and delivered design paths in the PR. The implementation remains a separate `bmad-build` step after review.

## Component references

Reference reusable fragments from pages with an include marker, for example:

```html
<include src="../components/example-summary.html"></include>
```

`<include>` is a design convention, not native HTML. A page using it must provide a preview loader or build step that resolves the marker, so the delivered page renders its components. Keep the fragment's source in `design/components/` rather than copying its markup into each page.
