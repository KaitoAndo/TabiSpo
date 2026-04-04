import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSpotEditClient from './AdminSpotEditClient'
import type { Spot } from '@/types/spot'

interface Props { params: Promise<{ id: string }> }

export default async function AdminSpotEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/admin/login')

  const { data: spot } = await supabase.from('spots').select('*').eq('id', id).single<Spot>()
  if (!spot) redirect('/admin/spots')

  return <AdminSpotEditClient spot={spot} />
}
