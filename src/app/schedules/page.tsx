'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSchedules } from '@/lib/useSchedules'
import { useMissions } from '@/lib/useMissions'

export default function SchedulesPage() {
  const { schedules, addSchedule, deleteSchedule } = useSchedules()
  const { addProgress } = useMissions()
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addSchedule(newTitle, newDate)
    addProgress('create_plan')
    setNewTitle('')
    setNewDate('')
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <header className="bg-white px-4 py-4 border-b border-stone-200 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-stone-800">マイスケジュール</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="text-white font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 rounded-full shadow-md shadow-orange-500/20 hover:scale-105 transition-transform"
        >
          ＋ 新規作成
        </button>
      </header>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {schedules.map(schedule => (
          <div key={schedule.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 border-l-4 border-l-amber-400 relative group">
            <Link href={`/schedules/${schedule.id}`} className="block active:scale-95 transition-transform">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-bold text-stone-900 text-lg">{schedule.title}</h2>
                <span className="text-xs text-stone-500 font-medium">{schedule.date || '日付未定'}</span>
              </div>
              <p className="text-sm text-stone-600 mb-3 block font-medium">
                登録スポット: <span className="text-amber-600 font-bold">{schedule.spotIds.length}</span> 件
              </p>
              <div className="flex gap-2">
                {/* プレースホルダー絵文字 */}
                {schedule.spotIds.slice(0, 5).map((id, i) => (
                  <div key={id} className={`w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs ${i > 0 ? '-ml-4' : ''}`}>📍</div>
                ))}
                {schedule.spotIds.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] text-stone-500 font-bold -ml-4">
                    +{schedule.spotIds.length - 5}
                  </div>
                )}
              </div>
            </Link>
            <button 
              onClick={(e) => { e.preventDefault(); deleteSchedule(schedule.id) }}
              className="absolute top-4 right-4 w-6 h-6 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
              title="削除"
            >
              ✕
            </button>
          </div>
        ))}

        {schedules.length === 0 && (
          <div 
            onClick={() => setShowModal(true)}
            className="bg-stone-100 p-4 rounded-2xl border-2 border-stone-200 border-dashed text-center flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-amber-50 hover:border-amber-200 transition-colors"
          >
            <span className="text-4xl mb-3 text-stone-300">📅</span>
            <p className="text-stone-700 font-bold text-lg mb-1">スケジュールがありません</p>
            <p className="text-stone-500 text-xs">「新規作成」から最初のプランを作りましょう！</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-float" style={{ animation: 'none' }}>
            <h2 className="text-xl font-bold text-stone-800 mb-4">新しいスケジュール</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">タイトル *</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="例：週末うどん巡り"
                  className="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">日付（任意）</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-stone-200 bg-stone-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl text-sm"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  作成する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
