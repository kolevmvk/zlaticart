---
name: living-canvas
description: Use when designing, implementing, debugging, or reviewing the ZlaticArt homepage hero and its transition into Selected Works.
---

# Living Canvas Skill

## Goal
Create a tactile, believable art-first hero where a realistic brush/pigment stroke reveals a real Zlatica artwork on canvas.

## Required context
Read `docs/HERO_SPEC.md` before changing hero code.

## Decision order
1. Artwork quality and composition
2. Brush/material realism
3. Mobile experience
4. Interaction continuity into Selected Works
5. Performance
6. Implementation cleverness

## Implementation guidance
- Prefer a textured reveal mask over drawing a flat colored stroke.
- Brush alpha should include bristle gaps, imperfect edges, pressure/width variation, and non-linear movement.
- Keep the initial automatic portion short; hand control to scroll/touch immediately.
- Build explicit fallbacks for reduced motion and weaker devices.
- Keep hero asset and focal points replaceable through config/content.

## Review checklist
- Does it look like brush/pigment rather than a wipe transition?
- Is the artwork itself more memorable than the effect?
- Is portrait mobile composition independently designed?
- Can a user skip/accelerate naturally?
- Is there any scroll lock, jank, layout shift, or runaway animation loop?
- Does the handoff into Selected Works feel like the same composition continuing?

## Reject
Particles, blobs, liquid-metal decoration, fake museums, autoplay sound, long intro gates, generic gradients, or effects unrelated to painting.
