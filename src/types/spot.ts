export type SpotCategory = '観光' | '飲食' | 'スイーツ' | '体験' | 'お土産' | '酒蔵' | '温泉・宿'
export type PlanType = 'free' | 'standard' | 'premium'

export interface Spot {
  id: string
  name: string
  category: SpotCategory
  sub: string
  pr: string
  hours: string
  closed: string
  lat: number
  lng: number
  area: string
  image_url: string | null
  plan: PlanType
  tag: string | null
  is_active: boolean
  created_at: string

  // v2 fields
  instagram_url?: string | null
  twitter_url?: string | null
  tiktok_url?: string | null
  facebook_url?: string | null
  youtube_url?: string | null
  line_url?: string | null
  website_url?: string | null
  google_business_url?: string | null
  seo_title?: string | null
  meta_description?: string | null
  hashtags?: string[] | null
}

export interface Shop {
  id: string
  email: string
  name: string
  plan: PlanType
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  spot_id: string | null
  
  // v2 fields
  billing_cycle?: 'monthly' | 'annual'
  current_period_end?: string | null
}
