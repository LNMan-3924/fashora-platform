import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import vi from '../locales/vi.json'

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('fashora_lang') : null
const defaultLang = savedLang || 'vi'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi }
    },
    lng: defaultLang,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  })

export const changeAppLanguage = (lang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fashora_lang', lang)
  }
  return i18n.changeLanguage(lang)
}

export default i18n
