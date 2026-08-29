'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface ParallaxImageProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  quality?: number
  objectPosition?: string
  magnitude?: number // yPercent delta each direction (default 12)
}

/**
 * Image with GSAP ScrollTrigger parallax — scrubs -magnitude% to +magnitude% as the section traverses the viewport.
 * The container must have overflow:hidden and a fixed aspect ratio set by the parent.
 */
export default function ParallaxImage({
  src,
  alt,
  sizes,
  priority = false,
  quality = 85,
  objectPosition = 'center',
  magnitude = 12,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!containerRef.current || !imgRef.current) return

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        gsap.fromTo(
          imgRef.current,
          { yPercent: magnitude },
          {
            yPercent: -magnitude,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          }
        )
      })
    })

    return () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll()
          .filter((t) => t.trigger === containerRef.current)
          .forEach((t) => t.kill())
      })
    }
  }, [magnitude])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div
        ref={imgRef}
        className="absolute inset-0"
        // Extend the image slightly beyond bounds to allow parallax movement
        style={{ top: `-${magnitude}%`, bottom: `-${magnitude}%` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
    </div>
  )
}
