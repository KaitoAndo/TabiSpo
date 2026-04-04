import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'こんぴらタウンMAP',
    template: '%s | こんぴらタウンMAP',
  },
  description: '香川県琴平町の観光・グルメ・お土産情報。金刀比羅宮周辺のスポットをマップで探せる地域情報サイト。',
  keywords: ['琴平', 'こんぴら', '金刀比羅宮', '香川', '観光', 'うどん', '骨付鳥'],
  openGraph: {
    type:     'website',
    locale:   'ja_JP',
    siteName: 'こんぴらタウンMAP',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-[family-name:var(--font-noto)] antialiased">
        {children}
      </body>
    </html>
  )
}
