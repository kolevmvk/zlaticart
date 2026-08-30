# Claude Code Prompt — ZlaticArt Premium Animation and Gallery UX

You are Claude Code working inside the `zlaticart` repository.

Your task is to upgrade the live ZlaticArt experience so it feels like a premium, art-led, animated website suitable for global web-design competition review. Focus on the animation and gallery interaction problems documented below. Do not hardcode artist content that is meant to be entered through the admin/CMS.

## Required Reading

Read these files before editing code:

1. `CLAUDE.md`
2. `docs/PRODUCT_SPEC.md`
3. `docs/HERO_SPEC.md`
4. `docs/IMPLEMENTATION_PLAN.md`
5. `docs/CONTENT_MODEL.md`
6. `docs/ZLATICART_ANIMATION_GALLERY_AUDIT.md`
7. `docs/ZLATICART_FRONTEND_AUDIT.md`
8. `docs/ZLATICART_REMEDIATION_PLAN.md`
9. `.claude/skills/living-canvas/SKILL.md`
10. `.claude/agents/art-director.md`
11. `.claude/agents/motion-engineer.md`
12. `.claude/agents/qa-performance.md`

Treat `docs/ZLATICART_ANIMATION_GALLERY_AUDIT.md` as the primary brief for this task.

## Important Context

The site is CMS/admin driven. Zlatica or the site owner is expected to enter final artwork titles, biography, exhibition history, contact information, education text, and social links through the admin panel.

Do not treat CMS-empty states as the main implementation problem. Do not invent factual artist content, awards, dates, dimensions, exhibitions, schools, or biography details.

The code/design responsibility in this task is:

- make the oil paint / pigment scroll effect visible and convincing
- make the desktop gallery/media strip actually move left-right or otherwise behave as a real interactive gallery
- improve the hero-to-gallery transition
- preserve accessibility, reduced-motion support, and mobile performance
- keep the visual language art-led, not template-like

## Primary Problems To Fix

### 1. Hero oil-paint scroll/pull effect is too subtle

Relevant files:

- `src/components/hero/HeroGL.tsx`
- `src/lib/gl/brushShader.ts`
- `src/components/hero/LivingCanvas.tsx`
- `.claude/skills/living-canvas/SKILL.md`

Current state:

- Homepage uses `HeroGL`, not `LivingCanvas`.
- `HeroGL` has a WebGL shader reveal and scroll-linked effect.
- The scroll effect is currently implemented as a `glass-sweep oil smear`.
- The desired result is not glass/refraction. It should read as wet oil pigment, color spill, brush drag, pressure, bristle breakup, and canvas texture.
- The current effect can be missed because it is subtle, the hero is not pinned, and the strongest phase happens while the hero is leaving the viewport.

Goal:

Make the scroll/pull effect unmistakably visible as oil pigment being dragged or spilled across canvas, while keeping the artwork dominant and color-accurate.

Implementation guidance:

- Prefer improving the existing `HeroGL` and shader path first.
- Reuse ideas from `LivingCanvas.tsx` only where useful; do not blindly swap components.
- Replace "glass" semantics with pigment semantics where appropriate.
- Consider uniforms such as `uPigmentPull`, `uSpillStrength`, `uWetEdge`, `uBristleBreakup`, and `uPressure`.
- Consider short, controlled hero pinning if it makes the effect readable, but do not create a long intro gate or scroll trap.
- Tune desktop, tablet, and mobile separately.
- Keep `prefers-reduced-motion` fallback deliberate.

Acceptance criteria:

- A non-technical viewer can describe the effect as oil paint or pigment movement.
- The effect is visible at normal scroll speed.
- The hero remains usable and skippable.
- No long scroll lock.
- No animation jank on mobile.
- Reduced-motion users get a clean static/fallback experience.

### 2. Desktop gallery/media strip is not functional as left-right interaction

Relevant file:

- `src/components/sections/MediaTransitions.tsx`

Current state:

- Mobile uses horizontal scroll with snap.
- Desktop uses `md:overflow-visible`, so the strip is not a true horizontal gallery.
- The only desktop motion is a subtle entrance and vertical image parallax.

Goal:

Make the desktop "Kroz medije" / media strip a clear interactive left-right gallery experience.

Implementation guidance:

- Use GSAP ScrollTrigger for a pinned horizontal-scroll section on desktop.
- Map vertical scroll to horizontal card movement.
- Support pointer/drag or wheel behavior where practical.
- Add a restrained progress rail, index, or visual affordance so users understand the section is interactive.
- Keep native horizontal scroll on mobile.
- Avoid body-level horizontal overflow.
- Ensure keyboard users can reach every work.
- Touch users must not depend on hover-only labels.

Acceptance criteria:

- On desktop, images visibly move left/right.
- The interaction has clear start and end states.
- The section does not strand cards offscreen.
- Mobile horizontal scroll still works naturally.
- There is no accidental page horizontal overflow.

### 3. Hero-to-Selected Works handoff is not strong enough

Relevant files:

- `src/components/works/SelectedWorks.tsx`
- `src/components/works/ArtworkCard.tsx`
- `src/components/hero/HeroGL.tsx`

Goal:

The first works section should feel like a continuation of the hero canvas/artwork system, not a separate ordinary grid.

Implementation guidance:

- Animate the first Selected Works card as if it settles out of the hero artwork/canvas.
- Stagger secondary cards with varied motion.
- Make metadata appear like gallery labels.
- Keep hover/touch states premium and restrained.

Acceptance criteria:

- The transition from hero to works feels intentional.
- Cards do not all animate identically.
- The artwork remains the visual priority.

### 4. Responsive size and interaction polish

Relevant files:

- `src/components/nav/Navigation.tsx`
- `src/components/ui/LanguageToggle.tsx`
- `src/app/globals.css`
- `src/components/sections/MediaTransitions.tsx`
- `src/components/works/SelectedWorks.tsx`

Goal:

Improve usability across desktop, tablet, and mobile without making the UI visually bulky.

Implementation guidance:

- Increase actual clickable/tappable target boxes for nav and language controls.
- Aim for practical `44px` touch targets where applicable.
- Use padding/min-height rather than simply increasing visual text size.
- Verify no text overlaps or clips.
- Verify tablet composition separately, not just as scaled desktop.
- Add safe-area handling where needed.

Acceptance criteria:

- Header remains refined but easier to use.
- Controls are usable on touch devices.
- No layout overlap at common breakpoints.

## Existing Claude Agents To Use

Use focused agents if the workflow supports them. Avoid overlapping edits.

### `motion-engineer`

Owns:

- `HeroGL`
- `brushShader`
- GSAP/ScrollTrigger
- horizontal gallery implementation
- reduced-motion and animation cleanup

### `art-director`

Owns:

- visual quality review
- whether the effect reads as real oil pigment
- composition
- typography scale
- gallery rhythm
- avoiding generic portfolio/template design

### `qa-performance`

Owns:

- responsive QA
- mobile Safari behavior
- Lighthouse/performance checks
- keyboard/focus checks
- reduced-motion verification
- horizontal overflow detection

## Suggested Work Order

1. Read all required docs.
2. Inspect current implementation files.
3. Define the minimal implementation plan in `docs/STATUS.md` or a short working note.
4. Implement the hero oil pigment scroll/pull effect.
5. Implement desktop horizontal gallery behavior in `MediaTransitions`.
6. Improve hero-to-Selected Works handoff if it can be done without destabilizing the site.
7. Improve tap targets and responsive polish.
8. Run checks:
   - `npm run typecheck`
   - `npm run build`
   - responsive browser checks at 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 widths
   - reduced-motion check
   - keyboard tab-through check for nav and gallery sections
9. Update `docs/STATUS.md` with what changed, what passed, and what remains.

## Constraints

- Do not hardcode CMS content.
- Do not invent artist facts.
- Do not remove CMS/admin architecture.
- Do not redesign into a generic portfolio, agency, SaaS, or ecommerce layout.
- Do not add heavy dependencies unless the current GSAP/WebGL stack is clearly insufficient.
- Do not break reduced-motion support.
- Do not create long scroll locks or intro gates.
- Do not allow animation to compete with the artwork.
- Preserve production build health.

## Expected Final Output

When finished, report:

- files changed
- summary of animation changes
- summary of gallery interaction changes
- responsive/accessibility checks performed
- build/typecheck results
- remaining risks or follow-up items

