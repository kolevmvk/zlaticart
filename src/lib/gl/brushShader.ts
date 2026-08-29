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
uniform float uProgress;
uniform float uTime;
uniform float uAspect;
uniform float uArtworkAspect;

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
/* Returns a pseudo-height representing paint thickness variation */
float paintRelief(vec2 uv, float rev) {
  float coarse = fbm(uv * 4.5 + vec2(3.1, 7.7));
  float fine   = fbm(uv * 22.0 + vec2(8.3, 1.2)) * 0.35;
  return (coarse + fine) * rev * rev;
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
  float breathe = step(0.999, uProgress);
  /* Subtle organic breathing — paint shifts infinitesimally on canvas */
  float warpX = (fbm(vUv * 3.1 + vec2(uTime * 0.11, 1.7)) - 0.5) * 0.0022 * breathe;
  float warpY = (fbm(vUv * 3.1 + vec2(2.3, uTime * 0.09)) - 0.5) * 0.0018 * breathe;
  baseUv += vec2(warpX, warpY);

  vec2 artUv = coverCrop(baseUv, uAspect, uArtworkAspect);
  vec4 art   = texture2D(uArtwork, artUv);

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
    float sp  = clamp(uProgress * 7.0 - fi, 0.0, 1.0);
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

  /* ── impasto relief shading ── */
  /* Fake directional light from top-left reveals paint texture thickness */
  float relief = paintRelief(vUv, rev);
  /* Light direction: top-left = (-1, -1) normalized */
  vec2 eps = vec2(0.004, 0.004);
  float dX = paintRelief(vUv + vec2(eps.x, 0.0), rev) - paintRelief(vUv - vec2(eps.x, 0.0), rev);
  float dY = paintRelief(vUv + vec2(0.0, eps.y), rev) - paintRelief(vUv - vec2(0.0, eps.y), rev);
  vec3 normal = normalize(vec3(-dX, -dY, 0.08));
  vec3 lightDir = normalize(vec3(-0.6, -0.55, 1.0));
  float diffuse = max(dot(normal, lightDir), 0.0);
  float specPaint = pow(max(dot(reflect(-lightDir, normal), vec3(0,0,1)), 0.0), 18.0);

  /* ── base colour mix: linen → oil painting ── */
  vec3 col = mix(linen, art.rgb, rev);

  /* Impasto thickness: slightly brightens peaks, darkens valleys */
  col += vec3(0.06, 0.05, 0.03) * (diffuse - 0.5) * rev * 0.55;

  /* Specular sheen — oil paint is semi-glossy */
  col += vec3(1.0, 0.98, 0.92) * specPaint * rev * 0.12;

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

  /* ── vignette — activates after reveal ─── */
  float vd = length((vUv - 0.5) * vec2(1.1, 1.25));
  float vign = 1.0 - smoothstep(0.28, 0.82, vd) * 0.22 * breathe;
  col *= vign;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
