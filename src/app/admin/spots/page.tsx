import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'

const PLAN_STYLE = {
  premium:  { bg:'#fef3c7', color:'#92400e', label:'PR' },
  standard: { bg:'#dbeafe', color:'#1d4ed8', label:'STD' },
  free:     { bg:'#f3f4f6', color:'#6b7280', label:'FREE' },
} as const

export default async function AdminSpotsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/admin/login')

  const { data: spots } = await supabase
    .from('spots').select('*').order('plan', { ascending:false }).order('created_at')

  return (
    <div className="min-h-dvh" style={{ background:'#f5f0e8' }}>
      <div style={{ height:3, background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background:'linear-gradient(135deg,#0f0a05,#3c220c)' }}>
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard" className="text-sm" style={{ color:'rgba(196,168,112,0.7)' }}>← ダッシュボード</Link>
          <span className="font-bold text-sm" style={{ color:'#c4a870' }}>スポット管理</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background:'rgba(196,168,112,0.15)', color:'#c4a870' }}>
          {spots?.length ?? 0} 件
        </span>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-2 pb-8">
        {(spots as Spot[] ?? []).map(spot => {
          const ps = PLAN_STYLE[spot.plan as keyof typeof PLAN_STYLE] ?? PLAN_STYLE.free
          return (
            <div key={spot.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background:ps.bg, color:ps.color }}>{ps.label}</span>
                  <span className="text-[10px]" style={{ color:'#9ca3af' }}>{spot.category}</span>
                  <span className="text-[10px]" style={{ color:'#9ca3af' }}>/ {spot.area}</span>
                </div>
                <p className="text-sm font-bold" style={{ color:'#1c1006' }}>{spot.name}</p>
                <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{spot.sub}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={spot.is_active
                    ? { background:'#dcfce7', color:'#166534' }
                    : { background:'#fee2e2', color:'#991b1b' }}>
                  {spot.is_active ? '公開' : '非公開'}
                </span>
                <Link href={`/admin/spots/${spot.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ background:'#f0e8d8', color:'#8b5e3c' }}>編集</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
