export const VERT = /* glsl */`
attribute vec2 aPos;
attribute vec2 aUv;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const FRAG = /* glsl */`
precision highp float;

uniform sampler2D uArtwork;
/* ─── two independent effects — do not conflate ──────────────────────────
   1) uInitialRevealProgress: the one-shot brush reveal that plays on hero
      load (0→1 once, tweened in JS, boostable by scroll/touch, skipped
      entirely under reduced motion). Drives the 7-stroke reveal loop below
      that uncovers the artwork from bare linen.
   2) uPigmentPullStrength: the scroll-driven glass-drag deformation — see
      the "glass-drag oil smear" block below. This is a continuous
      per-pixel *displacement* of the artwork's own texture (a coherent,
      time-independent flow field whose magnitude scales with this
      uniform), not a blend/crossfade between an original and a distorted
      copy — at 0 the flow field's displacement is 0, so the undistorted
      painting falls out of the same formula rather than needing a
      separate mix. uPigmentPullStrength is a JS-computed envelope: it
      ramps in, holds, then fades back to 0 as the hero hands off to
      Selected Works, so the deformation never lingers or bleeds into the
      next section (see pigmentPullEnvelope() in HeroGL.tsx). This effect
      only ever modifies artFinal, which is blended in via the *initial*
      reveal's rev mask — so it can only deform paint that reveal #1 has
      already uncovered, never bare linen. */
uniform float uInitialRevealProgress;
uniform float uTime;
uniform float uAspect;
uniform float uArtworkAspect;
uniform float uPigmentPullStrength;
/* Cursor position (-1..1, lerped/smoothed in JS), used only to relight the
   impasto surface — paint catches/loses light as the viewer's "light
   source" moves, the way real oil paint does under gallery light. Stays at
   (0,0) on touch/reduced-motion (that JS effect never runs there), leaving
   just the constant idle drift below. */
uniform float uPointerTiltX;
uniform float uPointerTiltY;

varying vec2 vUv;

/* ─── noise primitives ─────────────────────────────────────────────────── */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float hash1(float n) { return fract(sin(n) * 43758.5453); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int k = 0; k < 6; k++) {
    v += a * vnoise(p);
    p = rot * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

/* ─── cover-crop UV ────────────────────────────────────────────────────── */
vec2 coverCrop(vec2 uv, float va, float aa) {
  if (va > aa) {
    float s = aa / va;
    return vec2(uv.x, uv.y * s + (1.0 - s) * 0.5);
  } else {
    float s = va / aa;
    return vec2(uv.x * s + (1.0 - s) * 0.5, uv.y);
  }
}

/* ─── linen canvas weave (before paint) ───────────────────────────────── */
float canvasWeave(vec2 uv) {
  float freqH = 160.0, freqV = 158.0;
  float nH = vnoise(uv * vec2(1.0, 8.0) + vec2(0.0, 3.3)) * 0.5;
  float nV = vnoise(uv * vec2(8.0, 1.0) + vec2(7.1, 0.0)) * 0.5;
  float wH = sin((uv.x + nH * 0.04) * freqH * 6.2832) * 0.5 + 0.5;
  float wV = sin((uv.y + nV * 0.04) * freqV * 6.2832) * 0.5 + 0.5;
  float check = step(0.5, fract(uv.x * freqH * 0.5));
  return mix(wH, wV, check) * 0.018 + 0.004;
}

/* ─── impasto surface normal (faked from FBM) ─────────────────────────── */
/* Returns a pseudo-height representing paint thickness variation. Three
   octaves at distinct scales so the relief reads as real paint texture at
   any viewing distance: macro ridges where the brush loaded/unloaded
   pigment, mid-scale strokes, and fine tooth-of-the-canvas grain. */
float paintRelief(vec2 uv, float rev) {
  float macro = fbm(uv * 4.5 + vec2(3.1, 7.7));
  float mid   = fbm(uv * 12.0 + vec2(5.4, 2.9)) * 0.5;
  float fine  = fbm(uv * 28.0 + vec2(8.3, 1.2)) * 0.3;
  return (macro + mid + fine) * rev * rev;
}

/* ─── smooth step curve ────────────────────────────────────────────────── */
float scurve5(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

/* ─── brush stroke mask ────────────────────────────────────────────────── */
/* Each stroke is a bristle-fan sweep: wide gaussian band in Y,
   noisy advancing front in X (or reversed for alternating direction). */
float strokeYc(float idx) {
  return (idx + 0.5) / 7.0 + (hash(vec2(idx * 3.71, 1.31)) - 0.5) * 0.045;
}

float bristleMask(vec2 uv, float idx) {
  float yc = strokeYc(idx);
  /* Band width varies per stroke — oil brush loads more paint on center strokes */
  float yw = 0.13 + hash(vec2(idx * 5.13, 2.77)) * 0.06;
  float yEnv = exp(-pow((uv.y - yc) / yw, 2.0));

  /* Individual bristles: multiple thin sinusoids offset by fibrous noise */
  float bristle = 0.0;
  for (int b = 0; b < 4; b++) {
    float bf = float(b);
    float offset = (hash1(idx * 13.7 + bf * 5.3) - 0.5) * yw * 1.8;
    float bw = 0.018 + hash1(idx * 9.1 + bf * 3.7) * 0.012;
    bristle = max(bristle, exp(-pow((uv.y - yc - offset) / bw, 2.0)));
  }
  yEnv = mix(yEnv, bristle, 0.45);

  return yEnv;
}

float strokeReveal(vec2 uv, float idx, float sp) {
  float yEnv = bristleMask(uv, idx);

  /* Noisy sweep front: FBM gives organic drags; vnoise gives bristle shred */
  float n_slow = (fbm(vec2(uv.y * 6.3 + idx * 5.3, uv.x * 0.4 + uTime * 0.008)) * 2.0 - 1.0) * 0.13;
  float n_shred = (vnoise(uv * vec2(45.0, 3.0) + vec2(idx * 17.3)) * 2.0 - 1.0) * 0.025;
  float n = n_slow + n_shred;

  float ew = 0.014 + hash(vec2(idx * 7.3, 4.1)) * 0.009;

  float t;
  if (mod(idx, 2.0) < 1.0) {
    t = clamp((sp + n - uv.x) / ew, 0.0, 1.0);
  } else {
    t = clamp((uv.x - (1.0 - sp) + n) / ew, 0.0, 1.0);
  }

  return clamp(scurve5(t) * yEnv, 0.0, 1.0);
}

/* ─── main ─────────────────────────────────────────────────────────────── */
void main() {
  /* ── artwork UV with cover crop and living micro-warp ── */
  vec2 baseUv = vec2(vUv.x, 1.0 - vUv.y);
  float breathe = step(0.999, uInitialRevealProgress);
  /* Subtle organic breathing — paint shifts infinitesimally on canvas */
  float warpX = (fbm(vUv * 3.1 + vec2(uTime * 0.11, 1.7)) - 0.5) * 0.0028 * breathe;
  float warpY = (fbm(vUv * 3.1 + vec2(2.3, uTime * 0.09)) - 0.5) * 0.0024 * breathe;
  baseUv += vec2(warpX, warpY);

  vec2 artUv = coverCrop(baseUv, uAspect, uArtworkAspect);
  vec4 art   = texture2D(uArtwork, artUv);

  /* ─── glass-drag oil-paint deformation (scroll-driven) ──────────────────
     An invisible, perfectly flat pane of glass is pressed against the
     still-wet oil painting. As the user scrolls, the pane is pulled
     straight down and — because the paint hasn't dried — drags the whole
     contact surface with it at once, not as a traveling window/band.
     This is NOT a blend/crossfade between an untouched original and a
     distorted copy: the artwork is continuously displaced by a coherent
     flow field whose magnitude is driven by uPigmentPullStrength, so at 0
     the displacement is 0 and the intact painting falls out of the same
     formula rather than needing a separate mix. The flow field itself
     never depends on uTime — only its magnitude does — so it never
     shimmers or boils frame to frame, only deepens with scroll.
     uPigmentPullStrength ramps in and then HOLDS at full strength for the
     rest of the pin (see pigmentPullEnvelope() in HeroGL.tsx) — it does not
     fade back to 0. Wet paint that's been dragged doesn't un-drag itself
     just because the viewer keeps scrolling the same direction; the
     deformation is meant to still be visible as the hero hands off to
     Selected Works, carried away in its dragged state rather than healing
     back to the intact painting first. Colour-faithful by construction:
     every tap samples the artwork's own texture, never a tinted or
     channel-shifted copy.

     2026-08-30: deliberately pushed to near-total abstraction at peak
     strength — a project-level exception to "the artwork must stay more
     memorable than the effect" (docs/HERO_SPEC.md / living-canvas skill),
     approved for this specific scroll effect only. Do not scale this back
     down to a subtle smear without re-confirming with the project owner;
     the intact-painting-at-rest state (uPigmentPullStrength == 0, i.e.
     before any scroll) is what satisfies that rule, not the peak of this
     effect. */
  vec3 artFinal = art.rgb;
  if (uPigmentPullStrength > 0.001) {
    /* Nonlinear response — destruction accelerates rather than growing
       linearly, the way a stiff pane overcoming paint's resistance tears
       through a composition faster once it starts moving. */
    float tt = pow(uPigmentPullStrength, 1.2);

    /* Low-frequency resistance: some passages of paint drag less than
       others — thicker/tackier areas resist the glass more. A static
       per-pixel field (position only, no uTime), so it reads as a fixed
       material property rather than an animated texture. */
    float resistance = 0.5 + fbm(baseUv * 2.1 + vec2(9.3, 1.7)) * 1.0;

    /* Medium-frequency shear — why neighbouring pigments drag into each
       other and forms elongate diagonally instead of all sliding straight
       down in lockstep. Decorrelated from resistance. */
    float shear = (fbm(baseUv * 4.6 + vec2(31.7, 4.4)) - 0.5) * 2.0;

    /* Two-pass domain warping: the flow field's own sampling coordinates
       are bent by a first fbm pass before the second is read, so drag
       paths curve organically instead of radiating from one uniform
       direction — "some pigment travels farther than surrounding
       pigment," not a mechanically uniform stretch. */
    vec2 warpedUv = baseUv + vec2(shear, 0.0) * 0.08 * tt;
    vec2 warp2 = vec2(
      fbm(warpedUv * 1.6 + vec2(4.1, 8.8)),
      fbm(warpedUv * 1.6 + vec2(11.3, 2.2))
    ) - 0.5;
    vec2 doubleWarpedUv = warpedUv + warp2 * 0.35 * tt;
    float flow = fbm(doubleWarpedUv * 2.6 + vec2(0.0, 5.5));

    /* Fine breakup — a subtle high-frequency nudge so streaks aren't
       perfectly smooth, matching paint tearing at small scale. */
    float breakupX = fbm(baseUv * 20.0 + vec2(3.3, 17.1)) - 0.5;
    float breakupY = fbm(baseUv * 20.0 + vec2(17.1, 3.3)) - 0.5;

    /* Displacement magnitude: the tt*tt term makes the final stretch of
       scroll progress tear through the composition much faster than the
       start, so the destruction reads as accelerating collapse rather
       than a linear stretch. Deliberately capped so peak-strength vertical
       pull stays under ~1 UV (one frame height) even in the
       least-resisting passages — beyond that, CLAMP_TO_EDGE sampling makes
       most drag taps land on the same clamped edge pixel, and the result
       washes into flat grey fog instead of a genuinely dragged streak of
       the artwork's own colour. Staying under that ceiling keeps every tap
       sampling meaningfully different source content. */
    vec2 displacement;
    displacement.y = tt * resistance * (0.28 + flow * 0.32) + tt * tt * 0.12;
    displacement.x = tt * shear * 0.22 * resistance;
    displacement += tt * vec2(breakupX, breakupY) * 0.07;

    /* Multi-tap trailing streak from the pigment's original position to
       its fully displaced position — reads as coherent stretching/dragging
       rather than a single warped sample (which would alias) or a fixed
       global offset (which would read as simple UV scrolling). Fixed tap
       count, no dynamic loop bounds. Tap weighting flattens toward uniform
       as tt rises: at low strength it stays biased to the near-original
       end (barely visible anyway), but at peak strength every point along
       the drag path contributes almost equally, so the result is genuinely
       built from dragged pigment across the whole path rather than a
       lightly-streaked original. Tap count raised (14 → 20) so the much
       longer drag path at peak strength stays a smooth streak, not banding.

       Path meander: without this, every tap along a given column samples
       straight up that same column — the drag only ever stretches a
       pixel's own local gradient, so distinct passages of colour never
       actually touch. Real wet paint dragged under glass doesn't move in
       parallel lanes: neighbouring streaks wander into each other. So each
       tap gets a small lateral+vertical jitter, seeded by the tap index
       and a mid-frequency noise field, that grows with both how far along
       the path (fk) and how strong the pull is (tt) — deep into a strong
       drag, the sampled point has wandered sideways enough to cross into a
       neighbouring colour's original territory, which is what produces
       genuine pigment-mixing at boundaries rather than parallel streaking. */
    vec3 dragged = vec3(0.0);
    float wsum = 0.0;
    const int DRAG_TAPS = 20;
    for (int k = 0; k < DRAG_TAPS; k++) {
      float fk = float(k) / float(DRAG_TAPS - 1);
      float w  = mix(1.0 - fk * 0.85, 1.0 - fk * 0.35, tt);
      vec2 meanderFine = vec2(
        vnoise(baseUv * 22.0 + vec2(fk * 17.3, 4.1)) - 0.5,
        vnoise(baseUv * 22.0 + vec2(9.7, fk * 13.9)) - 0.5
      );
      /* Coarse component — swings wide enough to cross into a clearly
         different painted passage (not just texture-scale wobble), which is
         what actually produces visible colour-mixing between neighbouring
         pigments rather than a same-region blur. */
      vec2 meanderCoarse = vec2(
        fbm(baseUv * 3.5 + vec2(fk * 6.1, 2.2)) - 0.5,
        fbm(baseUv * 3.5 + vec2(1.4, fk * 5.7)) - 0.5
      );
      vec2 meanderRaw = (meanderFine * 0.12 + meanderCoarse * 0.4) * tt * fk;
      /* Biased strongly vertical: mixing must read as pigment travelling up
         the same column and blending with what's above it, not drifting
         sideways into unrelated passages. The x component is heavily
         damped relative to y so any given tap still lands close to its
         own column — enough lateral give for boundaries to feel organic,
         not a diagonal/omnidirectional wander. */
      vec2 meander = vec2(meanderRaw.x * 0.28, meanderRaw.y);
      /* + not -: pigment from BELOW the current point is pulled UP into it
         (glass slides down, but the paint stuck to it travels up through
         the fixed viewing frame — lower colour rises and mixes into what
         sits above it, per the confirmed direction). */
      vec2 tapUv = coverCrop(baseUv + displacement * fk + meander, uAspect, uArtworkAspect);
      dragged += texture2D(uArtwork, clamp(tapUv, 0.001, 0.999)).rgb * w;
      wsum += w;
    }
    artFinal = dragged / wsum;

    /* Averaging many taps of genuinely different pigment (the point of the
       meander above) naturally desaturates toward grey/brown — physically
       correct for mixed paint, but on screen it reads as the whole surface
       fogging over rather than distinct colours visibly dragging into each
       other. Restore saturation as strength rises so the streaks stay
       legibly the artwork's own colours meeting and mixing, not a wash. */
    float lum = dot(artFinal, vec3(0.299, 0.587, 0.114));
    artFinal = clamp(mix(vec3(lum), artFinal, 1.0 + tt * 0.6), 0.0, 1.0);
  }

  /* ── raw linen ground ── */
  float grain  = fbm(vUv * 88.0 + uTime * 0.14) * 0.014;
  float weave  = canvasWeave(vUv);
  /* Warm primed linen: cream-white with fine variation */
  vec3 linen = vec3(
    0.944 + grain * 1.1 - weave * 0.9,
    0.932 + grain * 0.9 - weave * 0.75,
    0.908 + grain * 0.7 - weave * 0.55
  );

  /* ── aggregate stroke reveals ── */
  float rev   = 0.0;
  float leadE = 0.0;
  float edgeAcc = 0.0;

  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float sp  = clamp(uInitialRevealProgress * 7.0 - fi, 0.0, 1.0);
    float s   = strokeReveal(vUv, fi, sp);

    rev = max(rev, s);

    /* Leading-edge glow: peaks at the active front of each in-progress stroke */
    float atFront = exp(-pow((1.0 - sp) * 5.0, 2.0)) * step(0.001, sp) * (1.0 - step(0.999, sp));
    float edgeAmt = exp(-pow((s - 0.08) * 18.0, 2.0)) * atFront;
    leadE = max(leadE, edgeAmt);

    /* Impasto ridge: paint piles up at the transition boundary */
    float ridge = exp(-pow((s - 0.5) * 9.0, 2.0)) * step(0.01, sp);
    edgeAcc = max(edgeAcc, ridge);
  }
  rev     = clamp(rev, 0.0, 1.0);
  leadE   = clamp(leadE, 0.0, 1.0);
  edgeAcc = clamp(edgeAcc, 0.0, 1.0);

  /* ── impasto relief shading — the paint's own texture, lit like a real
     3D surface so it reads as raised, tactile oil rather than a flat
     photo. Light direction has two parts: a cursor-driven tilt (desktop
     pointer only — 0 on touch/reduced-motion) so the paint visibly catches
     and loses light as the viewer moves, plus a constant slow idle drift
     so it never looks perfectly static even without input — the "as if
     alive" quality, at a scale subtle enough to stay a material property,
     not a distracting animation. ── */
  float relief = paintRelief(vUv, rev);
  vec2 eps = vec2(0.0035, 0.0035);
  float dX = paintRelief(vUv + vec2(eps.x, 0.0), rev) - paintRelief(vUv - vec2(eps.x, 0.0), rev);
  float dY = paintRelief(vUv + vec2(0.0, eps.y), rev) - paintRelief(vUv - vec2(0.0, eps.y), rev);
  /* Lower z (was 0.08) = steeper apparent normal = more pronounced bump */
  vec3 normal = normalize(vec3(-dX, -dY, 0.06));
  vec2 idleDrift = vec2(sin(uTime * 0.17), cos(uTime * 0.13)) * 0.05 * breathe;
  vec2 lightTilt = clamp(vec2(uPointerTiltX, uPointerTiltY), -1.0, 1.0) * 0.3 + idleDrift;
  vec3 lightDir = normalize(vec3(-0.6 + lightTilt.x, -0.55 + lightTilt.y, 1.0));
  float diffuse = max(dot(normal, lightDir), 0.0);
  float specPaint = pow(max(dot(reflect(-lightDir, normal), vec3(0,0,1)), 0.0), 16.0);
  /* Broader, softer sheen — ambient studio light glancing off the whole
     glossy surface, not just the tight highlight above */
  float softSheen = pow(max(dot(reflect(-lightDir, normal), vec3(0,0,1)), 0.0), 3.5);

  /* ── base colour mix: linen → oil painting ── */
  vec3 col = mix(linen, artFinal, rev);

  /* Impasto thickness: brightens peaks, darkens valleys — this is the main
     "raised paint" cue, so it's pushed noticeably harder than a flat photo
     would ever need */
  col += vec3(0.075, 0.065, 0.04) * (diffuse - 0.5) * rev * 0.85;

  /* Specular sheen — oil paint is semi-glossy */
  col += vec3(1.0, 0.98, 0.92) * specPaint * rev * 0.16;
  col += vec3(0.92, 0.93, 0.86) * softSheen * rev * 0.05;

  /* Canvas weave shows through thin paint areas */
  float paintThick = rev * (0.8 + relief * 0.2);
  col -= weave * (1.0 - paintThick) * 0.55;

  /* Impasto ridge at stroke boundary — dark resin accumulation */
  col -= vec3(0.07, 0.04, 0.01) * edgeAcc * (1.0 - rev * 0.6);

  /* ── wet paint leading edge ── */
  /* Amber glow: fresh oil paint has warm luminosity */
  col += vec3(0.12, 0.06, -0.02) * leadE * 0.28;
  /* Gloss highlight: wet paint catches studio light */
  float wetGloss = pow(leadE, 1.8) * 0.32;
  col += vec3(1.0, 0.97, 0.88) * wetGloss;

  /* ── wet-drag sheen — freshly disturbed paint is glossier than settled
     paint, so a bit more light catches the whole surface as the glass-drag
     strengthens. Colorless-ish (near-white, very low intensity) so it
     reads as a lighting change, not a tint on the artwork's own colors. ── */
  col += vec3(1.0, 0.99, 0.97) * uPigmentPullStrength * 0.05 * rev;

  /* ── vignette — activates after reveal ─── */
  float vd = length((vUv - 0.5) * vec2(1.1, 1.25));
  float vign = 1.0 - smoothstep(0.28, 0.82, vd) * 0.22 * breathe;
  col *= vign;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
