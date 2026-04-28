import { ref } from 'vue'
import { messages } from '../i18n/messages'

const STORAGE_KEY = 'app-locale'
const initialLocale = localStorage.getItem(STORAGE_KEY)
const locale = ref(initialLocale === 'en' ? 'en' : 'es')

function setLocale(nextLocale) {
  locale.value = nextLocale === 'en' ? 'en' : 'es'
  localStorage.setItem(STORAGE_KEY, locale.value)
  document.documentElement.lang = locale.value
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

function t(key) {
  const current = getNestedValue(messages[locale.value], key)
  if (current !== undefined) return current

  const fallback = getNestedValue(messages.es, key)
  if (fallback !== undefined) return fallback

  return key
}

// Sync html lang once at module load.
document.documentElement.lang = locale.value

export function useI18n() {
  return {
    locale,
    setLocale,
    t
  }
}
