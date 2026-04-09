import { createClient } from '@/lib/supabase/server'
import MapPage from '@/components/MapPage'
import type { Spot } from '@/types/spot'

export default async function Page() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('spots')
    .select('*')
    .eq('is_active', true)
    .order('plan', { ascending: false })   // premium → standard → free

  return <MapPage initialSpots={(data ?? []) as Spot[]} />
}
