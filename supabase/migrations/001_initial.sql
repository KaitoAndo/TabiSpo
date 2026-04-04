-- ============================================================
-- こんぴらタウンMAP — 初期マイグレーション
-- Supabase SQL Editor で実行してください
-- ============================================================

-- ============================================================
-- 1. spots テーブル
-- ============================================================
create table if not exists public.spots (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  category    text        not null,
  sub         text,
  pr          text,
  hours       text,
  closed      text,
  lat         float8      not null,
  lng         float8      not null,
  area        text,
  image_url   text,
  plan        text        not null default 'free'
                check (plan in ('free', 'standard', 'premium')),
  tag         text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 2. shops テーブル（掲載店舗アカウント）
-- ============================================================
create table if not exists public.shops (
  id                     uuid        primary key references auth.users on delete cascade,
  email                  text        not null,
  name                   text,
  plan                   text        not null default 'free'
                           check (plan in ('free', 'standard', 'premium')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  spot_id                uuid        references public.spots on delete set null,
  created_at             timestamptz not null default now()
);

-- ============================================================
-- 3. RLS 有効化
-- ============================================================
alter table public.spots enable row level security;
alter table public.shops enable row level security;

-- ============================================================
-- 4. spots RLS ポリシー
-- ============================================================

-- 全員がアクティブなスポットを参照可
create policy "spots_select_public"
  on public.spots for select
  using (is_active = true);

-- 自分の shop に紐づく spot のみ更新可
create policy "spots_update_owner"
  on public.spots for update
  using (
    exists (
      select 1 from public.shops
      where shops.id = auth.uid()
        and shops.spot_id = spots.id
    )
  );

-- 自分の shop に紐づく spot のみ削除可
create policy "spots_delete_owner"
  on public.spots for delete
  using (
    exists (
      select 1 from public.shops
      where shops.id = auth.uid()
        and shops.spot_id = spots.id
    )
  );

-- 認証済みユーザーのみ INSERT 可（管理者が登録）
create policy "spots_insert_authenticated"
  on public.spots for insert
  with check (auth.role() = 'authenticated');

-- ============================================================
-- 5. shops RLS ポリシー
-- ============================================================

-- 自分のレコードのみ参照可
create policy "shops_select_self"
  on public.shops for select
  using (auth.uid() = id);

-- 自分のレコードのみ更新可
create policy "shops_update_self"
  on public.shops for update
  using (auth.uid() = id);

-- ============================================================
-- 6. インデックス
-- ============================================================
create index if not exists spots_category_idx  on public.spots (category);
create index if not exists spots_area_idx      on public.spots (area);
create index if not exists spots_plan_idx      on public.spots (plan);
create index if not exists spots_is_active_idx on public.spots (is_active);

-- ============================================================
-- 7. 初期スポットデータ（琴平町 10件）
-- ============================================================
insert into public.spots
  (name, category, sub, pr, hours, closed, lat, lng, area, image_url, plan, tag, is_active)
values
  (
    '金刀比羅宮', '観光', '785段の石段・海の神様',
    'こんぴらさんとして親しまれる讃岐最大の聖地。本宮まで785段、奥社まで1,368段の石段が続く。',
    '参拝自由（社務所 8:30〜17:00）', '年中無休',
    34.18620, 133.82190, '表参道', null, 'premium', '入場無料', true
  ),
  (
    '焼鳥 骨付鳥 田中屋', '飲食', 'さぬき名物 骨付鳥',
    '参道口の骨付鳥名店。ガーリックとスパイスが効いた絶品骨付鳥と地酒悦凱陣。',
    '11:30〜14:00 / 17:00〜22:00', '不定休',
    34.18430, 133.82130, '表参道', null, 'premium', '人気', true
  ),
  (
    'こんぴらプリン', 'スイーツ', 'プリン・テイクアウト',
    'レモンジュレとジュースボールのせた映えスイーツ。',
    '9:00〜17:30', '不定休',
    34.18460, 133.82180, '表参道', null, 'premium', '映え', true
  ),
  (
    '中野うどん学校 琴平校', '体験', '讃岐うどん手打ち体験',
    '讃岐うどんの手打ち体験。修了証発行あり。',
    '9:00〜17:00（要予約）', '不定休',
    34.18380, 133.82220, '表参道', null, 'premium', '体験', true
  ),
  (
    'ことひら温泉 琴参閣', '温泉・宿', '温泉旅館',
    '金刀比羅宮に程近い温泉宿。讃岐の食材と温泉。',
    'チェックイン 15:00〜', '年中無休',
    34.18750, 133.82320, '奥参道', null, 'free', null, true
  ),
  (
    '丸尾本店（悦凱陣）', '酒蔵', '地酒・酒蔵',
    '老舗酒造。個性豊かな地酒「悦凱陣」。',
    '9:00〜18:00', '日曜・祝日',
    34.18300, 133.82350, '琴平駅前', null, 'free', null, true
  ),
  (
    'こんぴらしょうゆ豆本舗', 'お土産', '郷土食品・土産物',
    '香川の伝統食しょうゆ豆の専門店。うどんソフトも。',
    '8:30〜17:30', '年中無休',
    34.18410, 133.82150, '表参道', null, 'free', null, true
  ),
  (
    '焼肉 田中', '飲食', '黒毛和牛・焼肉',
    '骨付鳥田中屋グループの焼肉店。ランチ¥600〜。',
    '11:00〜14:00 / 17:00〜22:00', '不定休',
    34.18260, 133.82380, '琴平駅前', null, 'premium', '新店', true
  ),
  (
    'おがわうどん', '飲食', '讃岐うどん',
    'コシのある麺と透き通る出汁。釜あげうどんが人気。',
    '10:00〜15:00', '水曜',
    34.18360, 133.82280, '琴平駅前', null, 'free', null, true
  ),
  (
    '金刀比羅宮 宝物館', '観光', '美術館・博物館',
    '円山応挙など江戸絵画の名品。入館料一般800円。',
    '8:30〜17:00', '年中無休',
    34.18560, 133.82250, '奥参道', null, 'free', null, true
  );
