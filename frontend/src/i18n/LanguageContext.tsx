import { createContext, ReactNode, useContext, useState } from 'react'

export type Language = 'en' | 'zh'

interface LanguageContextValue {
  language: Language
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en')

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}



