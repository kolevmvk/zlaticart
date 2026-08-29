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
uniform float uAspect; /* width / height */

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
float smooth01(float x) { return x * x * (3.0 - 2.0 * x); }

/* ---- single brush stroke ---- */
float strokeReveal(vec2 uv, float idx, float sp) {
  /* Vertical gaussian envelope — overlapping bands */
  float yc   = (idx + 0.5) / 5.0;
  float yEnv = exp(-pow((uv.y - yc) * 7.2, 2.0));

  /* Bristle noise: high y-freq (bristles), low x-freq (sweep direction) */
  vec2 nc = vec2(uv.y * 9.5 + idx * 5.3, uv.x * 0.4 + uTime * 0.010 * (1.0 - sp));
  float n  = (fbm(nc) * 2.0 - 1.0) * 0.10;   /* coarse brush edge */
  float b  = (vnoise(uv * vec2(26.0, 4.0) + vec2(idx * 19.7)) * 2.0 - 1.0) * 0.022; /* fine bristle */

  float ew = 0.020; /* edge softness */
  float t;

  if (mod(idx, 2.0) < 1.0) {
    /* Left → Right */
    float sweepPos = sp + n + b;
    t = clamp((sweepPos - uv.x) / ew, 0.0, 1.0);
  } else {
    /* Right → Left */
    float sweepPos = 1.0 - sp + n + b;
    t = clamp((uv.x - sweepPos) / ew, 0.0, 1.0);
  }

  return clamp(smooth01(t) * yEnv, 0.0, 1.0);
}

void main() {
  /* Artwork — flip V: WebGL origin is bottom-left, image origin top-left */
  vec2 artUv = vec2(vUv.x, 1.0 - vUv.y);
  vec4 art   = texture2D(uArtwork, artUv);

  /* Warm paper with animated grain */
  float g    = fbm(vUv * 92.0 + uTime * 0.38) * 0.016;
  vec3 paper = vec3(0.941 + g, 0.929 + g * 0.87, 0.902 + g * 0.68);

  /* Aggregate brush reveal */
  float rev = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float sp = clamp(uProgress * 5.0 - fi, 0.0, 1.0);
    rev = max(rev, strokeReveal(vUv, fi, sp));
  }
  rev = clamp(rev, 0.0, 1.0);

  /* Wet-paint luminosity at the leading edge */
  float edgeGlow = exp(-pow((rev - 0.07) * 28.0, 2.0)) * 0.10;

  vec3 col = mix(paper, art.rgb, rev);
  col += edgeGlow * (art.rgb + 0.04);

  gl_FragColor = vec4(col, 1.0);
}
`
