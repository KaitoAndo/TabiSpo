'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  spotId: string
}

export default function SpotActions({ spotId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      const [favRes, checkInRes] = await Promise.all([
        supabase.from('favorites').select('id').eq('user_id', user.id).eq('spot_id', spotId).single(),
        supabase.from('check_ins').select('id').eq('user_id', user.id).eq('spot_id', spotId).limit(1)
      ])

      if (favRes.data) setIsFavorite(true)
      if (checkInRes.data && checkInRes.data.length > 0) setHasCheckedIn(true)
      
      setLoading(false)
    }
    checkStatus()
  }, [spotId, supabase])

  async function toggleFavorite() {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('spot_id', spotId)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, spot_id: spotId })
      setIsFavorite(true)
    }
  }

  async function handleCheckIn() {
    if (!user) {
      router.push('/login')
      return
    }

    if (hasCheckedIn) {
      alert('すでにチェックイン済みです！')
      return
    }

    // 実際のアプリではGPS距離判定などを入れる想定
    const confirmed = confirm('この場所にいますか？（チェックインします）')
    if (!confirmed) return

    await supabase.from('check_ins').insert({ user_id: user.id, spot_id: spotId })
    setHasCheckedIn(true)
    alert('チェックインしました！バッジ獲得の可能性があります。')
  }

  return (
    <div className="flex gap-3 mt-6">
      <button 
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-medium transition-colors ${
          isFavorite 
            ? 'bg-red-50 text-red-600 border border-red-200' 
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        }`}
      >
         {isFavorite ? '❤️ お気に入り' : '🤍 お気に入り'}
      </button>
      <button 
        onClick={handleCheckIn}
        disabled={loading || hasCheckedIn}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-medium transition-colors shadow-sm ${
          hasCheckedIn
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none'
            : 'bg-amber-500 text-black hover:bg-amber-600 shadow-amber-500/20'
        }`}
      >
         {hasCheckedIn ? '✅ チェックイン済' : '📍 チェックイン'}
      </button>
    </div>
  )
}
