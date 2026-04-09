import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/constants'
import type { Shop, Spot } from '@/types/spot'

const PLAN_BADGE = {
  free:     { label: '無料プラン',   bg: '#f3f4f6', color: '#6b7280' },
  standard: { label: 'スタンダード', bg: '#dbeafe', color: '#1d4ed8' },
  premium:  { label: 'プレミアム',   bg: '#fef3c7', color: '#92400e' },
} as const

const CAT_EMOJI: Record<string, string> = {
  '観光':'⛩️','飲食':'🍜','スイーツ':'🍡','体験':'🎭','お土産':'🎁','酒蔵':'🍶','温泉・宿':'♨️',
}

export default async function ShopDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/shop/login')

  const { data: shop } = await supabase
    .from('shops').select('*, spots(*)').eq('id', user.id)
    .maybeSingle<Shop & { spots: Spot | null }>()

  const spot = shop?.spots ?? null
  const plan = (shop?.plan ?? 'free') as keyof typeof PLANS
  const badge = PLAN_BADGE[plan]

  let favoritesCount = 0
  let checkInsCount = 0

  if (spot) {
    const [{ count: fCount }, { count: cCount }] = await Promise.all([
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('spot_id', spot.id),
      supabase.from('check_ins').select('*', { count: 'exact', head: true }).eq('spot_id', spot.id)
    ])
    favoritesCount = fCount ?? 0
    checkInsCount = cCount ?? 0
  }

  return (
    <div className="min-h-dvh" style={{ background: '#f5f0e8' }}>
      <div style={{ height:3, background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#1c1006,#3c220c)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">⛩️</span>
          <span className="font-bold text-sm" style={{ color:'#c4a870' }}>掲載店舗ダッシュボード</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs" style={{ color:'rgba(196,168,112,0.7)' }}>← マップを見る</Link>
          <form action="/api/auth/logout" method="POST">
            <button className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color:'rgba(196,168,112,0.8)', border:'1px solid rgba(196,168,112,0.25)' }}>
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
        {/* プランカード */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background:'rgba(139,94,60,0.06)', borderBottom:'1px solid #f0e8d8' }}>
            <p className="text-xs font-semibold" style={{ color:'#8b5e3c' }}>現在の掲載プラン</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background:badge.bg, color:badge.color }}>{badge.label}</span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold" style={{ color:'#1c1006' }}>{PLANS[plan].name}</p>
              <p className="text-sm mt-0.5" style={{ color:'#6b7280' }}>
                {plan === 'free' ? '基本情報を無料掲載中' : `月額 ¥${PLANS[plan].price.toLocaleString()} / 月`}
              </p>
            </div>
            {plan !== 'premium' && (
              <Link href="/shop/dashboard/upgrade"
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background:'#c4a870', color:'#1c1006' }}>
                アップグレード
              </Link>
            )}
          </div>
          {plan === 'free' && (
            <div className="px-5 py-3 text-xs leading-relaxed"
              style={{ background:'#fffbeb', color:'#92400e', borderTop:'1px solid #fef3c7' }}>
              💡 スタンダード（¥3,000/月）でPR文・タグ表示、プレミアム（¥10,000/月）で優先表示＋画像対応
            </div>
          )}
        </section>

        {/* 分析データ（モック） */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3" style={{ background:'rgba(139,94,60,0.06)', borderBottom:'1px solid #f0e8d8' }}>
            <p className="text-xs font-semibold" style={{ color:'#8b5e3c' }}>アクセス・集客状況 (今月)</p>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4 text-center divide-x divide-stone-100">
            <div>
              <p className="text-xs text-stone-500 mb-1">閲覧数</p>
              <p className="text-2xl font-bold text-stone-800">1,248</p>
              <p className="text-[10px] text-emerald-600 mt-1">↑ 12%</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">お気に入り</p>
              <p className="text-2xl font-bold text-stone-800">{favoritesCount}</p>
              <p className="text-[10px] text-stone-400 mt-1">-</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">チェックイン</p>
              <p className="text-2xl font-bold text-stone-800">{checkInsCount}</p>
              <p className="text-[10px] text-stone-400 mt-1">-</p>
            </div>
          </div>
          <div className="px-5 py-3 text-xs bg-stone-50 text-stone-500 text-center border-t border-stone-100">
            ※ プレミアムプランでは詳細な流入元分析が表示されます
          </div>
        </section>

        {/* スポット情報 */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background:'rgba(139,94,60,0.06)', borderBottom:'1px solid #f0e8d8' }}>
            <p className="text-xs font-semibold" style={{ color:'#8b5e3c' }}>掲載スポット情報</p>
            {spot && (
              <div className="flex items-center gap-3">
                <Link href="/shop/dashboard/settings"
                  className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: '#f5f0e8', color: '#8b5e3c' }}>
                  SNS・SEO・アカウント設定
                </Link>
                <Link href={`/shop/dashboard/spot/${spot.id}`}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: '#f5f0e8', color: '#8b5e3c' }}>
                  基本情報を編集 →
                </Link>
              </div>
            )}
          </div>
          {spot ? (
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background:'#f5f0e8' }}>{CAT_EMOJI[spot.category] ?? '📍'}</div>
                <div>
                  <p className="font-bold" style={{ color:'#1c1006' }}>{spot.name}</p>
                  <p className="text-sm mt-0.5" style={{ color:'#6b7280' }}>{spot.sub}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background:'#f0e8d8', color:'#8b5e3c' }}>{spot.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={spot.is_active
                        ? { background:'#dcfce7', color:'#166534' }
                        : { background:'#f3f4f6', color:'#6b7280' }}>
                      {spot.is_active ? '● 公開中' : '○ 非公開'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm pt-2" style={{ borderTop:'1px solid #f0e8d8' }}>
                {spot.hours  && <Row label="営業時間" value={spot.hours} />}
                {spot.closed && <Row label="定休日"   value={spot.closed} />}
                {spot.area   && <Row label="エリア"   value={spot.area} />}
              </div>
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm font-medium" style={{ color:'#374151' }}>スポットが未登録です</p>
              <p className="text-xs mt-1" style={{ color:'#9ca3af' }}>管理者にご連絡ください</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 w-16" style={{ color:'#9ca3af' }}>{label}</span>
      <span style={{ color:'#374151' }}>{value}</span>
    </div>
  )
}
