import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/admin/login')

  // 統計データ取得
  const [{ count: totalSpots }, { count: activeSpots }, { count: totalShops }, { data: planStats }] =
    await Promise.all([
      supabase.from('spots').select('*', { count:'exact', head:true }),
      supabase.from('spots').select('*', { count:'exact', head:true }).eq('is_active', true),
      supabase.from('shops').select('*', { count:'exact', head:true }),
      supabase.from('spots').select('plan').eq('is_active', true),
    ])

  const plans = (planStats ?? []) as { plan: string }[]
  const premiumCount  = plans.filter(p => p.plan === 'premium').length
  const standardCount = plans.filter(p => p.plan === 'standard').length
  const freeCount     = plans.filter(p => p.plan === 'free').length

  return (
    <div className="min-h-dvh" style={{ background:'#f5f0e8' }}>
      <div style={{ height:3, background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#0f0a05,#3c220c)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🏯</span>
          <span className="font-bold text-sm" style={{ color:'#c4a870' }}>運営管理ダッシュボード</span>
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

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">

        {/* 統計カード */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'総スポット数', value:totalSpots ?? 0, icon:'📍', link:'/admin/spots' },
            { label:'公開中スポット', value:activeSpots ?? 0, icon:'✅', link:'/admin/spots' },
            { label:'掲載店舗数', value:totalShops ?? 0, icon:'🏪', link:'/admin/shops' },
            { label:'有料プラン', value:premiumCount + standardCount, icon:'💰', link:'/admin/shops' },
          ].map(({ label, value, icon, link }) => (
            <Link key={label} href={link}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1 active:scale-95 transition-transform">
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-bold" style={{ color:'#1c1006' }}>{value}</p>
              <p className="text-xs" style={{ color:'#9ca3af' }}>{label}</p>
            </Link>
          ))}
        </div>

        {/* プラン内訳 */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <SectionTitle>プラン内訳</SectionTitle>
          <div className="p-4 space-y-2">
            {[
              { label:'プレミアム', count:premiumCount,  bg:'#fef3c7', color:'#92400e' },
              { label:'スタンダード', count:standardCount, bg:'#dbeafe', color:'#1d4ed8' },
              { label:'無料',       count:freeCount,     bg:'#f3f4f6', color:'#6b7280' },
            ].map(({ label, count, bg, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full w-20 text-center"
                  style={{ background:bg, color }}>{label}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${totalSpots ? (count / (totalSpots as number)) * 100 : 0}%`, background:color }} />
                </div>
                <span className="text-sm font-bold w-6 text-right" style={{ color:'#374151' }}>{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* クイックリンク */}
        <div className="grid grid-cols-2 gap-3">
          <NavCard href="/admin/spots" icon="📋" title="スポット管理" desc="一覧・編集・公開切替" />
          <NavCard href="/admin/shops" icon="🏪" title="店舗アカウント管理" desc="プラン・連絡先の確認" />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 text-xs font-semibold"
      style={{ background:'rgba(139,94,60,0.06)', color:'#8b5e3c', borderBottom:'1px solid #f0e8d8' }}>
      {children}
    </div>
  )
}

function NavCard({ href, icon, title, desc }: { href:string; icon:string; title:string; desc:string }) {
  return (
    <Link href={href}
      className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1 active:scale-95 transition-transform">
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-bold mt-1" style={{ color:'#1c1006' }}>{title}</p>
      <p className="text-xs" style={{ color:'#9ca3af' }}>{desc}</p>
    </Link>
  )
}
