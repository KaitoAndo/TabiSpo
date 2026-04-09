'use client'

import Link from 'next/link'
import { useMissions } from '@/lib/useMissions'
import { useEffect } from 'react'

export default function MyPage() {
  const { missions, progress, addProgress } = useMissions()

  useEffect(() => {
    // マイページを開いたので、無条件で最初のミッションの要件をクリアするデモ
    addProgress('first_login')
  }, [addProgress])

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white px-4 py-4 border-b border-stone-200 sticky top-0 z-30">
        <h1 className="text-xl font-bold text-stone-800">マイページ</h1>
      </header>

      <div className="p-4 space-y-6 max-w-sm mx-auto">
        
        {/* ユーザープロフィール（モック） */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg">ゲストトラベラー</h2>
            <p className="text-sm text-stone-500">レベル {progress.filter(p => p.isCompleted).length + 1} / 旅の記録 0件</p>
          </div>
        </section>

        {/* トラベラーバッジ（ゲーミフィケーション） */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-stone-800">獲得バッジ (ミッション)</h3>
            <span className="text-amber-600 text-sm font-medium">すべて見る →</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 grid grid-cols-4 gap-2 text-center">
            {missions.map(mission => {
              const p = progress.find(p => p.missionId === mission.id)
              const isCompleted = p?.isCompleted ?? false
              return (
                <div key={mission.id} className={isCompleted ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'} title={mission.description}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl mb-1 border ${isCompleted ? 'bg-amber-100 border-amber-200' : 'bg-stone-100 border-stone-200'}`}>
                    {mission.icon}
                  </div>
                  <p className="text-[10px] font-bold text-stone-700">{mission.title}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* メニュー */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <ul className="divide-y divide-stone-100">
            <li>
              <Link href="/mypage/favorites" className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                <span className="font-medium text-stone-800 flex items-center gap-2">⭐️ お気に入り店舗</span>
                <span className="text-stone-400">12件 →</span>
              </Link>
            </li>
            <li>
              <Link href="/mypage/reviews" className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                <span className="font-medium text-stone-800 flex items-center gap-2">✍️ 投稿したレビュー</span>
                <span className="text-stone-400">→</span>
              </Link>
            </li>
            <li>
              <Link href="/shop/login" className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                <span className="font-medium text-stone-800 flex items-center gap-2">🏪 店舗を掲載する</span>
                <span className="text-stone-400">→</span>
              </Link>
            </li>
          </ul>
        </section>

      </div>
    </div>
  )
}
