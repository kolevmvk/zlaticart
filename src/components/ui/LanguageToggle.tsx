'use client'

import { useLanguage } from '@/context/LanguageContext'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { locale, toggle } = useLanguage()

  return (
    <button
      onClick={toggle}
      aria-label={locale === 'sr' ? 'Switch to English' : 'Prebaci na srpski'}
      className={`font-sans text-[0.6rem] tracking-[0.22em] uppercase transition-opacity duration-200 inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-2 ${className}`}
      style={{ letterSpacing: '0.18em' }}
    >
      <span style={{ opacity: locale === 'sr' ? 1 : 0.35 }}>SR</span>
      <span style={{ opacity: 0.3, margin: '0 0.4em' }}>|</span>
      <span style={{ opacity: locale === 'en' ? 1 : 0.35 }}>EN</span>
    </button>
  )
}
