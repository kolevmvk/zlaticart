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
precision mediump float;

uniform sampler2D uArtwork;
uniform float uProgress;
uniform float uTime;
uniform float uAspect;        /* viewport width / height */
uniform float uArtworkAspect; /* artwork width / height */

varying vec2 vUv;

/* ---- noise ---- */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),             hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 5; k++) { v += a * vnoise(p); p = p * 2.3 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
/* Sharper S-curve for crisper brush edge */
float scurve(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

/* Organic y-center: slightly irregular band positions */
float strokeYc(float idx) {
  float t = (idx + 0.5) / 7.0;
  return t + (hash(vec2(idx * 3.71, 1.31)) - 0.5) * 0.05;
}

/* Single brush stroke mask */
float strokeReveal(vec2 uv, float idx, float sp) {
  float yc  = strokeYc(idx);
  /* Per-stroke sigma: slight variation for organic banding */
  float yw  = 0.155 + hash(vec2(idx * 5.13, 2.77)) * 0.055;
  float yEnv = exp(-pow((uv.y - yc) / yw, 2.0));

  /* Bristle: coarse FBM edge + fine-grained fibers + wavy wobble */
  float slow  = (fbm(vec2(uv.y * 9.6 + idx * 5.3, uv.x * 0.38 + uTime * 0.007 * (1.0 - sp))) * 2.0 - 1.0) * 0.11;
  float fiber = (vnoise(uv * vec2(30.0, 5.0) + vec2(idx * 23.9)) * 2.0 - 1.0) * 0.022;
  float wave  = sin(uv.y * 14.0 + idx * 3.1) * 0.006; /* gentle wavy leading edge */
  float n     = slow + fiber + wave;

  /* Per-stroke edge softness */
  float ew = 0.016 + hash(vec2(idx * 7.3, 4.1)) * 0.010;
  float t;

  if (mod(idx, 2.0) < 1.0) {
    /* L → R */
    float sweepPos = sp + n;
    t = clamp((sweepPos - uv.x) / ew, 0.0, 1.0);
  } else {
    /* R → L */
    float sweepPos = 1.0 - sp + n;
    t = clamp((uv.x - sweepPos) / ew, 0.0, 1.0);
  }

  return clamp(scurve(t) * yEnv, 0.0, 1.0);
}

/* Cover-crop UV: maintain artwork aspect ratio, fill viewport (like object-fit: cover) */
vec2 coverCrop(vec2 uv, float viewAspect, float artAspect) {
  if (viewAspect > artAspect) {
    /* Viewport wider — fit width, crop height symmetrically */
    float scaleY = artAspect / viewAspect;
    return vec2(uv.x, uv.y * scaleY + (1.0 - scaleY) * 0.5);
  } else {
    /* Viewport taller (or equal) — fit height, crop width symmetrically */
    float scaleX = viewAspect / artAspect;
    return vec2(uv.x * scaleX + (1.0 - scaleX) * 0.5, uv.y);
  }
}

void main() {
  /* Artwork UV — cover crop + flip V (WebGL origin bottom-left) */
  vec2 artUv = coverCrop(vec2(vUv.x, 1.0 - vUv.y), uAspect, uArtworkAspect);
  vec4 art   = texture2D(uArtwork, artUv);

  /* Warm paper ground with slow-drifting grain */
  float g    = fbm(vUv * 92.0 + uTime * 0.18) * 0.013;
  vec3 paper = vec3(0.941 + g, 0.929 + g * 0.84, 0.902 + g * 0.62);

  /* Aggregate 7 strokes — more strokes = denser, more uniform reveal */
  float rev   = 0.0;
  float leadE = 0.0; /* leading-edge accumulator */
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float sp = clamp(uProgress * 7.0 - fi, 0.0, 1.0);
    float s  = strokeReveal(vUv, fi, sp);
    rev = max(rev, s);

    /* Glow: peak near the active sweep front of each in-progress stroke */
    float atFront = exp(-pow((1.0 - sp) * 5.5, 2.0)); /* 1 when sp≈1, fades as stroke completes */
    float edgeAmt = exp(-pow((s - 0.10) * 20.0, 2.0)) * atFront;
    leadE = max(leadE, edgeAmt);
  }
  rev   = clamp(rev, 0.0, 1.0);
  leadE = clamp(leadE, 0.0, 1.0);

  /* Warm amber wet-paint glow at the leading brush edge */
  vec3 glowTint = vec3(0.09, 0.04, -0.04); /* warm toward red/amber, slightly away from blue */
  vec3 col = mix(paper, art.rgb, rev);
  col += glowTint * leadE * 0.22;
  col += leadE * 0.06; /* subtle brightness pop */

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
