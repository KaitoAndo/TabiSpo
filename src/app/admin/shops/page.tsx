import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Shop } from '@/types/spot'

const PLAN_STYLE = {
  premium:  { bg:'#fef3c7', color:'#92400e' },
  standard: { bg:'#dbeafe', color:'#1d4ed8' },
  free:     { bg:'#f3f4f6', color:'#6b7280' },
} as const

export default async function AdminShopsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/admin/login')

  const { data: shops } = await supabase
    .from('shops').select('*').order('created_at', { ascending:false })

  return (
    <div className="min-h-dvh" style={{ background:'#f5f0e8' }}>
      <div style={{ height:3, background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#0f0a05,#3c220c)' }}>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard" className="text-sm" style={{ color:'rgba(196,168,112,0.7)' }}>← ダッシュボード</Link>
          <span className="font-bold text-sm" style={{ color:'#c4a870' }}>掲載店舗アカウント管理</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background:'rgba(196,168,112,0.15)', color:'#c4a870' }}>
          {shops?.length ?? 0} 件
        </span>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-2 pb-8">
        {(shops as Shop[] ?? []).map(shop => {
          const ps = PLAN_STYLE[shop.plan as keyof typeof PLAN_STYLE] ?? PLAN_STYLE.free
          return (
            <div key={shop.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background:ps.bg, color:ps.color }}>{shop.plan}</span>
                    {shop.spot_id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                        スポット連携済
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold" style={{ color:'#1c1006' }}>{shop.name || '（店舗名未設定）'}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{shop.email}</p>
                </div>
                {shop.spot_id && (
                  <Link href={`/admin/spots/${shop.spot_id}`}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background:'#f0e8d8', color:'#8b5e3c' }}>
                    スポット編集
                  </Link>
                )}
              </div>
              {shop.stripe_subscription_id && (
                <p className="text-[10px] mt-2 font-mono" style={{ color:'#9ca3af' }}>
                  sub: {shop.stripe_subscription_id}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
