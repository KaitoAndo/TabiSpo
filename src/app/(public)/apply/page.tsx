'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = ['観光', '飲食', 'スイーツ', '体験', 'お土産', '酒蔵', '温泉・宿'] as const
const PLANS = [
  { value: 'free',     label: '無料掲載',              desc: '基本情報のみ掲載' },
  { value: 'standard', label: 'スタンダード ¥3,000/月', desc: 'PR文・タグ表示' },
  { value: 'premium',  label: 'プレミアム ¥10,000/月',  desc: '優先表示＋画像対応' },
] as const

type FieldErrors = Record<string, string>

interface FormState {
  shopName:    string
  category:    string
  contactName: string
  email:       string
  phone:       string
  plan:        string
  pr:          string
  note:        string
}

const INIT: FormState = {
  shopName: '', category: '', contactName: '', email: '',
  phone: '', plan: 'free', pr: '', note: '',
}

export default function ApplyPage() {
  const [form, setForm]       = useState<FormState>(INIT)
  const [errors, setErrors]   = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const res = await fetch('/api/apply', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      if (data.errors) setErrors(data.errors)
      else setErrors({ _global: data.error ?? 'エラーが発生しました' })
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) return <CompletePage shopName={form.shopName} email={form.email} />

  return (
    <div className="min-h-dvh" style={{ background: '#f5f0e8' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />

      <header className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,#1c1006,#3c220c)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">⛩️</span>
          <span className="font-bold text-sm" style={{ color: '#c4a870' }}>旅スポ</span>
        </div>
        <Link href="/" className="text-xs" style={{ color: 'rgba(196,168,112,0.7)' }}>← マップを見る</Link>
      </header>

      <div className="max-w-xl mx-auto p-4 pb-12">
        <div className="text-center py-8">
          <p className="text-2xl mb-1">📋</p>
          <h1 className="text-xl font-bold" style={{ color: '#1c1006' }}>掲載申込フォーム</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            旅スポへの掲載をご希望の方はこちらからお申し込みください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors._global && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
              {errors._global}
            </div>
          )}

          <Card title="店舗情報">
            <Field label="店舗名" required error={errors.shopName}>
              <Input
                value={form.shopName} onChange={set('shopName')}
                placeholder="例：金刀比羅宮参道 ○○屋" error={!!errors.shopName} />
            </Field>

            <Field label="カテゴリ" required error={errors.category}>
              <select
                value={form.category} onChange={set('category')}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={selectStyle(!!errors.category)}>
                <option value="">選択してください</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="PR文" error={errors.pr}>
              <textarea
                value={form.pr} onChange={set('pr')}
                rows={3} placeholder="店舗のPRや特徴を入力してください（スタンダード以上で掲載）"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={inputStyle(false)} />
            </Field>
          </Card>

          <Card title="担当者情報">
            <Field label="担当者名" required error={errors.contactName}>
              <Input
                value={form.contactName} onChange={set('contactName')}
                placeholder="例：山田 太郎" error={!!errors.contactName} />
            </Field>

            <Field label="メールアドレス" required error={errors.email}>
              <Input
                type="email" value={form.email} onChange={set('email')}
                placeholder="例：info@example.com" error={!!errors.email} />
            </Field>

            <Field label="電話番号" error={errors.phone}>
              <Input
                type="tel" value={form.phone} onChange={set('phone')}
                placeholder="例：0877-00-0000" error={false} />
            </Field>
          </Card>

          <Card title="希望プラン">
            <div className="space-y-2">
              {PLANS.map(p => (
                <label key={p.value}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: form.plan === p.value ? '#fef9ec' : '#fafafa',
                    border: `1.5px solid ${form.plan === p.value ? '#c4a870' : '#e5e7eb'}`,
                  }}>
                  <input
                    type="radio" name="plan" value={p.value}
                    checked={form.plan === p.value} onChange={set('plan')}
                    className="mt-0.5 accent-amber-700" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1c1006' }}>{p.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card title="備考">
            <textarea
              value={form.note} onChange={set('note')}
              rows={3} placeholder="その他ご質問・ご要望があればご記入ください"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={inputStyle(false)} />
          </Card>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl text-base font-bold transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#8b5e3c,#c4a870)', color: '#fff' }}>
            {loading ? '送信中…' : '申込を送信する'}
          </button>

          <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
            送信後、確認メールをお送りします。通常3営業日以内にご連絡いたします。
          </p>
        </form>
      </div>
    </div>
  )
}

function CompletePage({ shopName, email }: { shopName: string; email: string }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#f5f0e8' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <header className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg,#1c1006,#3c220c)' }}>
        <span className="text-lg">⛩️</span>
        <span className="font-bold text-sm" style={{ color: '#c4a870' }}>旅スポ</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: 'linear-gradient(135deg,#fef3c7,#fef9ec)', border: '2px solid #e8c860' }}>
            ✅
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1c1006' }}>
            申込を受け付けました
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
            <span className="font-medium" style={{ color: '#374151' }}>{shopName}</span> 様の申込を受け付けました。<br />
            確認メールを <span className="font-medium" style={{ color: '#374151' }}>{email}</span> に送信しました。<br />
            通常3営業日以内にご連絡いたします。
          </p>
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 text-left space-y-2"
            style={{ border: '1px solid #f0e8d8' }}>
            <p className="text-xs font-semibold" style={{ color: '#8b5e3c' }}>次のステップ</p>
            {[
              '担当者がご連絡をお送りします',
              'アカウント発行後にログインいただけます',
              'スポット情報を登録・編集できます',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#f0e8d8', color: '#8b5e3c' }}>{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <Link href="/"
            className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
            style={{ background: '#c4a870', color: '#1c1006' }}>
            マップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── 共通スタイルヘルパー ───────────────────────────────────────

function inputStyle(error: boolean): React.CSSProperties {
  return {
    background:  '#fafafa',
    border:      `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: 12,
    color:       '#1c1006',
    fontSize:    14,
  }
}

function selectStyle(error: boolean): React.CSSProperties {
  return { ...inputStyle(error), appearance: 'auto' }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3" style={{ background: 'rgba(139,94,60,0.05)', borderBottom: '1px solid #f0e8d8' }}>
        <p className="text-xs font-semibold" style={{ color: '#8b5e3c' }}>{title}</p>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

function Input({
  type = 'text', value, onChange, placeholder, error,
}: {
  type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; error: boolean
}) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
      style={inputStyle(error)} />
  )
}
