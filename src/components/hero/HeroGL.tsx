'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { VERT, FRAG } from '@/lib/gl/brushShader'
import type { Artwork } from '@/lib/content/types'

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

function Wordmark({ visible }: { visible: boolean }) {
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
    tl.fromTo(
      Array.from(chars),
      { yPercent: 115, rotateZ: 0.5 },
      {
        yPercent: 0,
        rotateZ: 0,
        duration: 1.35,
        ease: 'power4.out',
        stagger: { each: 0.042, from: 'start' },
      }
    )
    if (art) {
      tl.fromTo(
        art,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.6'
      )
    }
    if (subtitle) {
      tl.fromTo(
        subtitle,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.55'
      )
    }
    if (cta) {
      tl.fromTo(
        cta,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'none' },
        '-=0.3'
      )
    }
  }, [visible])

  const chars = 'Zlatica'.split('')

  return (
    <div className="select-none">
      {/* Subtitle above */}
      <p
        ref={subtitleRef}
        style={{
          opacity: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: 'clamp(0.6rem, 1.2vw, 0.8125rem)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(240,237,230,0.55)',
          marginBottom: 'clamp(1rem, 2.5vw, 1.75rem)',
        }}
      >
        Painter · Educator · Artist
      </p>

      {/* ZLATICA — character split */}
      <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 1 }}>
        <span
          ref={zlaticaRef}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(4.5rem, 14.5vw, 14rem)',
            letterSpacing: '-0.01em',
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
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                {ch}
              </span>
            </span>
          ))}
        </span>

        {/* ART suffix */}
        <span
          ref={artRef}
          style={{
            opacity: 0,
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 'clamp(1.25rem, 3.8vw, 3.75rem)',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,230,0.65)',
            paddingBottom: '0.18em',
            marginLeft: '0.25em',
            willChange: 'opacity, transform',
          }}
        >
          Art
        </span>
      </div>

      {/* CTA */}
      <div
        ref={ctaRef}
        style={{
          opacity: 0,
          marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}
      >
        <Link
          href="/works"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.6rem, 1.1vw, 0.75rem)',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,230,0.55)',
            transition: 'color 0.25s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.9)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.55)')}
        >
          Explore works
          <span style={{ display: 'inline-block', fontSize: '1.1rem' }}>↓</span>
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
  const containerRef = useRef<HTMLDivElement>(null)
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
  }, [])

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
        const timer = setTimeout(() => {
          tweenRef.current = gsap.to(progressObj.current, {
            value: 1,
            duration: 3.2,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (!wordmarkShownRef.current && progressObj.current.value > 0.55) {
                wordmarkShownRef.current = true
                setWordmarkVisible(true)
              }
            },
            onComplete: () => {
              setWordmarkVisible(true)
            },
          })
        }, 400)

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

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-canvas"
      style={{ height: '100svh', minHeight: '100svh' }}
      aria-label="ZlaticArt — hero"
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

      {/* Bottom gradient for text legibility */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(10,10,9,0.70) 0%, rgba(10,10,9,0.20) 35%, rgba(10,10,9,0) 60%)',
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
        <Wordmark visible={wordmarkVisible} />
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
