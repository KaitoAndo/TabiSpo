'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ShopLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setError('メールアドレスまたはパスワードが正しくありません'); setLoading(false); return }
    router.push('/shop/dashboard')
    router.refresh()
  }

  return (
    <AuthLayout title="掲載店舗 ログイン">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="メールアドレス">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className={inputCls} placeholder="your@email.com" autoComplete="email" />
        </Field>
        <Field label="パスワード">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className={inputCls} placeholder="••••••••" autoComplete="current-password" />
        </Field>
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? 'ログイン中…' : 'ログイン'}
        </button>
      </form>
      <div className="pt-3 border-t border-gray-100 text-center space-y-1.5">
        <p className="text-xs text-gray-500">
          アカウント未登録の方は
          <Link href="/shop/register" className="ml-1 font-semibold" style={{ color: '#8b5e3c' }}>こちら</Link>
        </p>
        <Link href="/" className="block text-xs text-gray-400 hover:underline">← タウンマップに戻る</Link>
      </div>
    </AuthLayout>
  )
}

export function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: '#1c1006' }}>
      <div style={{ position:'fixed', top:0, left:0, right:0, height:3,
        background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">⛩️</span>
          <h1 className="mt-3 text-xl font-bold" style={{ color:'#c4a870' }}>旅スポ</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(196,168,112,0.6)' }}>{title}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50'
const btnCls   = 'w-full py-3 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60 text-white'
  + ' ' + 'bg-[#8b5e3c]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>
}
