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

function loadImageTexture(gl: WebGLRenderingContext, src: string): Promise<WebGLTexture> {
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
    img.src = src
  })
}

// ---------------------------------------------------------------------------
// ZlaticArt wordmark — character split component
// ---------------------------------------------------------------------------

function Wordmark({ visible, tagline, cta }: { visible: boolean; tagline: string; cta: string }) {
  const zlaticaRef = useRef<HTMLSpanElement>(null)
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

    // ART suffix — slides in from slight left with ease
    if (art) {
      tl.fromTo(
        art,
        { opacity: 0, x: -20, filter: 'blur(4px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
        '-=1.0'
      )
    }

    // CTA — quiet fade
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
        <span
          ref={zlaticaRef}
          style={{
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
                className="hc-inner"
                style={{ display: 'inline-block', willChange: 'transform', opacity: 0 }}
              >
                {ch}
              </span>
            </span>
          ))}
        </span>

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
  const progressObj = useRef({ value: 0 })
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const startTimeRef = useRef<number>(0)
  const [wordmarkVisible, setWordmarkVisible] = useState(false)
  const wordmarkShownRef = useRef(false)
  const [glFailed, setGlFailed] = useState(false)
  const reducedMotion = useRef(false)

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
    gl.uniform1f(u.uProgress, progressObj.current.value)
    gl.uniform1f(u.uTime, t)
    gl.uniform1f(u.uAspect, gl.drawingBufferWidth / gl.drawingBufferHeight)
    gl.uniform1f(
      u.uArtworkAspect,
      artwork.primaryImage.width / artwork.primaryImage.height
    )

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(u.uArtwork, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Update progress bar — direct DOM, no React state
    if (progressBarRef.current) {
      const p = progressObj.current.value
      progressBarRef.current.style.transform = `scaleX(${p})`
      progressBarRef.current.style.opacity = p >= 1 ? '0' : '0.35'
    }
  }, [artwork.primaryImage.width, artwork.primaryImage.height])

  // rAF loop
  const loop = useCallback(() => {
    render()
    rafRef.current = requestAnimationFrame(loop)
  }, [render])

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
      uProgress: gl.getUniformLocation(prog, 'uProgress'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
      uAspect: gl.getUniformLocation(prog, 'uAspect'),
      uArtworkAspect: gl.getUniformLocation(prog, 'uArtworkAspect'),
    }

    startTimeRef.current = performance.now()

    // Load artwork texture, then start animation
    loadImageTexture(gl, artwork.primaryImage.src)
      .then((tex) => {
        textureRef.current = tex

        // Start rendering loop
        rafRef.current = requestAnimationFrame(loop)

        if (reducedMotion.current) {
          progressObj.current.value = 1
          wordmarkShownRef.current = true
          setWordmarkVisible(true)
          return
        }

        // Delay, then tween progress 0→1
        // Oil paint timing: slow, weighted start — like loading a brush and dragging
        const timer = setTimeout(() => {
          tweenRef.current = gsap.to(progressObj.current, {
            value: 1,
            duration: 4.2,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (!wordmarkShownRef.current && progressObj.current.value > 0.62) {
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
        rafRef.current = requestAnimationFrame(loop)
      })

    // Resize observer
    const ro = new ResizeObserver(setSize)
    ro.observe(container)

    // WebGL context lost handler
    const onContextLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(rafRef.current)
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      cancelAnimationFrame(rafRef.current)
      tweenRef.current?.kill()
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll/wheel boost
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

  // Mouse parallax — gentle canvas tilt that responds to pointer position.
  // Uses rAF lerp for smoothness. Skipped on touch and reduced-motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const tilt = mouseTiltRef.current
    if (!tilt) return

    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetX = ny * -5   // rotateX: positive up = tilt back
      targetY = nx * 6    // rotateY: positive right = tilt right
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      tilt.style.transform = `perspective(1100px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      tilt.style.transform = ''
    }
  }, [])

  // Scroll handoff — as hero exits, canvas wrapper gently scales/fades to
  // suggest the artwork is being "framed" into the works grid below.
  // Targets canvasWrapperRef (not the canvas element) to avoid interfering
  // with the WebGL resize logic on containerRef.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef.current
    const wrapper = canvasWrapperRef.current
    if (!container || !wrapper) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapper,
        { scale: 1, opacity: 1 },
        {
          scale: 0.96,
          opacity: 0.92,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '30% top',
            scrub: true,
          },
        }
      )
    })

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
              color: 'rgba(240,237,230,0.30)',
              writingMode: 'vertical-rl',
            }}
          >
            Scroll
          </span>
          <div style={{ width: 1, height: 40, background: 'rgba(240,237,230,0.20)' }} />
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
