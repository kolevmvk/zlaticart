'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, type Locale, type Translations } from '@/lib/i18n/translations'

interface LanguageContextValue {
  locale: Locale
  t: Translations
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'sr',
  t: translations.sr,
  toggle: () => {},
})

const STORAGE_KEY = 'zlaticart-lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('sr')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored === 'sr' || stored === 'en') setLocale(stored)
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === 'sr' ? 'en' : 'sr'
      try { localStorage.setItem(STORAGE_KEY, next) } catch {}
      return next
    })
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale] as Translations, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
