import { useContext } from 'react'
import { TranslationsContext } from '../contexts/Localisation/translationsContext'
import { getTranslation } from '../utils/translateTextHelpers'

const useI18n = () => {
  const { translations } = useContext(TranslationsContext)
  // console.log(translations)

  return (text: string, fallback: string) => {
    if (translations[0] === 'error') {
      return fallback
    }
    if (translations) {
      return getTranslation(translations, text, fallback)
    }
    return fallback
  }
}

export default useI18n
