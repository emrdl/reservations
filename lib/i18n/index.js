import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  tr: {
    translation: {
      dashboard: 'Dashboard',
      calendar: 'Takvim',
      tables: 'Masa Düzeni',
      menu: 'Menü',
      orders: 'Siparişler',
      // ... diğer çeviriler
    }
  },
  en: {
    translation: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      tables: 'Table Layout',
      menu: 'Menu',
      orders: 'Orders',
      // ... diğer çeviriler
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n 