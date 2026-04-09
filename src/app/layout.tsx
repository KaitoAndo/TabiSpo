import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  '旅スポ | TabiSpo',
    template: '%s | 旅スポ',
  },
  description: '旅行者向けのローカルマップアプリ「旅スポ」。香川県の観光・グルメ情報や周辺スポットをマップで探せる地域情報サイト。',
  keywords: ['旅スポ', 'TabiSpo', 'マップ', '地域情報', '香川', '観光'],
  openGraph: {
    type:     'website',
    locale:   'ja_JP',
    siteName: '旅スポ | TabiSpo',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

import { I18nProvider } from '@/lib/i18n'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-[family-name:var(--font-noto)] antialiased bg-stone-50 text-stone-900">
        <I18nProvider>
          <main className="min-h-screen pb-safe">
            {children}
          </main>
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  )
}
