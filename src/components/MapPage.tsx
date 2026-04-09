'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo } from 'react'
import FilterChips from '@/components/FilterChips'
import SpotList from '@/components/SpotList'
import BottomSheet from '@/components/BottomSheet'
import Header from '@/components/Header'
import type { Spot } from '@/types/spot'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-100" style={{ zIndex: 0 }}>
      <p className="text-sm text-stone-400 animate-pulse">地図を読み込み中…</p>
    </div>
  ),
})

interface MapPageProps {
  initialSpots: Spot[]
}

export default function MapPage({ initialSpots }: MapPageProps) {
  const [activeCat, setActiveCat]       = useState('すべて')
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)

  const filteredSpots = useMemo(() => {
    let spots = initialSpots
    if (activeCat !== 'すべて') {
      spots = spots.filter(s => s.category === activeCat)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      spots = spots.filter(s => s.name.toLowerCase().includes(q) || s.tag?.toLowerCase().includes(q) || s.area?.toLowerCase().includes(q) || s.pr?.toLowerCase().includes(q))
    }
    return spots
  }, [initialSpots, activeCat, searchQuery])

  function closeSheet() {
    setSelectedSpot(null)
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>

      {/* ── ヘッダー（固定 z-40） ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40 }}>
        <Header>
          {/* 検索バー */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-md px-10 py-2 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm placeholder:text-stone-400 border border-stone-200/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 hover:text-stone-600 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </Header>
        
        {/* フィルター (ヘッダーの下に配置) */}
        <div className="pt-[100px] px-4 pointer-events-none">
          <div className="-mx-4 pb-2 pointer-events-auto">
            <FilterChips activeCat={activeCat} onChange={setActiveCat} />
          </div>
        </div>
      </div>

      {/* ── 地図（全画面 z-0） ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Map
          spots={filteredSpots}
          activeCat={activeCat}
          onSpotClick={setSelectedSpot}
        />
      </div>

      {/* ── スポットリスト（固定下部 z-10、シート表示時は非表示） ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 10,
          pointerEvents: selectedSpot ? 'none' : 'auto',
          opacity: selectedSpot ? 0 : 1,
          transition: 'opacity .2s ease',
        }}
      >
        <SpotList spots={filteredSpots} onSpotClick={setSelectedSpot} />
      </div>

      {/* ── バックドロップ（シート表示時のみ z-20） ── */}
      {selectedSpot && (
        <div
          onClick={closeSheet}
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'transparent' }}
        />
      )}

      {/* ── ボトムシート（z-30） ── */}
      <BottomSheet spot={selectedSpot} onClose={closeSheet} />

    </div>
  )
}
