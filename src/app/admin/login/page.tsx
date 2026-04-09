'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
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
    if (error) { setError('認証に失敗しました'); setLoading(false); return }
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: '#0f0a05' }}>
      <div style={{ position:'fixed', top:0, left:0, right:0, height:3,
        background:'linear-gradient(90deg,#7a4e20,#e8c860,#c4a240,#e8c860,#7a4e20)' }} />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏯</span>
          <h1 className="mt-3 text-xl font-bold" style={{ color:'#c4a870' }}>運営管理者ポータル</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(196,168,112,0.5)' }}>旅スポ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                placeholder="admin@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">パスワード</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                placeholder="••••••••" autoComplete="current-password" />
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background:'#3c220c' }}>
              {loading ? 'ログイン中…' : '管理者ログイン'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
