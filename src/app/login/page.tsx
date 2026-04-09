'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function TravelerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/mypage')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { name: email.split('@')[0] }
          }
        })
        if (error) throw error
        alert('登録が完了しました。メールを確認するか、そのままログインできるかお試しください。')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 pb-20 items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">⛩️</span>
          <h1 className="text-xl font-bold text-stone-900">旅スポ {isLogin ? 'ログイン' : '新規登録'}</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">メールアドレス</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-stone-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">パスワード</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-stone-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          {isLogin ? (
            <p>アカウントをお持ちでないですか？ <button onClick={() => setIsLogin(false)} className="text-amber-600 font-bold hover:underline">新規登録</button></p>
          ) : (
            <p>すでにアカウントをお持ちですか？ <button onClick={() => setIsLogin(true)} className="text-amber-600 font-bold hover:underline">ログイン</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
