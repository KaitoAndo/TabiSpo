'use client'

import { useState, useEffect } from 'react'

export interface Mission {
  id: string
  title: string
  description: string
  icon: string
  target: number
}

export const MASTER_MISSIONS: Mission[] = [
  { id: 'first_login', title: '旅のはじまり', description: 'アプリを開く', icon: '🐣', target: 1 },
  { id: 'create_plan', title: '名プランナー', description: 'スケジュールを1つ作成する', icon: '🗓️', target: 1 },
  { id: 'spot_master', title: 'スポット開拓者', description: 'マップで3つのスポット詳細を見る', icon: '📍', target: 3 },
  { id: 'weekend_trip', title: '週末トラベラー', description: 'お気に入り(いいね)を1つ登録する', icon: '❤️', target: 1 },
]

export interface UserMissionProgress {
  missionId: string
  progress: number
  isCompleted: boolean
}

const STORAGE_KEY = 'tabispo_missions'

export function useMissions() {
  const [progress, setProgress] = useState<UserMissionProgress[]>([])

  // ロード
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch (e) {}
    } else {
      // 初期化
      const initial = MASTER_MISSIONS.map(m => ({
        missionId: m.id,
        progress: 0,
        isCompleted: false
      }))
      setProgress(initial)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    }
  }, [])

  const save = (newProgress: UserMissionProgress[]) => {
    setProgress(newProgress)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
  }

  // アクションを記録
  const addProgress = (missionId: string, amount: number = 1) => {
    setProgress(current => {
      let isUpdated = false
      const next = current.map(p => {
        if (p.missionId === missionId && !p.isCompleted) {
          isUpdated = true
          const mission = MASTER_MISSIONS.find(m => m.id === missionId)
          if (!mission) return p

          const newProgress = Math.min(p.progress + amount, mission.target)
          const isCompleted = newProgress >= mission.target

          return { ...p, progress: newProgress, isCompleted }
        }
        return p
      })
      
      if (isUpdated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
      return isUpdated ? next : current
    })
  }

  return { 
    missions: MASTER_MISSIONS,
    progress,
    addProgress
  }
}
