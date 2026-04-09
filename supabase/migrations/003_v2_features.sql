-- ============================================================
-- 旅スポ v2.0 マイグレーション (Phase 2: 拡張機能・UI連携用)
-- ============================================================

-- 1. profiles テーブル（全ユーザーの基本情報・権限管理）
create table if not exists public.profiles (
  id          uuid        primary key references auth.users on delete cascade,
  role        text        not null default 'traveler' check (role in ('traveler', 'shop_admin', 'site_admin')),
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- auth.users作成時に自動でprofilesを作成するトリガー
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', 'traveler');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. favorites テーブル（お気に入り）
create table if not exists public.favorites (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  spot_id     uuid        not null references public.spots(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, spot_id)
);

-- 3. reviews テーブル（レビュー）
create table if not exists public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  spot_id     uuid        not null references public.spots(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  rating      integer     not null check (rating between 1 and 5),
  comment     text,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4. schedules テーブル（旅行スケジュール定義）
create table if not exists public.schedules (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  date        date,       -- 日帰りなどを想定
  created_at  timestamptz not null default now()
);

-- 4-1. schedule_spots テーブル（スケジュール内のスポット）
create table if not exists public.schedule_spots (
  id          uuid        primary key default gen_random_uuid(),
  schedule_id uuid        not null references public.schedules(id) on delete cascade,
  spot_id     uuid        not null references public.spots(id) on delete cascade,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- 5. check_ins テーブル（チェックイン履歴）
create table if not exists public.check_ins (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  spot_id     uuid        not null references public.spots(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 6. badges テーブル（バッジマスタ）
create table if not exists public.badges (
  id          text        primary key, -- 例: 'first_visit', 'onsen_master'
  name        text        not null,
  description text,
  icon        text,
  created_at  timestamptz not null default now()
);

-- 6-1. user_badges テーブル（ユーザー獲得バッジ）
create table if not exists public.user_badges (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  badge_id    text        not null references public.badges(id) on delete cascade,
  awarded_at  timestamptz not null default now(),
  unique(user_id, badge_id)
);

-- 7. coupons テーブル（店舗ごとのクーポン）
create table if not exists public.coupons (
  id          uuid        primary key default gen_random_uuid(),
  shop_id     uuid        not null references public.shops(id) on delete cascade,
  title       text        not null,
  description text,
  expires_at  timestamptz,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- 8. reports テーブル（通報・モデレーション）
create table if not exists public.reports (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  target_type text        not null check (target_type in ('review', 'spot', 'user')),
  target_id   uuid        not null,
  reason      text        not null,
  status      text        not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- RLS 設定 (Row Level Security)
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.favorites      enable row level security;
alter table public.reviews        enable row level security;
alter table public.schedules      enable row level security;
alter table public.schedule_spots enable row level security;
alter table public.check_ins      enable row level security;
alter table public.badges         enable row level security;
alter table public.user_badges    enable row level security;
alter table public.coupons        enable row level security;
alter table public.reports        enable row level security;

-- profiles: 誰でも参照可、更新は本人のみ
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- favorites: 本人のみ参照・追加・削除
create policy "favorites_select_self" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_self" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_self" on public.favorites for delete using (auth.uid() = user_id);

-- reviews: 誰でも参照可、追加・更新・削除は本人のみ
create policy "reviews_select_public" on public.reviews for select using (true);
create policy "reviews_insert_authenticated" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_self" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_self" on public.reviews for delete using (auth.uid() = user_id);

-- schedules & schedule_spots: 本人のみ
create policy "schedules_all_self" on public.schedules for all using (auth.uid() = user_id);
create policy "schedule_spots_all_self" on public.schedule_spots for all using (
  exists (
    select 1 from public.schedules s where s.id = schedule_spots.schedule_id and s.user_id = auth.uid()
  )
);

-- check_ins: 参照は本人（または集計用の別API）、追加は本人のみ
create policy "check_ins_select_self" on public.check_ins for select using (auth.uid() = user_id);
create policy "check_ins_insert_self" on public.check_ins for insert with check (auth.uid() = user_id);

-- badges: 誰でも参照可 (マスタ等)
create policy "badges_select_public" on public.badges for select using (true);
create policy "user_badges_select_public" on public.user_badges for select using (true); -- 誰が何を獲得したか公開する場合

-- coupons: 公開中ものは誰でも参照可、自店舗のもののみ更新可
create policy "coupons_select_active" on public.coupons for select using (is_active = true);
create policy "coupons_all_owner" on public.coupons for all using (auth.uid() = shop_id);

-- reports: 本人のみ追加可、参照はサイト管理（RP等で処理）
create policy "reports_insert_authenticated" on public.reports for insert with check (auth.uid() = user_id);
