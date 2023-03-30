import React, { useState, useEffect } from 'react'
import { StringTranslations } from '@crowdin/crowdin-api-client'
import { EN, languages } from '../../config/localisation/languages'
import { TranslationsContext } from './translationsContext'

const CACHE_KEY = 'pancakeSwapLanguage'

export interface LangType {
  code: string
  language: string
}

export interface LanguageState {
  selectedLanguage: LangType
  setSelectedLanguage: (langObject: LangType) => void
  translatedLanguage: LangType
  setTranslatedLanguage: React.Dispatch<React.SetStateAction<LangType>>
}

const LanguageContext = React.createContext({
  selectedLanguage: EN,
  setSelectedLanguage: () => undefined,
  translatedLanguage: EN,
  setTranslatedLanguage: () => undefined,
} as LanguageState)

const fileId = 8
const projectId = 0
const stringTranslationsApi = new StringTranslations({
  token: '',
})

const fetchTranslationsForSelectedLanguage = (selectedLanguage: any) => {
  return stringTranslationsApi.listLanguageTranslations(projectId, selectedLanguage.code, undefined, fileId, 200)
}

const LanguageContextProvider = ({ children }: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<any>(EN)
  const [translatedLanguage, setTranslatedLanguage] = useState<any>(EN)
  const [translations, setTranslations] = useState<Array<any>>([])

  const getStoredLang = (storedLangCode: string) => {
    return Object.values(languages).filter((language) => {
      return language.code === storedLangCode
    })[0]
  }

  useEffect(() => {
    const storedLangCode = localStorage.getItem(CACHE_KEY)
    if (storedLangCode) {
      const storedLang = getStoredLang(storedLangCode)
      setSelectedLanguage(storedLang)
    } else {
      setSelectedLanguage(EN)
    }
  }, [])

  useEffect(() => {
    if (selectedLanguage) {
      fetch(`./i18n/${selectedLanguage.code}.json`)
        .then((r) => r.json())
        // fetchTranslationsForSelectedLanguage(selectedLanguage)  Object.keys(translationApiResponse)
        .then((translationApiResponse) => {
          if (!translationApiResponse) {
            setTranslations(['error'])
          } else {
            setTranslations(translationApiResponse)
          }
        })
        .then(() => setTranslatedLanguage(selectedLanguage))
        .catch((e) => {
          console.error('ERROR')
          console.error(e)
          setTranslations(['error'])
        })
    }
  }, [selectedLanguage, setTranslations])

  const handleLanguageSelect = (langObject: LangType) => {
    setSelectedLanguage(langObject)
    localStorage.setItem(CACHE_KEY, langObject.code)
  }

  return (
    <LanguageContext.Provider
      value={{ selectedLanguage, setSelectedLanguage: handleLanguageSelect, translatedLanguage, setTranslatedLanguage }}
    >
      <TranslationsContext.Provider value={{ translations, setTranslations }}>{children}</TranslationsContext.Provider>
    </LanguageContext.Provider>
  )
}

export { LanguageContext, LanguageContextProvider }
