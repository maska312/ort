'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, t, Translations } from '@/lib/i18n/quiz'

type LangContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
  tr: Translations
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    const saved = localStorage.getItem('ort-lang') as Lang | null
    if (saved && (saved === 'ru' || saved === 'ky')) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('ort-lang', newLang)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const context = useContext(LangContext)
  if (!context) {
    throw new Error('useLang must be used within a LangProvider')
  }
  return context
}
