import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import SpotActions from '@/components/SpotActions'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: spot } = await supabase
    .from('spots')
    .select('name, pr, sub, image_url, category, seo_title, meta_description, hashtags')
    .eq('id', id)
    .eq('is_active', true)
    .single<Partial<Spot>>()

  if (!spot) return {}

  const description = spot.meta_description
    ? spot.meta_description
    : spot.pr

    ? `${spot.pr}`.slice(0, 120)
    : spot.sub
      ? `${spot.sub} — 香川県琴平町`
      : `${spot.name}の詳細情報 — 旅スポ`

  const ogImage = spot.image_url
    ? { url: spot.image_url, width: 1200, height: 630, alt: spot.name }
    : { url: '/og-image.png',  width: 1200, height: 630 }

  return {
    title:       spot.seo_title || spot.name,
    description,
    openGraph: {
      title:       spot.seo_title || spot.name,
      description,
      images:      [ogImage],
      type:        'article',
      locale:      'ja_JP',
      siteName:    '旅スポ',
    },
    twitter: { card: 'summary_large_image', title: spot.seo_title || spot.name, description },
  }
}

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: spot } = await supabase
    .from('spots')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single<Spot>()

  if (!spot) notFound()

  const SNS_LINKS = [
    { url: spot.instagram_url, icon: '📸' },
    { url: spot.twitter_url, icon: '𝕏' },
    { url: spot.tiktok_url, icon: '▶' },
    { url: spot.facebook_url, icon: '📘' },
    { url: spot.youtube_url, icon: '📺' },
    { url: spot.line_url, icon: '💬' },
    { url: spot.website_url, icon: '🌐' },
    { url: spot.google_business_url, icon: '🗺' },
  ].filter(l => l.url)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TouristAttraction'],
    name: spot.name,
    image: spot.image_url,
    description: spot.meta_description || spot.pr || spot.sub,
    address: {
      '@type': 'PostalAddress',
      addressLocality: '香川県',
      streetAddress: spot.area,
    },
    sameAs: SNS_LINKS.map(l => l.url)
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm">
        <Link
          href="/"
          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
        >
          ← 地図に戻る
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-sm font-bold text-gray-900 truncate">{spot.name}</h1>
      </header>

      {/* サムネイル */}
      <div className="w-full h-52 bg-gray-200 overflow-hidden">
        {spot.image_url ? (
          <Image
            src={spot.image_url}
            alt={spot.name}
            width={800}
            height={208}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {spot.category === '観光' ? '⛩️'
              : spot.category === '飲食' ? '🍜'
              : spot.category === 'スイーツ' ? '🍡'
              : spot.category === '体験' ? '🎭'
              : spot.category === 'お土産' ? '🎁'
              : spot.category === '酒蔵' ? '🍶'
              : '♨️'}
          </div>
        )}
      </div>

      {/* 詳細カード */}
      <div className="p-4 space-y-4">
        {/* タイトルエリア */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              {spot.category}
            </span>
            {spot.plan === 'premium' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                PR
              </span>
            )}
            {spot.tag && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                {spot.tag}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{spot.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{spot.sub}</p>
          {spot.pr && (
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{spot.pr}</p>
          )}
          {spot.hashtags && spot.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {spot.hashtags.map(tag => (
                <span key={tag} className="text-[11px] font-semibold text-[#8b5e3c] bg-[#f0e8d8] px-2 py-0.5 rounded-md shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* アクションボタン (お気に入り, チェックイン) */}
        <SpotActions spotId={spot.id} />

        {/* 基本情報 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-800">基本情報</h3>
          <InfoRow label="営業時間" value={spot.hours} />
          <InfoRow label="定休日" value={spot.closed} />
          <InfoRow label="エリア" value={spot.area} />
        </div>

        {/* 公式SNS・リンク */}
        {SNS_LINKS.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2">公式リンク・SNS</h3>
            <div className="flex gap-4 flex-wrap">
              {SNS_LINKS.map(l => (
                <a key={l.icon} href={l.url!} target="_blank" rel="noopener noreferrer" className="text-3xl hover:scale-110 transition-transform">
                  {l.icon}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Googleマップリンク */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl text-sm transition-colors"
        >
          📍 Google マップで開く
        </a>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 text-sm">
      <span className="shrink-0 w-20 text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  )
}
