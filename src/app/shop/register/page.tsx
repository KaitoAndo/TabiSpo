'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/app/shop/login/page'

export default function ShopRegisterPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await createClient().auth.signUp({
      email, password,
      options: { data: { shop_name: name }, emailRedirectTo: `${location.origin}/shop/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <AuthLayout title="登録完了">
      <div className="text-center space-y-4 py-2">
        <span className="text-5xl">📧</span>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>{email}</strong> に確認メールを送信しました。<br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
        <Link href="/shop/login" className="block w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: '#8b5e3c' }}>ログイン画面へ</Link>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title="掲載店舗 新規登録">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="店舗名 *">
          <input type="text" required maxLength={50} value={name} onChange={e => setName(e.target.value)}
            className={inputCls} placeholder="例: 金刀比羅うどん" />
        </Field>
        <Field label="メールアドレス *">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className={inputCls} placeholder="your@email.com" autoComplete="email" />
        </Field>
        <Field label="パスワード（8文字以上）*">
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
            className={inputCls} placeholder="••••••••" autoComplete="new-password" />
        </Field>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: '#8b5e3c' }}>
          {loading ? '送信中…' : '登録して確認メールを受け取る'}
        </button>
      </form>
      <div className="pt-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          すでにアカウントをお持ちの方は
          <Link href="/shop/login" className="ml-1 font-semibold" style={{ color: '#8b5e3c' }}>ログイン</Link>
        </p>
      </div>
    </AuthLayout>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
}
