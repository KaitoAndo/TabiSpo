-- ============================================================
-- 旅スポ v2.0 マイグレーション
-- SNS/SEO設定および年額プラン対応
-- ============================================================

ALTER TABLE public.spots 
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS line_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS google_business_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}';

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly','annual')),
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
