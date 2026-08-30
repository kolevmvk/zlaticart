# ZlaticArt — Animation, Gallery UX and Claude Code Execution Brief

**Date:** 2026-08-30  
**Scope:** Live site `https://www.zlaticart.com`, local repo `/Volumes/KoleOPS/zlaticart`, with focus on the oil-paint scroll effect, desktop gallery interaction, responsive element sizing, and execution structure for Claude Code agents/skills.

## Context

The site is intentionally CMS-driven. Placeholder-like content such as untitled works, exhibition history, education copy, social links, and contact data should not be treated as a code defect when it is expected to be supplied by the artist through the admin panel.

This report focuses on the parts that are code/design responsibility:

- the expected animated oil-paint / color-spill experience during scroll or pull
- desktop gallery sections where images should move left/right or otherwise feel interactive
- responsive sizing and visibility of UI elements
- motion quality needed for a premium artist website suitable for global web-design competitions
- suggested Claude Code agents and skills for implementation

## Executive Summary

The current site has a strong technical foundation: Next.js, GSAP, Lenis, WebGL shader hero, responsive `next/image`, and a CMS-backed content layer. The main gap is that the experience does not yet consistently feel like a top-tier animated artist website after the first hero reveal.

Two findings are especially important:

1. The oil-paint / color-spill scroll effect exists in code, but it is too easy for users not to perceive it. It is implemented as a subtle shader "glass sweep" tied to hero scroll progress, not as an unmistakable oil-color spill or pull interaction.
2. The desktop horizontal gallery/medium strip is not truly functional as a left-right interactive section. It is visually laid out as an editorial strip, but on desktop it is explicitly set to `md:overflow-visible`, so there is no real desktop scroll/drag/left-right gallery behavior.

## Confirmed Findings

### P0 — Oil color spill / scroll-pull effect is present but not visually convincing

Relevant files:

- `src/components/hero/HeroGL.tsx`
- `src/lib/gl/brushShader.ts`
- `src/components/hero/LivingCanvas.tsx`
- `.claude/skills/living-canvas/SKILL.md`

Current implementation:

- `HeroGL` is the hero currently used on the homepage.
- It drives a WebGL shader with `uProgress`, `uTime`, `uScrollT`, and `uGlassStrength`.
- The scroll effect is called `glass-sweep oil smear` in `brushShader.ts`.
- `glassEnvelope()` in `HeroGL.tsx` intentionally keeps the effect off until scroll progress `0.15`, strongest between roughly `0.55` and `0.85`, then fades out.
- The ScrollTrigger ends at `70% top`, while the hero itself is not pinned.
- On touch/small screens, `glassDeviceScaleRef` halves the strength.

Why this fails visually:

- The effect reads more like a subtle refraction/smear than a recognizable oil-paint color spill.
- Because the hero is not pinned, the strongest phase happens while the hero is already leaving the viewport.
- If the user scrolls quickly, the effect can be missed.
- On mobile/touch, the already subtle effect is reduced further.
- The word "glass" in the implementation concept points to the wrong material language; the desired experience is oil pigment, wet paint, drag, pressure, viscosity, and color bleed.

Recommended direction:

- Replace or strongly amplify the scroll phase from "glass sweep" to "pigment pull".
- Pin the hero for a short controlled distance, for example `100svh` to `140svh`, without creating a long intro gate.
- Map scroll/pull to visible paint behavior: pigment stretch, wet edge, chromatic drag, bristle gaps, pressure bands, and slight canvas relief.
- Keep the automatic opening reveal short, then hand control to scroll/touch immediately.
- Add a debug/dev-only control for `uScrollT`, `uGlassStrength`, spill width, drag amount, and band color contribution so the art director can tune it visually.
- Preserve `prefers-reduced-motion` and a static fallback.

Suggested implementation options:

1. Keep `HeroGL`, but rename and redesign uniforms from glass semantics to pigment semantics:
   - `uPigmentPull`
   - `uSpillStrength`
   - `uWetEdge`
   - `uBristleBreakup`
   - `uPressure`
2. Reuse ideas from `LivingCanvas.tsx`, which already has brush stamp logic and desktop horizontal sweeps, but do not switch blindly. It is currently unused by the homepage.
3. Consider a hybrid: WebGL image shader for performance and material richness, plus a small Canvas2D/offscreen mask generator for believable bristle breakup.

Acceptance criteria:

- At normal scroll speed, a non-technical viewer can describe the effect as oil paint or pigment moving across the artwork.
- The effect is visible on desktop, tablet, and mobile, with mobile tuned separately instead of simply weaker.
- Scroll never feels locked for too long.
- Reduced-motion users get a clean static artwork hero.
- No visible jank on mid-range mobile hardware.

### P0 — Desktop horizontal gallery / media strip is not functionally interactive

Relevant file:

- `src/components/sections/MediaTransitions.tsx`

Current implementation:

- The strip is a flex row of representative works by medium.
- On mobile it uses `overflow-x-auto` and `scrollSnapType: x mandatory`.
- On desktop the class is `md:overflow-visible`, which disables the horizontal scroll behavior.
- The only desktop animation is a one-time `x: 40 -> 0` entrance plus vertical image parallax.

Why this fails:

- If the intended desktop UX is "images move left/right", the current implementation does not provide it.
- Desktop users cannot drag/scroll horizontally through the strip as an intentional interaction.
- The row can visually extend beyond the viewport, but that is not the same as a functional gallery.
- There are no arrows, drag affordance, scroll progress indicator, cursor hint, or wheel-to-horizontal behavior.

Recommended direction:

- Decide whether this section should be a true horizontal gallery or an editorial static strip. For the expected premium animated site, make it a true horizontal gallery.
- Use a pinned horizontal-scroll section on desktop:
  - section pins vertically
  - vertical scroll maps to horizontal `xPercent`
  - cards pass through the viewport with scale/opacity/focal-point choreography
  - show a minimal progress rail or index
- On desktop pointer devices, support drag inertia or wheel-driven horizontal movement.
- On mobile, keep native horizontal scroll with snap, but add a visual cue that more cards exist.
- Make overlay labels visible or discoverable on touch, not hover-only.

Acceptance criteria:

- Desktop gallery visibly moves left/right during scroll or drag.
- The motion has clear start/end states and does not strand content offscreen.
- Keyboard users can tab through every work.
- Mobile still has native-feeling horizontal scroll.
- No unintended page-level horizontal overflow.

### P1 — Selected Works is visually strong, but animation is too simple for the target quality bar

Relevant files:

- `src/components/works/SelectedWorks.tsx`
- `src/components/works/ArtworkCard.tsx`

Current implementation:

- Desktop uses an asymmetric editorial grid.
- The whole section rises from `y: 60 -> 0` on scroll.
- Cards use hover scale and a medium overlay.

Gap:

- This is tasteful, but not competition-level by itself.
- The hero-to-gallery handoff is conceptually mentioned in comments, but the visual relationship is weak in production.
- The first work below the hero should feel like it emerges from the same pigment/canvas system, not like a separate section appearing below.

Recommended direction:

- Animate the first Selected Works card as a continuation of the hero artwork:
  - hero image subtly scales/fades into the first work frame
  - gallery metadata appears like museum labels after the image settles
  - secondary cards stagger in with different y/parallax values
- Add per-card pointer preview only if it does not compete with artwork.
- Keep metadata restrained and gallery-like.

Acceptance criteria:

- The transition from hero to works feels intentional and continuous.
- Cards do not all animate identically.
- Hover/touch behavior communicates interactivity without becoming ecommerce-like.

### P1 — Navigation and small UI elements need larger interaction targets

Relevant files:

- `src/components/nav/Navigation.tsx`
- `src/components/ui/LanguageToggle.tsx`
- `src/app/globals.css`

Observed issue:

- Header links and the language toggle are visually small.
- Desktop nav links are around one text line high.
- Language toggle is especially small relative to recommended touch targets.

Recommended direction:

- Keep the visual typography elegant, but enlarge clickable boxes with padding.
- Target at least `44px` height for touch-relevant controls.
- Use `min-height`, `inline-flex`, and invisible padding rather than visually enlarging the text too much.
- Add safe-area padding for notched mobile devices because the root layout uses `viewport-fit=cover`.

Acceptance criteria:

- Header controls remain visually refined.
- Click/tap targets meet practical mobile/tablet usability.
- No nav text overlaps or compresses at tablet widths.

### P1 — Motion system lacks one shared choreography model

Relevant files:

- `src/components/ui/RevealHeading.tsx`
- `src/components/ui/ParallaxImage.tsx`
- `src/components/sections/MediaTransitions.tsx`
- `src/components/sections/TheArtist.tsx`
- `src/components/sections/StudioPreview.tsx`
- `src/components/journal/JournalHighlights.tsx`

Current implementation:

- Several components hand-roll GSAP/ScrollTrigger behavior.
- Reduced-motion checks are repeated across files.
- Parallax logic exists as a reusable component, but some sections duplicate similar behavior.

Recommended direction:

- Define a small motion system:
  - `useReducedMotion()`
  - shared `useScrollReveal()`
  - shared `useParallaxImage()` or stricter use of `ParallaxImage`
  - named easing/timing tokens
- Keep hero-specific code separate because it has unique WebGL needs.

Acceptance criteria:

- Most section animation is controlled by shared utilities.
- Reduced motion remains consistent.
- ScrollTrigger instances are cleaned up reliably on route change/unmount.

## Responsive Size Notes

### Desktop

- Hero wordmark scale is dramatic and appropriate.
- Nav/action controls are visually elegant but small.
- Selected Works image hierarchy works well, but it needs a stronger animated entrance/handoff.
- Media strip should not pretend to be horizontal if it cannot move horizontally.

### Tablet

- Layout generally adapts, but some typography behaves like scaled desktop rather than independently composed tablet design.
- Tablet should be treated as its own breakpoint for:
  - nav spacing
  - hero wordmark position
  - gallery card density
  - section spacing

### Mobile

- Hero is functional, but the scroll/pull pigment effect should be separately tuned for portrait.
- Mobile horizontal strip needs a visible "more content" cue.
- Touch targets need improvement.
- Hover-only overlays must be converted to visible/tap-friendly states.

## Recommended Implementation Plan

### Phase 1 — Fix the two experience blockers

Owner: `motion-engineer` with review from `art-director`

Tasks:

- Redesign the hero scroll effect from subtle glass sweep to visible oil pigment pull.
- Tune desktop/tablet/mobile separately.
- Add short hero pinning if needed.
- Make desktop `MediaTransitions` a real horizontal-scroll/drag section.
- Preserve reduced-motion fallback.

### Phase 2 — Improve gallery polish

Owner: `motion-engineer` and `art-director`

Tasks:

- Create a hero-to-Selected Works handoff.
- Stagger cards with varied motion, not identical fade/rise.
- Improve gallery labels and hover/touch behavior.
- Add progress/index affordance for horizontal gallery.

### Phase 3 — Responsive and accessibility hardening

Owner: `qa-performance`

Tasks:

- Test 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 widths.
- Verify no accidental horizontal overflow except intended scroll containers.
- Verify keyboard access through gallery sections.
- Verify touch targets and safe-area behavior.
- Verify reduced-motion mode.

### Phase 4 — Motion architecture cleanup

Owner: `motion-engineer`

Tasks:

- Extract shared reduced-motion hook.
- Consolidate repeated parallax/reveal logic.
- Confirm ScrollTrigger cleanup.
- Remove or archive unused `LivingCanvas.tsx` after deciding whether any brush logic should be reused.

## Existing Claude Code Agents to Use

The repo already contains useful Claude agents under `.claude/agents/`.

### `motion-engineer`

Use for:

- `HeroGL` shader work
- GSAP/ScrollTrigger timelines
- desktop horizontal gallery implementation
- scroll/pull oil effect
- reduced-motion and lifecycle cleanup
- mobile animation performance

Primary files:

- `src/components/hero/HeroGL.tsx`
- `src/lib/gl/brushShader.ts`
- `src/components/sections/MediaTransitions.tsx`
- `src/components/works/SelectedWorks.tsx`
- `src/components/ui/ParallaxImage.tsx`

### `art-director`

Use for:

- deciding whether the effect reads as oil paint or just generic distortion
- composition and visual hierarchy
- typography scale
- gallery rhythm
- preventing template-like UI

Primary review surfaces:

- homepage first viewport
- hero-to-gallery transition
- media strip
- `/works` gallery page
- mobile layout

### `qa-performance`

Use for:

- viewport verification
- Lighthouse/performance checks
- mobile Safari checks
- keyboard/focus checks
- reduced-motion checks
- horizontal overflow detection

Primary checks:

- no long scroll lock
- no animation jank
- no unreachable gallery content
- no accidental body horizontal overflow
- clickable controls large enough

### `content-cms`

Use only for CMS/admin behavior, not for hardcoding content.

Relevant note:

- Do not treat CMS-empty states as design bugs if the artist is expected to populate them.
- Do ensure empty states look intentional and do not say raw placeholder text in production unless that is accepted by the owner.

## Recommended New Claude Code Agents

### `shader-artist`

Purpose:

- Specialized WebGL/GLSL visual quality agent for pigment, bristle, smear, viscosity, canvas relief, color bleed, and performance-safe shader tuning.

Suggested prompt:

> You are the shader artist for ZlaticArt. Your job is to make the hero scroll effect read unmistakably as wet oil pigment being pulled across canvas, not as generic blur/glass/refraction. Work only in `src/lib/gl/brushShader.ts` and the minimum required uniforms in `src/components/hero/HeroGL.tsx`. Preserve reduced-motion behavior and do not add dependencies.

### `responsive-gallery-qa`

Purpose:

- Dedicated QA agent for gallery behavior across desktop/tablet/mobile.

Suggested prompt:

> You own gallery interaction QA for ZlaticArt. Verify `SelectedWorks`, `MediaTransitions`, and `/works` at 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 widths. Report clipped content, hidden interaction, hover-only mobile states, accidental horizontal overflow, touch target problems, and keyboard access issues.

### `interaction-designer`

Purpose:

- Designs precise interaction behavior before implementation, especially for horizontal scroll, drag, progress rail, cursor hints, and mobile affordances.

Suggested prompt:

> You are the interaction designer for ZlaticArt. Define exact behavior for the desktop horizontal gallery, mobile scroll strip, gallery labels, scroll progress, and hover/touch states. Keep the UI art-led and avoid ecommerce/product-card patterns.

## Recommended Claude Code Skills

### Existing skill: `living-canvas`

Use for:

- hero brush/pigment reveal
- hero transition into Selected Works
- deciding whether the effect looks like real paint

Required update:

- Expand the skill to cover `HeroGL` directly, because the current live homepage uses `HeroGL`, not `LivingCanvas`.
- Add a note that `LivingCanvas.tsx` is an unused implementation unless explicitly reintroduced.

### New skill: `oil-pigment-shader`

Purpose:

- Guide GLSL work for the scroll/pull oil effect.

Should include:

- pigment pull, not glass/refraction
- visible wet edge
- bristle breakup
- canvas relief
- scroll-mapped strength
- mobile-specific tuning
- reduced-motion fallback
- performance limits for fragment shader loops

### New skill: `horizontal-gallery-motion`

Purpose:

- Guide implementation of desktop horizontal gallery behavior.

Should include:

- pinned horizontal scroll with GSAP ScrollTrigger
- optional drag/inertia behavior
- keyboard accessibility
- mobile native scroll fallback
- progress rail/index
- no body-level horizontal overflow
- clear start/end states

### New skill: `responsive-art-site-qa`

Purpose:

- Repeatable visual QA checklist for this specific site type.

Should include:

- breakpoint list
- hero composition checks
- artwork crop/focal point checks
- touch target checks
- typography scale checks
- overlay/label visibility
- reduced-motion verification
- performance budget notes

## Suggested Claude Code Task Split

Run in this order. Avoid overlapping file edits between agents.

1. `interaction-designer`: define exact gallery and hero interaction spec in Markdown only.
2. `shader-artist`: implement oil-pigment scroll effect in `brushShader.ts` and `HeroGL.tsx`.
3. `motion-engineer`: implement desktop horizontal gallery in `MediaTransitions.tsx`.
4. `art-director`: review visual direction and request focused changes only.
5. `qa-performance`: run responsive/performance/accessibility verification and produce a launch-blocker list.
6. Main agent: integrate final fixes, run build/typecheck, update `docs/STATUS.md`.

## Concrete Next Actions

1. Update `living-canvas` skill to mention `HeroGL` as the active hero.
2. Create `oil-pigment-shader` skill.
3. Create `horizontal-gallery-motion` skill.
4. Implement a stronger scroll-controlled pigment pull in the WebGL hero.
5. Convert `MediaTransitions` desktop behavior from static visible overflow to intentional horizontal scroll/drag.
6. Run browser screenshots and interaction checks across desktop/tablet/mobile.

## Non-Goals

- Do not hardcode final biography, exhibition history, contact data, or social URLs.
- Do not invent artwork titles, dimensions, dates, awards, or credentials.
- Do not redesign the site into a generic agency/portfolio template.
- Do not remove the CMS-first architecture.
- Do not add heavy dependencies until the current GSAP/WebGL stack is proven insufficient.

