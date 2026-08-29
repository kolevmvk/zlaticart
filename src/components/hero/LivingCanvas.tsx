'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/content/types'

// ---------------------------------------------------------------------------
// Brush math helpers
// ---------------------------------------------------------------------------

type Point = [number, number]

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  return [
    mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0],
    mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1],
  ]
}

function quadBezier(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ]
}

function sampleBezier(pts: Point[], t: number): Point {
  if (pts.length === 4) return cubicBezier(pts[0], pts[1], pts[2], pts[3], t)
  return quadBezier(pts[0], pts[1], pts[2], t)
}

// LCG pseudo-random for deterministic brush geometry
function makePrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// Create an off-screen brush stamp canvas.
// The stamp is elongated in Y (stroke direction) with irregular bristle edges.
function createBrushStamp(radius: number, seed: number): HTMLCanvasElement {
  const rand = makePrng(seed)
  const w = Math.ceil(radius * 2.4)
  const h = Math.ceil(radius * 5.5)
  const stamp = document.createElement('canvas')
  stamp.width = w
  stamp.height = h
  const ctx = stamp.getContext('2d')!
  const cx = w / 2
  const cy = h * 0.52

  // Core body: soft radial gradient
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.55)
  g.addColorStop(0, 'rgba(0,0,0,0.93)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.78)')
  g.addColorStop(0.85, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.44, h * 0.44, 0, 0, Math.PI * 2)
  ctx.fill()

  // Bristle strands — long thin ellipses within the body + beyond edges
  for (let i = 0; i < 22; i++) {
    const alpha = 0.25 + rand() * 0.45
    ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(2)})`
    const bx = cx + (rand() - 0.5) * w * 0.9
    const byOffset = (rand() - 0.35) * h * 0.95
    const by = cy + byOffset
    const len = h * (0.045 + rand() * 0.13)
    const bw = 0.6 + rand() * 1.8
    const angle = (rand() - 0.5) * 0.25
    ctx.save()
    ctx.translate(bx, by)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.ellipse(0, 0, bw, len, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Dry-brush fringe: sparse bristles at the lateral edges
  for (let i = 0; i < 14; i++) {
    const side = rand() > 0.5 ? 1 : -1
    const alpha = 0.12 + rand() * 0.22
    ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(2)})`
    const bx = cx + side * (w * 0.32 + rand() * w * 0.18)
    const by = cy + (rand() - 0.5) * h * 0.75
    const len = h * (0.025 + rand() * 0.07)
    const bw = 0.4 + rand() * 1.0
    ctx.beginPath()
    ctx.ellipse(bx, by, bw, len, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  return stamp
}

// ---------------------------------------------------------------------------
// Stroke path definitions (normalized 0–1 coordinates)
// ---------------------------------------------------------------------------

interface Stroke {
  pts: Point[]          // control points
  widthFraction: number // brush width as fraction of canvas height
  stampCount: number    // number of stamps along the stroke
}

function getStrokes(mobile: boolean): Stroke[] {
  // Back-and-forth sweeps — portrait vs landscape paths
  if (mobile) {
    return [
      { pts: [[0, 0.14], [0.5, 0.10], [1, 0.17]], widthFraction: 0.18, stampCount: 28 },
      { pts: [[1, 0.30], [0.5, 0.27], [0, 0.33]], widthFraction: 0.18, stampCount: 28 },
      { pts: [[0, 0.46], [0.5, 0.43], [1, 0.49]], widthFraction: 0.18, stampCount: 28 },
      { pts: [[1, 0.62], [0.5, 0.59], [0, 0.65]], widthFraction: 0.18, stampCount: 28 },
      { pts: [[0, 0.78], [0.5, 0.75], [1, 0.80]], widthFraction: 0.18, stampCount: 28 },
      { pts: [[1, 0.92], [0.5, 0.90], [0, 0.94]], widthFraction: 0.15, stampCount: 22 },
    ]
  }
  // Desktop: 5 wide horizontal sweeps with gentle S-curve wobble
  return [
    { pts: [[0, 0.17], [0.3, 0.12], [0.7, 0.20], [1, 0.14]], widthFraction: 0.21, stampCount: 36 },
    { pts: [[1, 0.34], [0.7, 0.29], [0.3, 0.37], [0, 0.31]], widthFraction: 0.21, stampCount: 36 },
    { pts: [[0, 0.51], [0.35, 0.47], [0.65, 0.54], [1, 0.49]], widthFraction: 0.21, stampCount: 36 },
    { pts: [[1, 0.68], [0.65, 0.63], [0.35, 0.70], [0, 0.65]], widthFraction: 0.21, stampCount: 36 },
    { pts: [[0, 0.85], [0.4, 0.82], [1, 0.88]], widthFraction: 0.18, stampCount: 30 },
  ]
}

// ---------------------------------------------------------------------------
// Paper texture (drawn once at init)
// ---------------------------------------------------------------------------

function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#F0EDE6'
  ctx.fillRect(0, 0, w, h)

  // Subtle warm grain — work on a downsampled tile to keep it fast
  const tileSize = 256
  const tileCanvas = document.createElement('canvas')
  tileCanvas.width = tileSize
  tileCanvas.height = tileSize
  const tCtx = tileCanvas.getContext('2d')!
  const id = tCtx.createImageData(tileSize, tileSize)
  const data = id.data
  const rand = makePrng(42)
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 18
    data[i] = Math.min(255, Math.max(0, 240 + n))         // R
    data[i + 1] = Math.min(255, Math.max(0, 237 + n * 0.9)) // G
    data[i + 2] = Math.min(255, Math.max(0, 230 + n * 0.75)) // B
    data[i + 3] = 255
  }
  tCtx.putImageData(id, 0, 0)
  const pattern = ctx.createPattern(tileCanvas, 'repeat')!
  ctx.globalAlpha = 0.55
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface LivingCanvasProps {
  artwork: Artwork
}

type HeroPhase = 'loading' | 'ready' | 'brushing' | 'typed' | 'done'

export default function LivingCanvas({ artwork }: LivingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef<HeroPhase>('loading')
  const progressRef = useRef(0)     // 0 → 1 across all strokes
  const scrollBoostRef = useRef(0)
  const rafRef = useRef<number>(0)
  const stampRef = useRef<HTMLCanvasElement | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const reducedMotionRef = useRef(false)

  const [phase, setPhase] = useState<HeroPhase>('loading')

  // Stroke speed: fraction of total progress per 60fps frame
  const BASE_SPEED = 1 / (3.0 * 60) // ~3 seconds total

  const commitPhase = useCallback((p: HeroPhase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  // Draw all strokes up to the current progress value
  const renderStrokes = useCallback(
    (ctx: CanvasRenderingContext2D, progress: number, cw: number, ch: number) => {
      const strokes = strokesRef.current
      const stamp = stampRef.current
      if (!stamp || strokes.length === 0) return

      const totalStrokes = strokes.length
      const pPerStroke = 1 / totalStrokes

      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'

      for (let si = 0; si < totalStrokes; si++) {
        const strokeStart = si * pPerStroke
        if (progress < strokeStart) break

        const strokeProgress = Math.min((progress - strokeStart) / pPerStroke, 1)
        const stroke = strokes[si]
        const pts = stroke.pts.map(([x, y]) => [x * cw, y * ch] as Point)
        const brushH = stroke.widthFraction * ch
        const brushW = brushH * 0.45
        const count = Math.floor(stroke.stampCount * strokeProgress)

        for (let j = 0; j <= count; j++) {
          const t = count === 0 ? 0 : j / stroke.stampCount
          const [bx, by] = sampleBezier(pts, Math.min(t, 1))

          // Compute angle from tangent for stamp rotation
          const dt = 0.02
          const [bx2, by2] = sampleBezier(pts, Math.min(t + dt, 1))
          const angle = Math.atan2(by2 - by, bx2 - bx) - Math.PI / 2

          ctx.save()
          ctx.translate(bx, by)
          ctx.rotate(angle)
          ctx.globalAlpha = 0.88 + 0.12 * Math.sin(j * 0.7)
          ctx.drawImage(stamp, -brushW / 2, -brushH / 2, brushW, brushH)
          ctx.restore()
        }

        if (strokeProgress < 1) break
      }

      ctx.restore()
    },
    []
  )

  // rAF loop
  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas

    // Scale for DPR
    const dpr = parseFloat(canvas.dataset.dpr ?? '1')
    const cw = width / dpr
    const ch = height / dpr

    const boost = scrollBoostRef.current
    scrollBoostRef.current = boost * 0.92
    const advance = BASE_SPEED + boost
    progressRef.current = Math.min(progressRef.current + advance, 1)
    const p = progressRef.current

    // Redraw canvas: paper first, then erase with brush strokes
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.scale(dpr, dpr)
    drawPaper(ctx, cw, ch)
    renderStrokes(ctx, p, cw, ch)
    ctx.restore()

    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      // All strokes done — fade out canvas, reveal typography
      canvas.style.transition = 'opacity 0.8s ease-out'
      canvas.style.opacity = '0'
      setTimeout(() => commitPhase('typed'), 400)
      setTimeout(() => commitPhase('done'), 1200)
    }
  }, [BASE_SPEED, renderStrokes, commitPhase])

  // Init
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const mobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const cw = container.clientWidth
    const ch = container.clientHeight

    canvas.width = Math.round(cw * dpr)
    canvas.height = Math.round(ch * dpr)
    canvas.style.width = `${cw}px`
    canvas.style.height = `${ch}px`
    canvas.dataset.dpr = String(dpr)

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    drawPaper(ctx, cw, ch)

    // Pre-generate brush stamp
    const brushRadius = Math.round(ch * 0.065)
    stampRef.current = createBrushStamp(brushRadius, 77)
    strokesRef.current = getStrokes(mobile)

    if (reducedMotionRef.current) {
      // Skip animation: fade canvas out immediately
      canvas.style.transition = 'opacity 0.4s ease-out'
      canvas.style.opacity = '0'
      commitPhase('done')
      return
    }

    commitPhase('ready')

    // Start brushing after a brief pause
    const startTimer = setTimeout(() => {
      commitPhase('brushing')
      rafRef.current = requestAnimationFrame(tick)
    }, 600)

    return () => {
      clearTimeout(startTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [tick, commitPhase])

  // Scroll boost
  useEffect(() => {
    if (phaseRef.current !== 'brushing') return
    const onWheel = () => {
      if (phaseRef.current === 'brushing') scrollBoostRef.current += 0.04
    }
    const onTouch = () => {
      if (phaseRef.current === 'brushing') scrollBoostRef.current += 0.05
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [phase])

  const typoVisible = phase === 'typed' || phase === 'done'

  return (
    <section
      ref={containerRef}
      className="relative h-svh min-h-svh overflow-hidden bg-canvas"
      aria-label="Hero — Living Canvas"
    >
      {/* Artwork image — behind the canvas */}
      <Image
        src={artwork.primaryImage.src}
        alt={artwork.primaryImage.alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
        style={{
          objectPosition: `${(artwork.primaryImage.desktopFocalPoint?.x ?? 0.5) * 100}% ${(artwork.primaryImage.desktopFocalPoint?.y ?? 0.5) * 100}%`,
        }}
      />

      {/* Paper overlay canvas — erased by brush to reveal artwork */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        aria-hidden="true"
        style={{ display: 'block' }}
      />

      {/* Subtle gradient at bottom for typography legibility */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 h-2/5 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(10,10,9,0.65) 0%, rgba(10,10,9,0) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Hero typography */}
      <div
        className="absolute inset-0 z-30 flex flex-col justify-end"
        style={{ padding: 'var(--spacing-gutter)' }}
      >
        <div
          className="pb-8 md:pb-12 lg:pb-16"
          style={{
            transition: typoVisible
              ? 'opacity 1s var(--ease-reveal), transform 1s var(--ease-reveal)'
              : 'none',
            opacity: typoVisible ? 1 : 0,
            transform: typoVisible ? 'translateY(0)' : 'translateY(1.5rem)',
          }}
        >
          <p
            className="text-canvas/70 text-label text-xs tracking-widest mb-5 md:mb-6"
            style={{ letterSpacing: '0.22em' }}
          >
            Painter · Educator · Artist
          </p>
          <h1
            className="font-serif text-canvas font-light leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 12vw, 11rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Zlatica
          </h1>
          <div className="mt-8 md:mt-10">
            <Link
              href="/works"
              className="inline-flex items-center gap-3 text-canvas/80 hover:text-canvas transition-colors duration-200"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', letterSpacing: '0.14em' }}
            >
              <span className="text-label" style={{ textTransform: 'uppercase' }}>Explore works</span>
              <span aria-hidden="true" style={{ fontSize: '1rem' }}>↓</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue — appears when done */}
      {phase === 'done' && (
        <div
          className="absolute left-1/2 bottom-6 z-30 -translate-x-1/2"
          style={{
            animation: 'scrollCue 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          <div className="w-px h-10 bg-canvas/40 mx-auto" />
        </div>
      )}

      <style jsx>{`
        @keyframes scrollCue {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.9; transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </section>
  )
}
