import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Shop } from '@/types/spot'
import UpgradeClient from './UpgradeClient'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/shop/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('plan')
    .eq('id', user.id)
    .single<Pick<Shop, 'plan'>>()

  const currentPlan = shop?.plan ?? 'free'

  return (
    <div className="min-h-dvh" style={{ background: '#f5f0e8' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg,#1c1006,#3c220c)' }}>
        <Link href="/shop/dashboard" className="text-sm" style={{ color: 'rgba(196,168,112,0.7)' }}>
          ← ダッシュボード
        </Link>
        <span className="font-bold text-sm" style={{ color: '#c4a870' }}>プランのアップグレード</span>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-12">
        <p className="text-center text-sm mb-6 mt-2" style={{ color: '#6b7280' }}>
          より多くのお客様に届くプランをお選びください
        </p>

        <UpgradeClient currentPlan={currentPlan} />
      </div>
    </div>
  )
}
