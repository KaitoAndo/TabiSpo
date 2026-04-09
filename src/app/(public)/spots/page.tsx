import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Spot } from '@/types/spot'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SpotsPage(props: PageProps) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const sort = searchParams.sort as string | undefined
  const tagFilter = searchParams.tag as string | undefined

  let query = supabase.from('spots').select('*').eq('is_active', true)

  if (sort === 'popular') {
    // 仮でplanがpremiumのものを上位に
    query = query.order('plan', { ascending: false })
  } else {
    // 新着順など（デフォルト）
    query = query.order('created_at', { ascending: false })
  }

  const { data } = await query
  let spots = (data ?? []) as Spot[]

  if (tagFilter) {
    // tagやareaの簡易フィルター
    spots = spots.filter(s => s.tag === tagFilter || s.category === tagFilter || s.area === tagFilter)
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32 font-sans">
      <header className="bg-white px-4 py-4 border-b border-stone-200 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">スポットを探す</h1>
        <button className="text-amber-600 font-medium text-sm">
          フィルター ⚙️
        </button>
      </header>

      {/* 簡易フィルターチップス */}
      <div className="bg-white px-4 py-3 border-b border-stone-200">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <Link href="/spots" className={`px-4 py-1.5 rounded-full border text-sm shrink-0 transition-colors ${!tagFilter ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-stone-600 border-stone-300 hover:bg-amber-50'}`}>
            すべて
          </Link>
          {['観光', '飲食', 'お土産', '温泉・宿', '絶品グルメ'].map(cat => (
            <Link key={cat} href={`/spots?tag=${encodeURIComponent(cat)}`} className={`px-4 py-1.5 rounded-full border text-sm shrink-0 transition-colors ${tagFilter === cat ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-stone-600 border-stone-300 hover:bg-amber-50'}`}>
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-stone-500 font-medium">{spots.length} 件見つかりました</p>
          <select className="text-sm border-none bg-transparent text-stone-600 font-medium outline-none">
            <option>おすすめ順</option>
            <option>人気順</option>
            <option>新着順</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spots.map(spot => (
            <Link key={spot.id} href={`/spots/${spot.id}`} className="flex bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-1/3 bg-stone-200 relative shrink-0">
                {/* プレースホルダー画像 */}
                <div className="absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  {spot.category === '観光' ? '⛩️' : spot.category === '飲食' ? '🍜' : '📍'}
                </div>
              </div>
              <div className="p-3 w-2/3 flex flex-col justify-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                    {spot.category}
                  </span>
                  {spot.area && <span className="text-[10px] text-stone-500">📍 {spot.area}</span>}
                </div>
                <h3 className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">{spot.name}</h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{spot.pr || spot.sub}</p>
              </div>
            </Link>
          ))}
        </div>
        
        {spots.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-medium">
            一致するスポットが見つかりませんでした。
          </div>
        )}
      </div>
    </div>
  )
}
