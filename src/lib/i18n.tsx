'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'ja' | 'en'

interface I18nContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  ja: {
    'nav.home': 'ホーム',
    'nav.map': 'マップ',
    'nav.schedules': 'スケジュール',
    'nav.mypage': 'マイページ',
    'header.login': 'ログイン',
    'header.signup': '登録する',
    'top.hero.title_main': 'あなただけの',
    'top.hero.title_sub': '名スポットを探そう',
    'top.hero.desc': '歴史ある名所から最新のトレンドまで。\\n定番じゃない、あなたにぴったりの旅が見つかります。',
    'top.hero.button': '🗺️ マップを開く',
    'top.cat.title': '気分はどちら？',
    'top.cat.desc': '気になるジャンルから探す',
    'top.spot.title': '今、注目のスポット ✨',
    'top.spot.more': 'すべて見る',
  },
  en: {
    'nav.home': 'Home',
    'nav.map': 'Map',
    'nav.schedules': 'Plan',
    'nav.mypage': 'Profile',
    'header.login': 'Log in',
    'header.signup': 'Sign up',
    'top.hero.badge': 'New Experience',
    'top.hero.title_main': 'Find Your',
    'top.hero.title_sub': 'Hidden Gems',
    'top.hero.desc': 'From historic sights to latest trends.\\nDiscover the perfect trip just for you.',
    'top.hero.button': '🗺️ Open Map',
    'top.cat.title': 'What\'s your mood?',
    'top.cat.desc': 'Find by category',
    'top.spot.title': 'Trending Now ✨',
    'top.spot.more': 'View All',
  }
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja')

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
