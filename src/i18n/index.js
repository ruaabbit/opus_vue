import { createI18n } from 'vue-i18n'
import zhLocale from '../locales/zh.js'
import enLocale from '../locales/en.js'

// Import Element Plus locales
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

// Get saved language from localStorage, default to 'zh'
const getDefaultLanguage = () => {
  const saved = localStorage.getItem('app-language')
  return saved || 'zh'
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getDefaultLanguage(), // Set default language
  fallbackLocale: 'zh', // Fallback language
  messages: {
    zh: zhLocale,
    en: enLocale
  },
  globalInjection: true // Enable global $t
})

// Element Plus locale mapping
export const elementLocaleMap = {
  zh: zhCn,
  en: en
}

// Get current Element Plus locale
export const getElementLocale = () => {
  return elementLocaleMap[i18n.global.locale.value] || zhCn
}

// Switch language function
export const switchLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('app-language', locale)
  // Update document language attribute
  document.documentElement.lang = locale
}

// Get available languages
export const availableLanguages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export default i18n
