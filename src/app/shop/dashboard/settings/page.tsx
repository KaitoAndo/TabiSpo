'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Spot, Shop } from '@/types/spot'

type Tab = 'sns' | 'seo' | 'account'

export default function SettingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('sns')
  const [spotId, setSpotId] = useState<string | null>(null)
  
  // Data State
  const [form, setForm] = useState<Partial<Spot>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Load Data
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push('/shop/login')
      
      supabase.from('shops').select('*, spots(*)').eq('id', user.id).single().then(({ data: shopData }) => {
        if (shopData?.spots) {
          setSpotId(shopData.spots.id)
          setForm(shopData.spots)
        }
        setLoading(false)
      })
    })
  }, [router])

  const set = (key: keyof Spot, val: any) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotId) return
    setSaving(true)
    try {
      const { error } = await createClient()
        .from('spots')
        .update({
          instagram_url: form.instagram_url || null,
          twitter_url: form.twitter_url || null,
          tiktok_url: form.tiktok_url || null,
          facebook_url: form.facebook_url || null,
          youtube_url: form.youtube_url || null,
          line_url: form.line_url || null,
          website_url: form.website_url || null,
          google_business_url: form.google_business_url || null,
          seo_title: form.seo_title || null,
          meta_description: form.meta_description || null,
          hashtags: form.hashtags || [],
        })
        .eq('id', spotId)

      if (error) throw error
      setToast({ msg: '保存しました', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (err: any) {
      setToast({ msg: err.message || '保存エラー', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-dvh flex items-center justify-center bg-[#f5f0e8] text-[#8b5e3c]">読み込み中…</div>

  return (
    <div className="min-h-dvh pb-24" style={{ background: '#f5f0e8' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #7a4e20, #e8c860, #c4a240, #e8c860, #7a4e20)' }} />
      <header className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1c1006, #3c220c)' }}>
        <button onClick={() => router.back()} className="text-[13px] font-medium" style={{ color: '#c4a870' }}>← ダッシュボード</button>
        <span className="font-bold text-[13px] text-white">設定</span>
      </header>

      <div className="max-w-lg mx-auto p-4">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 mb-5 shadow-sm border border-[#e8c860]/30">
          <TabButton active={tab === 'sns'} onClick={() => setTab('sns')}>SNS・リンク</TabButton>
          <TabButton active={tab === 'seo'} onClick={() => setTab('seo')}>SEO設定</TabButton>
          <TabButton active={tab === 'account'} onClick={() => setTab('account')}>アカウント</TabButton>
        </div>

        <form id="settings-form" onSubmit={handleSave} className="space-y-4">
          
          {/* SNS タブ */}
          {tab === 'sns' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <SectionTitle>SNS・外部リンク設定</SectionTitle>
              <div className="p-4 space-y-3">
                <Field label="Instagram URL" icon="📸">
                  <input type="url" value={form.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." className={inputCls} />
                </Field>
                <Field label="X (Twitter) URL" icon="𝕏">
                  <input type="url" value={form.twitter_url || ''} onChange={e => set('twitter_url', e.target.value)} placeholder="https://x.com/..." className={inputCls} />
                </Field>
                <Field label="TikTok URL" icon="▶">
                  <input type="url" value={form.tiktok_url || ''} onChange={e => set('tiktok_url', e.target.value)} placeholder="https://tiktok.com/..." className={inputCls} />
                </Field>
                <Field label="Facebook URL" icon="📘">
                  <input type="url" value={form.facebook_url || ''} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." className={inputCls} />
                </Field>
                <Field label="YouTube URL" icon="📺">
                  <input type="url" value={form.youtube_url || ''} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." className={inputCls} />
                </Field>
                <Field label="LINE公式 URL" icon="💬">
                  <input type="url" value={form.line_url || ''} onChange={e => set('line_url', e.target.value)} placeholder="https://line.me/..." className={inputCls} />
                </Field>
                <Field label="公式ウェブサイト" icon="🌐">
                  <input type="url" value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} placeholder="https://..." className={inputCls} />
                </Field>
                <Field label="Googleビジネス" icon="🗺">
                  <input type="url" value={form.google_business_url || ''} onChange={e => set('google_business_url', e.target.value)} placeholder="https://maps.google.com/..." className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* SEO タブ */}
          {tab === 'seo' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <SectionTitle>SEO・検索プレビュー</SectionTitle>
              <div className="p-4 space-y-4 text-sm text-[#374151]">
                <p>Google検索結果に表示されるタイトルと説明文を設定します。（スタンダードプラン以上で有効化されます）</p>

                {/* プレビュー */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-2">
                  <p className="text-xs text-gray-500 mb-1">Google 検索プレビュー</p>
                  <p className="text-[#006621] text-[11px] truncate">{form.website_url || 'https://tabispo.com/spots/...'}</p>
                  <p className="text-[#1a73e8] text-base font-medium truncate group-hover:underline">{(form.seo_title || form.name) ?? '未設定'}</p>
                  <p className="text-[#545454] text-[12px] leading-relaxed mt-1 line-clamp-2">{(form.meta_description || form.sub) ?? '未設定'}</p>
                </div>

                <Field label={`SEO タイトル（${form.seo_title?.length || 0}/60）`}>
                  <input maxLength={60} value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)} className={inputCls} placeholder="検索結果に表示されるタイトル" />
                </Field>
                <Field label={`メタディスクリプション（${form.meta_description?.length || 0}/160）`}>
                  <textarea rows={3} maxLength={160} value={form.meta_description || ''} onChange={e => set('meta_description', e.target.value)} className={inputCls} placeholder="検索結果に表示される説明文" />
                </Field>
                <Field label="ハッシュタグ（カンマ区切りで入力）">
                  <input value={(form.hashtags || []).join(', ')} onChange={e => {
                    const str = e.target.value;
                    const tags = str.split(',').map(s => s.trim().startsWith('#') ? s.trim() : '#' + s.trim()).filter(s => s !== '#');
                    set('hashtags', tags);
                  }} className={inputCls} placeholder="#観光, #グルメ" />
                  <p className="text-[10px] text-gray-500 mt-1">最大10個程度。カンマ「,」で区切って入力してください。</p>
                </Field>
              </div>
            </div>
          )}

          {/* アカウント タブ */}
          {tab === 'account' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 text-center text-gray-500 text-sm">
              <p>パスワード変更・メールアドレス変更は準備中です。</p>
            </div>
          )}
        </form>
      </div>

      {/* Footer Save Button Component Style */}
      {(tab === 'sns' || tab === 'seo') && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3" style={{ background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid #e8d8c0' }}>
          <button type="submit" form="settings-form" disabled={saving} className="w-full max-w-lg mx-auto block py-3.5 rounded-2xl text-sm font-bold transition-opacity disabled:opacity-60" style={{ background: '#c4a870', color: '#1c1006' }}>
            {saving ? '保存中…' : '設定を保存する'}
          </button>
        </div>
      )}

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl z-50 pointer-events-none" style={{ background: toast.type==='success'?'#166534':'#991b1b', color:'#fff', animation:'fadeInUp .2s' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── Sub components ──
const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${active ? 'bg-white shadow-sm text-[#1c1006]' : 'text-gray-400 hover:text-gray-600'}`}>
      {children}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2.5 text-xs font-semibold" style={{ background: 'rgba(139,94,60,0.06)', color: '#8b5e3c', borderBottom: '1px solid #f0e8d8' }}>{children}</div>
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 ml-1" style={{ color: '#6b7280' }}>
        {icon} <span>{label}</span>
      </label>
      {children}
    </div>
  )
}
