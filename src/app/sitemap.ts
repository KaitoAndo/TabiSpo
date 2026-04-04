import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id, created_at')
    .eq('is_active', true)

  const spotEntries: MetadataRoute.Sitemap = (spots ?? []).map(spot => ({
    url:          `${appUrl}/spots/${spot.id}`,
    lastModified: spot.created_at ? new Date(spot.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority:     0.7,
  }))

  return [
    {
      url:             `${appUrl}/`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${appUrl}/apply`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    ...spotEntries,
  ]
}
