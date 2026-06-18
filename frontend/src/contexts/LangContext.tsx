import { createContext, useContext, useState, ReactNode } from 'react'
import { Lang, t as translate, TKey } from '../lib/i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextType>({ lang: 'ru', setLang: () => {} })

const STORAGE_KEY = 'mentoria_lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved as Lang) || 'ru'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext)
  const t = (key: TKey, vars?: Record<string, string>) => translate(key, lang, vars)
  return { lang, setLang, t }
}
