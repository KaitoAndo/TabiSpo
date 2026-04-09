# 旅スポ (TabiSpo) v2.0 実装計画

## 実装要件のサマリ
1. **データベース改修 (Supabase)**
   - `spots`テーブルにSNS URL（8種）、SEOメタデータ、ハッシュタグを追加。
   - `shops`テーブルに課金サイクル（月/年）の情報を追加。
2. **S-05: SNS・SEO設定画面の新規追加**
3. **S-04: 料金プラン画面の大幅改修** (月額/年額決済対応)
4. **P-02: スポット詳細画面の改修** (SEO生成、SNSアイコン表示、JSON-LD埋め込み)
5. **バックエンド・API** (Stripe決済用API、Webhook対応)

## 対象ファイル・変更定義
- `supabase/migrations/003_v2_sns_seo.sql` (新規マイグレーション)
- `src/app/spots/[id]/page.tsx` (P-02 修正)
- `src/app/admin/dashboard/upgrade/page.tsx` (S-04 修正)
- `src/app/admin/settings/page.tsx` (S-05 新規作成)
- `src/app/api/stripe/checkout/route.ts` (API 修正)
- `src/app/api/stripe/webhook/route.ts` (API 修正)
