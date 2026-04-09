import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import Header from '@/components/Header'
import TopPageClient from '@/components/TopPageClient'

export default async function TopPage() {
  const supabase = await createClient()

  const { data: spotsData } = await supabase
    .from('spots')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const spots = (spotsData ?? []) as Spot[]
  const popularSpots = spots.slice(0, 4)

  return (
    <div className="relative flex flex-col min-h-screen font-sans">
      <Header />
      <TopPageClient popularSpots={popularSpots} />
    </div>
  )
}
