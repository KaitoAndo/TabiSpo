'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, AREAS } from '@/lib/constants'
import type { Spot, SpotCategory, PlanType } from '@/types/spot'

export default function AdminSpotEditClient({ spot: initial }: { spot: Spot }) {
  const router = useRouter()
  const [form,   setForm]   = useState<Spot>(initial)
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')

  function set<K extends keyof Spot>(key: K, value: Spot[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await createClient().from('spots').update({
      name: form.name, category: form.category, sub: form.sub, pr: form.pr,
      hours: form.hours, closed: form.closed, area: form.area, tag: form.tag,
      plan: form.plan, is_active: form.is_active,
    }).eq('id', initial.id)
    setSaving(false)
    if (error) { setMsg('エラー: ' + error.message); return }
    setMsg('保存しました！')
    setTimeout(() => router.push('/admin/spots'), 1200)
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background:'#f5f0e8' }}>
      <div style={{ height:3, background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center gap-3"
        style={{ background:'linear-gradient(135deg,#0f0a05,#3c220c)' }}>
        <button onClick={() => router.back()} className="text-sm font-medium" style={{ color:'#c4a870' }}>← 戻る</button>
        <h1 className="text-sm font-bold text-white">スポット編集（管理者）</h1>
      </header>

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <F label="店舗名 *"><input required value={form.name} onChange={e => set('name', e.target.value)} className={ic} /></F>
          <F label="カテゴリ">
            <select value={form.category} onChange={e => set('category', e.target.value as SpotCategory)} className={ic}>
              {CATEGORIES.filter(c => c !== 'すべて').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </F>
          <F label="プラン">
            <select value={form.plan} onChange={e => set('plan', e.target.value as PlanType)} className={ic}>
              {(['free','standard','premium'] as PlanType[]).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </F>
          <F label="サブタイトル"><input value={form.sub ?? ''} onChange={e => set('sub', e.target.value)} className={ic} /></F>
          <F label="PR文"><textarea rows={3} value={form.pr ?? ''} onChange={e => set('pr', e.target.value)} className={ic} /></F>
          <F label="営業時間 *"><input required value={form.hours ?? ''} onChange={e => set('hours', e.target.value)} className={ic} /></F>
          <F label="定休日"><input value={form.closed ?? ''} onChange={e => set('closed', e.target.value)} className={ic} /></F>
          <F label="エリア">
            <select value={form.area ?? ''} onChange={e => set('area', e.target.value)} className={ic}>
              <option value="">選択</option>
              {AREAS.filter(a => a !== 'すべて').map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </F>
          <F label="タグ"><input value={form.tag ?? ''} onChange={e => set('tag', e.target.value || null as unknown as string)} className={ic} /></F>
          <F label="緯度"><input type="number" step="any" value={form.lat} onChange={e => set('lat', parseFloat(e.target.value))} className={ic} /></F>
          <F label="経度"><input type="number" step="any" value={form.lng} onChange={e => set('lng', parseFloat(e.target.value))} className={ic} /></F>
          <F label="公開設定">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
                className="w-4 h-4" style={{ accentColor:'#8b5e3c' }} />
              <span className="text-sm text-gray-700">マップに公開する</span>
            </label>
          </F>
        </div>
        {msg && (
          <p className={`text-sm px-4 py-2 rounded-xl text-center ${msg.includes('エラー') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{msg}</p>
        )}
      </form>

      <div className="fixed bottom-0 left-0 right-0 px-4 py-3"
        style={{ background:'rgba(245,240,232,0.95)', backdropFilter:'blur(8px)', borderTop:'1px solid #e8d8c0' }}>
        <button onClick={handleSave} disabled={saving}
          className="w-full max-w-lg mx-auto block py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background:'#3c220c' }}>
          {saving ? '保存中…' : '変更を保存する'}
        </button>
      </div>
    </div>
  )
}

const ic = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50'
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
}
