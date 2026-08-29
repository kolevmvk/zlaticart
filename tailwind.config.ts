import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A09',
        canvas: '#F0EDE6',
        'ink-muted': '#3A3A38',
        'canvas-warm': '#E8E4DB',
        'canvas-deep': '#D8D3C8',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'display': '0.25em',
        'brand': '0.35em',
      },
      height: {
        svh: '100svh',
      },
      minHeight: {
        svh: '100svh',
      },
      transitionTimingFunction: {
        'art': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'reveal': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config
