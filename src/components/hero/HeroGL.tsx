'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VERT, FRAG } from '@/lib/gl/brushShader'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork } from '@/lib/content/types'

gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// Raw WebGL helpers
// ---------------------------------------------------------------------------

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[HeroGL] Shader error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    throw new Error('Shader compile failed')
  }
  return s
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vert)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, frag)
  const p = gl.createProgram()!
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[HeroGL] Program link error:', gl.getProgramInfoLog(p))
    throw new Error('Program link failed')
  }
  return p
}

// Routes the raw asset through Next's own image optimizer (resize +
// compress + WebP/AVIF negotiation) — the same pipeline every other image
// on the site gets via <Image>, which this one otherwise bypasses entirely
// because WebGL needs a raw `new Image()` for direct pixel access.
// Profiling found the hero texture being served at its untouched original
// size (2009×2015, ~507KB) regardless of viewport — on a 390px-wide phone
// that's roughly 15-20x more image data than the canvas can even display.
// Only for same-origin/relative sources: an absolute external URL (e.g.
// once real Sanity CDN images are wired up as hero art) would need
// next.config's remotePatterns configured for this proxy to work, so it's
// passed through untouched until that's set up.
// Must match next.config.ts's images.deviceSizes + images.imageSizes
// (merged/sorted) — Next's image optimizer 400s on any `w` value that
// isn't exactly one of these, so an arbitrary computed width can't be
// passed straight through.
const NEXT_IMAGE_WIDTHS = [320, 375, 430, 640, 768, 960, 1024, 1280, 1920, 2560]

function buildOptimizedSrc(src: string, targetWidth: number, quality = 85): string {
  if (src.startsWith('http')) return src
  const w = NEXT_IMAGE_WIDTHS.find((width) => width >= targetWidth) ?? NEXT_IMAGE_WIDTHS[NEXT_IMAGE_WIDTHS.length - 1]
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`
}

function loadImageTexture(gl: WebGLRenderingContext, src: string, targetWidth: number): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const tex = gl.createTexture()!
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      resolve(tex)
    }
    img.onerror = reject
    img.src = buildOptimizedSrc(src, targetWidth)
  })
}

// ---------------------------------------------------------------------------
// ZlaticArt wordmark — character split component
// ---------------------------------------------------------------------------

function Wordmark({ visible, tagline, cta }: { visible: boolean; tagline: string; cta: string }) {
  const zlaticaRef = useRef<HTMLHeadingElement>(null)
  const artRef = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    if (!zlaticaRef.current) return

    const chars = zlaticaRef.current.querySelectorAll<HTMLElement>('.hc-inner')
    const art = artRef.current
    const subtitle = subtitleRef.current
    const cta = ctaRef.current

    const tl = gsap.timeline()

    // Subtitle breathes in first — sets emotional context
    if (subtitle) {
      tl.fromTo(
        subtitle,
        { opacity: 0, y: 6, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }
      )
    }

    // ZLATICA: chars rise from below with heavy weight — oil painting reveal
    tl.fromTo(
      Array.from(chars),
      { yPercent: 108, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.6,
        ease: 'power4.out',
        stagger: { each: 0.055, from: 'start' },
      },
      '-=0.4'
    )

    // Label at the char reveal's end time — lets the gild/glow tween below
    // be positioned relative to *this specific point* rather than appended
    // sequentially, so it overlaps the tail of that reveal instead of
    // waiting for it to fully settle first.
    tl.addLabel('charsRevealEnd')

    // Cinematic gild + glow — a gold light-sweep passes across the letters
    // once, staggered left-to-right so it reads as a wave rather than all
    // seven letters flashing gold in sync, then the glow settles back out.
    // Background-position values here found empirically (rendering the
    // gradient at a sweep of positions): 100% is this gradient's cream
    // rest point, -100% its gold peak — a naive "outside the gold
    // percentage stops" calculation suggested 200%/-100% instead, which
    // are actually two equivalent gold peaks one full 300%-tile apart
    // (an earlier version of this animation swept between those two,
    // which is why it appeared to do nothing: same gold phase at both
    // ends). Two sequential tweens, cream→gold then gold→cream, so the
    // glow peaks exactly when the colour does, at the midpoint — a single
    // fromTo can't do that since it only has two keyframes.
    tl.fromTo(
      Array.from(chars),
      { backgroundPosition: '100% 0', textShadow: '0 0 0px rgba(224,169,62,0)' },
      {
        backgroundPosition: '-100% 0',
        textShadow: '0 0 32px rgba(224,169,62,0.85)',
        duration: 0.9,
        ease: 'power2.inOut',
        stagger: { each: 0.08, from: 'start' },
      },
      'charsRevealEnd-=0.6'
    ).to(Array.from(chars), {
      backgroundPosition: '100% 0',
      textShadow: '0 0 0px rgba(224,169,62,0)',
      duration: 1.1,
      ease: 'power2.out',
      stagger: { each: 0.08, from: 'start' },
    })

    tl.addLabel('gildEnd')

    // ART suffix — a faulty-neon-sign flicker rather than a plain fade,
    // timed to switch on right as the "Zlatica" gild sweep finishes
    // settling (per feedback: ART should react to the gild completing,
    // not appear independently of it). Irregular opacity steps of
    // deliberately uneven duration before it catches and holds, the way a
    // real tube flickers on rather than a clean linear brighten.
    if (art) {
      tl.set(art, { opacity: 0, x: -20, filter: 'blur(2px)' }, 'gildEnd-=0.15')
        .to(art, { opacity: 0.7, duration: 0.05 })
        .to(art, { opacity: 0.05, duration: 0.06 })
        .to(art, { opacity: 0.85, duration: 0.04 })
        .to(art, { opacity: 0.15, duration: 0.09 })
        .to(art, { opacity: 0.9, x: 0, filter: 'blur(0px)', duration: 0.06 })
        .to(art, { opacity: 0.25, duration: 0.07 })
        .to(art, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    }

    // CTA — quiet fade, right after ART catches
    if (cta) {
      tl.fromTo(
        cta,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        '-=0.3'
      )
    }
  }, [visible])

  const chars = 'Zlatica'.split('')

  return (
    <div className="select-none">
      {/* ZLATICA — massive serif, full emotional weight */}
      <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 1 }}>
        <h1
          ref={zlaticaRef}
          style={{
            margin: 0,
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(5rem, 16.5vw, 16rem)',
            letterSpacing: '-0.02em',
            color: '#F0EDE6',
            display: 'inline-flex',
          }}
          aria-label="Zlatica"
        >
          {chars.map((ch, i) => (
            <span
              key={i}
              style={{ overflow: 'hidden', display: 'inline-block', verticalAlign: 'bottom' }}
            >
              <span
                className="hc-inner hero-gild"
                style={{ display: 'inline-block', willChange: 'transform', opacity: 0 }}
              >
                {ch}
              </span>
            </span>
          ))}
        </h1>

        {/* ART — small, faint, kerned wide, sits at baseline */}
        <span
          ref={artRef}
          style={{
            opacity: 0,
            fontFamily: 'var(--font-sans)',
            fontWeight: 200,
            fontSize: 'clamp(1rem, 2.8vw, 2.8rem)',
            letterSpacing: '0.6em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,230,0.5)',
            paddingBottom: '0.15em',
            marginLeft: '0.3em',
            willChange: 'opacity, transform, filter',
          }}
        >
          Art
        </span>
      </div>

      {/* Tagline below name — discipline markers, barely visible */}
      <p
        ref={subtitleRef}
        style={{
          opacity: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: 'clamp(0.55rem, 1.05vw, 0.75rem)',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(240,237,230,0.38)',
          marginTop: 'clamp(0.75rem, 1.5vw, 1.25rem)',
          willChange: 'opacity, transform, filter',
        }}
      >
        {tagline}
      </p>

      {/* CTA — absolute minimal */}
      <div
        ref={ctaRef}
        style={{
          opacity: 0,
          marginTop: 'clamp(2rem, 4vw, 3.5rem)',
          willChange: 'opacity, transform',
        }}
      >
        <Link
          href="/works"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.55rem, 1vw, 0.7rem)',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,230,0.45)',
            transition: 'color 0.4s ease, gap 0.4s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'rgba(240,237,230,0.9)'
            el.style.gap = '1.4rem'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'rgba(240,237,230,0.45)'
            el.style.gap = '1rem'
          }}
        >
          {cta}
          <span style={{ display: 'inline-block', width: 28, height: 1, background: 'rgba(240,237,230,0.4)', flexShrink: 0 }} />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Two independent hero effects — do not conflate:
//
// 1) Initial brush reveal (initialRevealRef.value, → uInitialRevealProgress)
//    One-shot, tweened 0→1 on hero mount over ~4.2s, boostable by an early
//    scroll/touch (see the "Scroll/wheel boost" effect below), skipped
//    entirely under reduced motion (jumps straight to 1, static hero).
//    Drives the shader's 7-stroke brush reveal that uncovers the artwork
//    from bare linen. Nothing below this effect touches that tween.
//
// 2) Scroll glass-drag deformation (scrollSmearProgressRef →
//    pigmentPullEnvelope() → uPigmentPullStrength). Only starts once the
//    user scrolls the hero (a separate ScrollTrigger, briefly pinning the
//    section — see the pigment-pull-scroll useEffect further down). Drags
//    paint that effect (1) has already revealed, via a coherent flow-field
//    displacement (see brushShader.ts) — an invisible pane dragging the
//    still-wet paint with it as it moves straight down; it can never touch
//    bare linen. Also skipped entirely under reduced motion.
//
// pigmentPullEnvelope() below belongs to effect (2) only — it maps that
// ScrollTrigger's raw progress (0 = pin start, 1 = pin end) to the
// deformation's overall magnitude at that point. Monotonic: ramps in, then
// holds at full strength — it deliberately does NOT fade back to 0 as the
// pin ends. Wet paint that's been dragged doesn't un-drag itself just
// because the viewer keeps scrolling in the same direction; a fade-back-out
// here would read as the painting healing itself, which breaks the entire
// physical premise of the effect. The hero's own scale/opacity handoff (see
// the pigment-pull-scroll useEffect below) still carries the — now
// permanently deformed — canvas out toward Selected Works; scrubbing back
// up still relaxes the drag (the glass moving back up), which is expected,
// reversible scroll-linked behaviour, not "healing." See docs/HERO_SPEC.md
// scroll-handoff + the living-canvas skill.
function pigmentPullEnvelope(t: number): number {
  const smootherstep = (x: number) => {
    const c = Math.min(Math.max(x, 0), 1)
    return c * c * c * (c * (c * 6 - 15) + 10)
  }
  // Ramps across nearly the entire pin (was 0.55 — reached full strength
  // barely halfway through, then just sat there unchanged for the rest of
  // the scroll/drag, which read as the effect "finishing early" even
  // though technically still held at max). Now the mixing keeps visibly
  // building all the way to the end of the pin, so it's still actively
  // changing right up until the hero scrolls out of view — not just
  // "maintained" as a frozen final frame, but still growing.
  return smootherstep(Math.min(t / 0.95, 1))
}

// ---------------------------------------------------------------------------
// Main hero component
// ---------------------------------------------------------------------------

interface HeroGLProps {
  artwork: Artwork
}

export default function HeroGL({ artwork }: HeroGLProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const mouseTiltRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const textureRef = useRef<WebGLTexture | null>(null)
  const rafRef = useRef<number>(0)
  const initialRevealRef = useRef({ value: 0 })
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const startTimeRef = useRef<number>(0)
  const [wordmarkVisible, setWordmarkVisible] = useState(false)
  const wordmarkShownRef = useRef(false)
  const [glFailed, setGlFailed] = useState(false)
  const reducedMotion = useRef(false)
  // Effect (2) only — scroll oil-smear. Raw scroll progress (0→1, position
  // of the traveling band) and a one-time device scale factor (0.85
  // mobile-or-touch / 1 desktop). Refs, not state — read every rAF frame,
  // never trigger a re-render. initialRevealRef above is effect (1) and is
  // entirely separate.
  const scrollSmearProgressRef = useRef(0)
  const pigmentPullDeviceScaleRef = useRef(1)
  // Cursor position (-1..1, lerped smooth in the mouse-parallax effect
  // below), fed to the shader purely to relight the impasto surface — the
  // paint visibly catches/loses light as the pointer moves. Stays (0,0) on
  // touch and reduced-motion, where that effect never runs.
  const pointerTiltRef = useRef({ x: 0, y: 0 })

  // Render one WebGL frame
  const render = useCallback(() => {
    const gl = glRef.current
    const prog = programRef.current
    const tex = textureRef.current
    if (!gl || !prog || !tex) return

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.useProgram(prog)

    const u = uniformsRef.current
    const t = (performance.now() - startTimeRef.current) * 0.001
    gl.uniform1f(u.uInitialRevealProgress, initialRevealRef.current.value)
    gl.uniform1f(u.uTime, t)
    gl.uniform1f(u.uAspect, gl.drawingBufferWidth / gl.drawingBufferHeight)
    gl.uniform1f(
      u.uArtworkAspect,
      artwork.primaryImage.width / artwork.primaryImage.height
    )
    gl.uniform1f(
      u.uPigmentPullStrength,
      pigmentPullEnvelope(scrollSmearProgressRef.current) * pigmentPullDeviceScaleRef.current
    )
    gl.uniform1f(u.uPointerTiltX, pointerTiltRef.current.x)
    gl.uniform1f(u.uPointerTiltY, pointerTiltRef.current.y)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(u.uArtwork, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Update progress bar — direct DOM, no React state
    if (progressBarRef.current) {
      const p = initialRevealRef.current.value
      progressBarRef.current.style.transform = `scaleX(${p})`
      progressBarRef.current.style.opacity = p >= 1 ? '0' : '0.35'
    }
  }, [artwork.primaryImage.width, artwork.primaryImage.height])

  // rAF loop. Guarded by loopRunningRef (see startLoop/stopLoop below) so a
  // frame already in flight when the hero scrolls out of view doesn't
  // reschedule itself once more before the observer's stop takes effect.
  const loopRunningRef = useRef(false)
  const loop = useCallback(() => {
    render()
    if (loopRunningRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [render])

  // The hero's fragment shader is expensive (7-stroke reveal loop, multiple
  // fbm/noise evaluations per pixel for relief shading and, once scrolled,
  // the 20-tap glass-drag). Rendering it at 60fps forever — including long
  // after the user has scrolled well past the hero into later sections —
  // was pure wasted GPU/CPU work and a real contributor to the site feeling
  // sluggish. An IntersectionObserver pauses the rAF loop entirely while
  // the hero isn't on screen, and resumes it the moment it scrolls back
  // into view (rootMargin gives it a head start so there's no visible pop
  // when it re-enters).
  const startLoop = useCallback(() => {
    if (loopRunningRef.current) return
    loopRunningRef.current = true
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])
  const stopLoop = useCallback(() => {
    loopRunningRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // --- WebGL init ---
    let gl: WebGLRenderingContext | null = null
    try {
      gl = (canvas.getContext('webgl', { antialias: false, alpha: false }) ||
        canvas.getContext('experimental-webgl', { antialias: false, alpha: false })) as WebGLRenderingContext | null
    } catch {}

    if (!gl) {
      setGlFailed(true)
      setWordmarkVisible(true)
      return
    }

    glRef.current = gl

    // Canvas size
    const setSize = () => {
      if (!container || !canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(container.clientWidth * dpr)
      canvas.height = Math.round(container.clientHeight * dpr)
    }
    setSize()

    // Compile program
    let prog: WebGLProgram
    try {
      prog = createProgram(gl, VERT, FRAG)
    } catch {
      setGlFailed(true)
      setWordmarkVisible(true)
      return
    }
    programRef.current = prog
    gl.useProgram(prog)

    // Fullscreen quad: pos (xy) + uv
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // aPos    aUv
        -1, -1,  0, 0,
         1, -1,  1, 0,
        -1,  1,  0, 1,
         1,  1,  1, 1,
      ]),
      gl.STATIC_DRAW
    )
    const stride = 16
    const posLoc = gl.getAttribLocation(prog, 'aPos')
    const uvLoc = gl.getAttribLocation(prog, 'aUv')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0)
    gl.enableVertexAttribArray(uvLoc)
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 8)

    // Cache uniform locations
    uniformsRef.current = {
      uArtwork: gl.getUniformLocation(prog, 'uArtwork'),
      uInitialRevealProgress: gl.getUniformLocation(prog, 'uInitialRevealProgress'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
      uAspect: gl.getUniformLocation(prog, 'uAspect'),
      uArtworkAspect: gl.getUniformLocation(prog, 'uArtworkAspect'),
      uPigmentPullStrength: gl.getUniformLocation(prog, 'uPigmentPullStrength'),
      uPointerTiltX: gl.getUniformLocation(prog, 'uPointerTiltX'),
      uPointerTiltY: gl.getUniformLocation(prog, 'uPointerTiltY'),
    }

    startTimeRef.current = performance.now()

    // Load artwork texture, then start animation
    loadImageTexture(gl, artwork.primaryImage.src, canvas.width)
      .then((tex) => {
        textureRef.current = tex

        // Start rendering loop
        startLoop()

        if (reducedMotion.current) {
          initialRevealRef.current.value = 1
          wordmarkShownRef.current = true
          setWordmarkVisible(true)
          return
        }

        // Delay, then tween progress 0→1
        // Oil paint timing: slow, weighted start — like loading a brush and dragging
        const timer = setTimeout(() => {
          tweenRef.current = gsap.to(initialRevealRef.current, {
            value: 1,
            duration: 4.2,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (!wordmarkShownRef.current && initialRevealRef.current.value > 0.62) {
                wordmarkShownRef.current = true
                setWordmarkVisible(true)
              }
            },
            onComplete: () => {
              setWordmarkVisible(true)
            },
          })
        }, 280)

        return () => clearTimeout(timer)
      })
      .catch(() => {
        // Texture failed — still show hero without artwork
        setWordmarkVisible(true)
        startLoop()
      })

    // Resize observer
    const ro = new ResizeObserver(setSize)
    ro.observe(container)

    // Pause/resume the render loop based on hero visibility — see the
    // startLoop/stopLoop comment above for why this matters. rootMargin
    // gives it a 25% viewport-height head start so scrolling back up never
    // shows a blank/stale frame popping in.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop()
        } else {
          stopLoop()
        }
      },
      { rootMargin: '25% 0px' }
    )
    io.observe(container)

    // WebGL context lost handler
    const onContextLost = (e: Event) => {
      e.preventDefault()
      stopLoop()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      stopLoop()
      tweenRef.current?.kill()
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect (1) only — lets an early scroll/touch accelerate the initial
  // brush reveal tween so it doesn't feel like a forced wait. Unrelated to
  // effect (2)'s ScrollTrigger further down.
  useEffect(() => {
    const boost = () => {
      if (!tweenRef.current || tweenRef.current.progress() >= 1) return
      tweenRef.current.timeScale(Math.min((tweenRef.current.timeScale() || 1) * 1.8 + 0.4, 6))
      // Ease back to 1x after boost
      gsap.to(tweenRef.current, { timeScale: 1, duration: 1.5, ease: 'power2.out', overwrite: false })
    }
    window.addEventListener('wheel', boost, { passive: true })
    window.addEventListener('touchstart', boost, { passive: true })
    return () => {
      window.removeEventListener('wheel', boost)
      window.removeEventListener('touchstart', boost)
    }
  }, [])

  // Mouse parallax — gentle canvas tilt that responds to pointer position,
  // and (same lerped pointer position) relights the shader's impasto
  // surface via pointerTiltRef so the paint's own texture visibly catches
  // light as the cursor moves. Uses rAF lerp for smoothness. Skipped on
  // touch and reduced-motion — pointerTiltRef then simply stays at (0,0),
  // leaving the shader's constant idle light-drift as the only motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const tilt = mouseTiltRef.current
    if (!tilt) return

    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0
    let targetLightX = 0, targetLightY = 0
    let currentLightX = 0, currentLightY = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetX = ny * -5   // rotateX: positive up = tilt back
      targetY = nx * 6    // rotateY: positive right = tilt right
      targetLightX = nx
      targetLightY = ny
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      tilt.style.transform = `perspective(1100px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`

      currentLightX += (targetLightX - currentLightX) * 0.05
      currentLightY += (targetLightY - currentLightY) * 0.05
      pointerTiltRef.current = { x: currentLightX, y: currentLightY }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      tilt.style.transform = ''
      pointerTiltRef.current = { x: 0, y: 0 }
    }
  }, [])

  // Effect (2) — scroll oil-smear. Independent of the initial brush reveal
  // above (effect 1): this only starts once the user scrolls. The hero is
  // pinned for a short, controlled distance so the smear plays out fully
  // on screen instead of racing past
  // while the hero scrolls away (the old failure mode: by the time the
  // effect peaked at progress 0.55–0.85, the hero was already mostly off
  // screen because it was never pinned). The pin distance is a fraction of
  // one viewport height, so this never reads as a scroll trap — a normal
  // scroll, or the wheel/touch boost above, clears it quickly.
  //
  // Everything is driven off one ScrollTrigger's progress (0→1 across the
  // pin): scrollSmearProgressRef feeds the shader's traveling pigment band, and
  // the same progress drives the canvas-wrapper scale/opacity "framing"
  // handoff toward the works grid below — but only in the pin's final
  // stretch (see `handoff` below), so the frame doesn't shrink while the
  // pigment pull is still peaking.
  //
  // Skipped entirely under reduced motion, which leaves the hero unpinned
  // and scrollSmearProgressRef at 0 forever — the shader then applies zero
  // displacement and the hero stays permanently sharp, matching this
  // file's other reduced-motion fallbacks.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef.current
    const wrapper = canvasWrapperRef.current
    if (!container || !wrapper) return

    const isSmallOrTouch = window.matchMedia('(pointer: coarse), (max-width: 767px)').matches
    // Mobile gets its own tuning, not just a weaker version: a shorter pin
    // (less scroll commitment on a small screen) but a strength close to
    // desktop so the pigment pull still reads clearly.
    pigmentPullDeviceScaleRef.current = isSmallOrTouch ? 0.85 : 1
    // Per feedback, the pin previously resolved too quickly — a small
    // wheel tick or a short finger drag was enough to run through the
    // whole effect. Lengthened so it demands a more deliberate scroll/drag
    // commitment (was 0.42 / 0.62 of one viewport height).
    const pinFraction = isSmallOrTouch ? 0.65 : 1.0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * pinFraction}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.35,
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollSmearProgressRef.current = self.progress
          const handoff = Math.max(0, (self.progress - 0.72) / 0.28)
          wrapper.style.transform = `scale(${1 - handoff * 0.04})`
          wrapper.style.opacity = `${1 - handoff * 0.08}`
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-canvas"
      style={{ height: '100svh', minHeight: '100svh' }}
      aria-label="ZlaticArt — hero"
    >
      {/* Canvas visual wrapper — scroll handoff transform is applied here.
          Keeping this separate from containerRef so the WebGL resize observer
          (which reads container.clientWidth/Height) is unaffected by transforms. */}
      <div
        ref={canvasWrapperRef}
        style={{ position: 'absolute', inset: 0, transformOrigin: 'center center' }}
      >
        {/* Inner tilt div — receives mouse parallax transform.
            GSAP scroll scale lives on canvasWrapperRef above; this layer
            handles only pointer-driven perspective tilt so the two transforms
            never conflict. */}
        <div
          ref={mouseTiltRef}
          style={{
            position: 'absolute',
            inset: '-4%',
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          {/* WebGL canvas — full cover */}
          {!glFailed && (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          )}

          {/* Fallback for no WebGL: plain artwork image */}
          {glFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artwork.primaryImage.src}
              alt={artwork.primaryImage.alt}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom gradient for text legibility — outside the wrapper so it
          always covers the full section regardless of canvas scale. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(10,10,9,0.85) 0%, rgba(10,10,9,0.55) 22%, rgba(10,10,9,0.15) 45%, rgba(10,10,9,0) 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Wordmark — positioned bottom-left editorial style */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(2rem, 5vw, 4.5rem)',
          left: 'clamp(1.25rem, 4vw, 4rem)',
          right: 'clamp(1.25rem, 4vw, 4rem)',
          zIndex: 10,
        }}
      >
        <Wordmark visible={wordmarkVisible} tagline={t.hero.tagline} cta={t.hero.cta} />
      </div>

      {/* Brush-reveal progress bar — 1px line at bottom edge */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 1,
          background: 'rgba(240,237,230,0.9)',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          opacity: 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
          zIndex: 5,
        }}
        ref={progressBarRef}
      />

      {/* Scroll indicator */}
      {wordmarkVisible && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 'clamp(1.25rem, 3vw, 3rem)',
            bottom: 'clamp(2rem, 5vw, 4.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'scrollPulse 2.4s ease-in-out infinite',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.55rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.55)',
              writingMode: 'vertical-rl',
            }}
          >
            Scroll
          </span>
          <div style={{ width: 2, height: 44, background: 'rgba(240,237,230,0.55)' }} />
        </div>
      )}

      <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(8px); }
        }
      `}</style>
    </section>
  )
}
