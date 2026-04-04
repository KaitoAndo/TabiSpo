'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo } from 'react'
import FilterChips from '@/components/FilterChips'
import SpotList from '@/components/SpotList'
import BottomSheet from '@/components/BottomSheet'
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
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)

  const filteredSpots = useMemo(
    () => activeCat === 'すべて'
      ? initialSpots
      : initialSpots.filter(s => s.category === activeCat),
    [initialSpots, activeCat]
  )

  function closeSheet() {
    setSelectedSpot(null)
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>

      {/* ── ヘッダー（固定 z-40） ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40 }}>
        {/* ゴールドライン 3px */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #7a4e20, #e8c860, #c4a240, #e8c860, #7a4e20)',
        }} />

        {/* タイトルバー */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ background: 'linear-gradient(135deg, rgba(28,16,6,0.97) 0%, rgba(60,34,12,0.93) 100%)' }}
        >
          <span className="text-xl select-none">⛩️</span>
          <h1
            className="text-base font-bold tracking-tight"
            style={{ color: '#c4a870' }}
          >
            こんぴらタウンMAP
          </h1>
        </div>

        {/* フィルターチップス */}
        <FilterChips activeCat={activeCat} onChange={setActiveCat} />
      </header>

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
