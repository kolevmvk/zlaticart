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
   2) uPigmentPullStrength: the scroll-driven glass-drag smear that drags
      already-revealed paint straight down, uniformly across the canvas,
      once the user scrolls past the hero — see the "glass-drag oil smear"
      block below. Computed in JS from raw scroll progress via
      pigmentPullEnvelope() (monotonic — grows with scroll, never fades
      back down; see that function's comment in HeroGL.tsx for why). This
      effect only ever modifies artFinal, which is blended in via the
      *initial* reveal's rev mask — so it can only smear paint that reveal
      #1 has already uncovered, never bare linen. */
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

  /* ─── glass-drag oil smear (scroll-driven) ──────────────────────────────
     Picture a perfectly transparent pane resting directly on the still-wet
     painting. As the user scrolls, that invisible pane is pulled straight
     down, and because the paint underneath hasn't dried, it streaks
     downward with it — uniformly across the whole canvas (the pane covers
     all of it at once), not as a traveling window or band. Its strength
     (uPigmentPullStrength) grows monotonically with scroll — see the
     pigmentPullEnvelope() comment in HeroGL.tsx — so it never partially
     "undoes" itself mid-scroll the way a passing band would.
     Color-faithful by construction: every tap below samples the artwork's
     own texture along the drag direction with no channel offset and no
     added tint, so the smear is strictly the image's own fresh pigment
     being dragged, never a colored filter over it. */
  vec3 artFinal = art.rgb;
  float smearStrength = uPigmentPullStrength;
  if (smearStrength > 0.001) {
    /* Mostly straight down, with a slow, wide per-column wobble so the
       drag reads as viscous fluid streaking rather than a mechanically
       uniform blur — some columns lag or lead very slightly. */
    float wobble = (fbm(vec2(vUv.x * 4.0, uTime * 0.05 + 11.0)) - 0.5) * 0.12;
    vec2 dragDir = normalize(vec2(wobble, 1.0));
    float dragAmt = 0.1 * smearStrength;

    /* Multi-tap trailing streak: each tap samples further "upstream"
       (against the drag direction) with falling weight, so the result
       reads as pigment trailing down from where it used to be rather than
       a symmetric blur. Fixed tap count, no dynamic loop bounds. */
    vec3 smeared = vec3(0.0);
    float wsum = 0.0;
    const int SMEAR_TAPS = 6;
    for (int t = 0; t < SMEAR_TAPS; t++) {
      float ft = float(t) / float(SMEAR_TAPS - 1);
      float w  = 1.0 - ft * 0.72;
      vec2 tapUv = coverCrop(baseUv - dragDir * dragAmt * ft, uAspect, uArtworkAspect);
      smeared += texture2D(uArtwork, clamp(tapUv, 0.001, 0.999)).rgb * w;
      wsum += w;
    }
    smeared /= wsum;

    artFinal = mix(art.rgb, smeared, smearStrength);
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
