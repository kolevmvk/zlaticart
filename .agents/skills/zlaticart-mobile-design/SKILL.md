---
name: zlaticart-mobile-design
description: Design, implement, or review ZlaticArt React Native admin screens and shared UI components. Use for Android application layout, visual consistency, forms, and interaction states; public website art direction is separate.
---

# ZlaticArt mobile design

All project paths below are relative to the repository root. Read `addmin-app/docs/11-LIVE_PLAN.md`, `addmin-app/docs/06-SCREENS.md`, and the relevant screen code. For implementation, also read `addmin-app/skills/crud-screen-pattern.md`.

## Visual system

Reuse `addmin-app/src/theme/colors.ts` and `typography.ts`; add semantic tokens there when needed. Keep canvas/ink/gold identity. Gold is an accent; verify text contrast on its actual background. Use serif for editorial headings, sans for controls and body text. Centralize spacing, text sizes and component variants instead of repeating screen-specific literals. Do not introduce a UI library or replace the theme merely to speed one screen.

Build the smallest shared components needed for the current slice under `addmin-app/src/components/`. Candidates are Button, Field, ArtworkCard, StatusBadge, ImagePickerField, Feedback, Screen and FormActions; these are proposed components, not claims that they already exist. Define props and ownership before other agents consume them. Share presentation primitives, not a universal CMS form that hides type-specific validation.

## Reference screens and behavior

- Dashboard: prioritize adding a work and continuing a draft; show recent work/counts only when backed by data. Remove development labels. Unimplemented sections must not look actionable. Make content reachable on small screens and with larger text.
- Works list: readable thumbnails, title and labeled status; named actions for status changes instead of accidental cyclic publication on badge taps. Search/filter behavior follows actual data capabilities.
- Artwork form: clear labels, basic fields first, optional details progressively disclosed. Consistent Save draft → Preview → Publish flow, adapted for narrow widths. Keep actions reachable above the keyboard and within safe insets.
- Distinguish saved draft, unsaved edits, published version and preview. A visual redesign must not silently alter publication semantics. Coordinate changes with API owner.
- Use meaningful Serbian user-facing messages, without phase numbers, internal CMS details or raw errors. Do not invent artist content for production.

## Android quality

Support system Back, dirty-form navigation, keyboard scrolling, focus, safe insets and increased font size. Aim for at least 48 dp touch targets as a project design target. Label controls and expose roles/states to accessibility tools; status must not depend only on color. Use stable testID values for automation, separate from human-readable labels.

Design loading, empty, error, uploading and success states alongside normal content. Show real upload progress only if measured; otherwise use an indeterminate state. A retry must preserve input and coordinate with API idempotency. Do not promise offline persistence until implemented.

## Workflow and evidence

Start by identifying the task, screen state and existing reusable components. Implement or review one representative flow before multiplying the pattern across sections. Inspect screenshots from the running Android app, including keyboard and enlarged text; distinguish code-only findings from observed visual failures. Follow `addmin-app/skills/verification-checklist.md` for relevant checks. Website browser screenshots cannot establish native Android behavior.

Report changed screens/components, tested device/build, evidence and unresolved issues. The coordinator updates the shared plan. Do not mark the design complete from TypeScript checks alone.
