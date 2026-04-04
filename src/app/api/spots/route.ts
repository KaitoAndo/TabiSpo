import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  let query = supabase
    .from('spots')
    .select('*')
    .eq('is_active', true)
    // premium → standard → free の順で表示
    .order('plan', { ascending: false })
    .order('created_at', { ascending: true })

  const category = searchParams.get('category')
  if (category && category !== 'すべて') {
    query = query.eq('category', category)
  }

  const area = searchParams.get('area')
  if (area && area !== 'すべて') {
    query = query.eq('area', area)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data ?? [])
}
