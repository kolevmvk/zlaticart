# Hero Specification — Living Canvas

## Purpose
The hero is the signature experience of ZlaticArt. It must feel like an artwork being physically revealed, not like a marketing header.

## Core sequence
### State 0 — Canvas
Viewport opens on a warm off-white canvas/paper surface with subtle real texture.
No menu-first layout. No headline block. No audio.

### State 1 — Brush enters
A realistic painter's brush enters the composition and lays down pigment.
The brush must not look like a cartoon icon, SVG cursor, or stock animation.

### State 2 — Artwork reveal
The pigment stroke acts as a mask that reveals a real Zlatica artwork underneath.
The effect should suggest bristles, imperfect pigment edges, and physical contact with the canvas.

The brush performs a small number of intentional strokes. Do not make it draw endlessly.

Target initial reveal duration: roughly 2.5–3.5 seconds under normal conditions.
User scroll/touch must be able to accelerate or complete the reveal; never trap the user in an intro.

### State 3 — Identity reveal
When enough of the artwork is visible, reveal typography:

`ZLATICA`

Subline:
`Painter · Educator · Artist`

Optional small action:
`Explore ↓`

Typography enters through masked movement or subtle compositional reveal, not generic fade-only animation.

### State 4 — Scroll handoff
On first meaningful scroll, the artwork transitions from immersive surface to curated object.
Preferred interpretation: the composition subtly pulls back to create negative space around the artwork and introduces quiet metadata / Selected Works context.

Do not build a fake walkable museum or 3D room as the default solution.

## Brush realism
The hero is P0. Choose implementation based on visual quality and performance, not library loyalty.

Possible implementation hierarchy:
1. Canvas/WebGL brush mask with textured alpha and velocity-sensitive stroke width.
2. HTML Canvas compositing with prebuilt brush alpha textures.
3. SVG/CSS mask fallback for reduced devices.

Requirements:
- non-uniform brush edge
- natural entry/exit path
- no mathematically perfect straight stripe
- artwork is revealed through the stroke, not painted over by a flat color block
- motion easing should feel physical, not UI-like

If full brush realism requires a local asset that does not yet exist, create a temporary procedural brush mask and document the asset needed in `docs/STATUS.md`.

## Artwork selection
Use the strongest suitable existing seed image only provisionally.
Do not assume filenames indicate quality.
Hero implementation must make replacing the hero image trivial via CMS/config.

Support independent desktop and mobile focal points/crops.

## Mobile composition
Mobile is not a scaled desktop hero.

Portrait behavior:
- full-height canvas
- artwork crop chosen for portrait impact
- brush path adapted to portrait aspect ratio
- title never covers the most important visual focal point
- touch/scroll immediately transfers control
- no hover-only information

Test at minimum representative widths around 320, 375/390, 430 px.

## Desktop composition
- artwork can begin in macro/detail crop
- wider brush motion is acceptable
- cursor should remain restrained; do not turn cursor into a gimmick
- hero should transition naturally into Selected Works

## Reduced motion
If `prefers-reduced-motion: reduce`:
- skip brush travel animation
- show a static or very short opacity/mask reveal
- preserve exact visual hierarchy
- navigation/content must be immediately available

## Loading states
Do not show an empty white/black page while waiting for a giant texture.
Provide a deliberate lightweight canvas placeholder.
Preload only the minimum hero assets required.

## Forbidden hero patterns
- autoplay audio
- video intro the user must wait through
- particle fields
- floating blobs
- generic gradient mesh
- fake liquid-metal effects
- glass cards
- huge logo spinning in 3D
- scroll hijacking with long lockout
- loading percentage theatre unless technically necessary
- stock painter footage

## Quality bar
The hero is not done when the animation technically runs.
It is done when:
- brush feels materially plausible
- reveal edges look painterly
- typography composition feels gallery-grade
- mobile still feels premium
- transition into the rest of the site feels continuous
- the artwork, not the effect, remains memorable
