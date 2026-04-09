'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Spot } from '@/types/spot'

// ── 定数 ────────────────────────────────────────────────
const CENTER: [number, number] = [133.82220, 34.18470]
const ZOOM    = 15.8
const PITCH   = 0
const BEARING = 0
const TILE_URL = 'https://tiles.openfreemap.org/styles/liberty'

const CAT_COLOR: Record<string, string> = {
  '観光':    '#f59e0b', // amber-500
  '飲食':    '#ef4444', // red-500
  'スイーツ':'#ec4899', // pink-500
  '体験':    '#3b82f6', // blue-500
  'お土産':  '#f97316', // orange-500
  '酒蔵':    '#8b5cf6', // purple-500
  '温泉・宿':'#10b981', // emerald-500
}

const CAT_ICON: Record<string, string> = {
  '観光':    '⛩️',
  '飲食':    '🍜',
  'スイーツ':'🍦',
  '体験':    '🎨',
  'お土産':  '🛍️',
  '酒蔵':    '🍶',
  '温泉・宿':'♨️',
}

// GeoJSON で緯経度ベースの円ポリゴンを生成（精度円用）
function geoCircle(
  lng: number,
  lat: number,
  radiusM: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const dX = radiusM / (111320 * Math.cos((lat * Math.PI) / 180))
  const dY = radiusM / 110540
  const coords: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * 2 * Math.PI
    coords.push([lng + dX * Math.cos(a), lat + dY * Math.sin(a)])
  }
  coords.push(coords[0])
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
}

// ── Props ────────────────────────────────────────────────
export interface MapProps {
  spots: Spot[]
  activeCat: string
  onSpotClick: (spot: Spot) => void
}

// ── コンポーネント ────────────────────────────────────────
export default function Map({ spots, activeCat, onSpotClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<maplibregl.Map | null>(null)
  const markersRef   = useRef<maplibregl.Marker[]>([])
  const userDotRef   = useRef<maplibregl.Marker | null>(null)
  const mapReadyRef  = useRef(false)

  const [isLocating, setIsLocating] = useState(false)
  const watchIdRef   = useRef<number | null>(null)

  // ── マップ初期化 ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style:     TILE_URL,
      center:    CENTER,
      zoom:      ZOOM,
      pitch:     PITCH,
      bearing:   BEARING,
    })

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    // @ts-ignore
    if (map.dragPitch) map.dragPitch.disable();

    // スプライト未定義アイコンの警告を抑制（1×1 透明画像で代替）
    map.on('styleimagemissing', (e: { id: string }) => {
      if (map.hasImage(e.id)) return
      map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) })
    })

    map.on('load', () => {
      // 邪魔なPOIs（地図上のアイコンや地名）を非表示化してスッキリさせる
      const layers = map.getStyle()?.layers ?? []
      layers.forEach(layer => {
        if (layer.id.includes('poi') || layer.id.includes('place') || layer.type === 'symbol') {
          // highway や 水域の名前は残す場合もあるが、まずは一律symbolやpoiを消す（必要なら条件調整）
          if (layer.id.includes('water') || layer.id.includes('road')) return;
          map.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      })

      // 現在地精度円ソース & レイヤー
      map.addSource('user-accuracy-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id:     'user-accuracy-fill',
        type:   'fill',
        source: 'user-accuracy-src',
        paint: {
          'fill-color':   '#4a90e2',
          'fill-opacity': 0.12,
        },
      })
      map.addLayer({
        id:     'user-accuracy-stroke',
        type:   'line',
        source: 'user-accuracy-src',
        paint: {
          'line-color':   '#4a90e2',
          'line-width':   1.2,
          'line-opacity': 0.45,
        },
      })

      mapReadyRef.current = true
    })

    mapRef.current = map

    return () => {
      mapReadyRef.current = false
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── マーカー描画 ──────────────────────────────────────
  const handleClick = useCallback((spot: Spot) => onSpotClick(spot), [onSpotClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // マップがまだロードされていなければ load 後に再実行
    const render = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      spots.forEach(spot => {
        const color = CAT_COLOR[spot.category] ?? '#888'
        const icon  = CAT_ICON[spot.category] ?? '📍'

        // ── ズレないSVGベースのピン ──
        const wrapper = document.createElement('div')
        // マップへのアンカー位置を計算できるように、幅と高さを定義
        wrapper.style.cssText = `
          width: 36px; 
          height: 46px; 
          display: flex;
          align-items: flex-end;
          justify-content: center;
        `
        wrapper.title = spot.name

        // この要素を拡大縮小・ホバー演出することで、要素の接地点は変わらない
        const inner = document.createElement('div')
        inner.style.cssText = `
          position: relative; 
          width: 36px; height: 46px; 
          transform-origin: bottom center; 
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        `
        
        let initialSc = 1.0
        if (map.getZoom()) {
          initialSc = Math.max(0.4, Math.min(1.5, map.getZoom() / 15))
        }
        inner.style.transform = `scale(${initialSc})`

        // オレンジの丸（底の中心 = left: 10px, bottom: -8px）
        // SVGしずく（width 36, height 46 で先端が(18, 46)）
        inner.innerHTML = `
          <!-- 実際の地点を指すオレンジのパルス -->
          <div style="position: absolute; bottom: -8px; left: 10px; width: 16px; height: 16px; background: rgba(245, 158, 11, 0.4); border-radius: 50%; pointer-events: none; animation: pulse 2s infinite;"></div>
          <div style="position: absolute; bottom: -2px; left: 16px; width: 4px; height: 4px; background: #f59e0b; border-radius: 50%; pointer-events: none;"></div>
          
          <!-- しずくピン -->
          <svg width="36" height="46" viewBox="0 0 36 46" style="position: absolute; bottom: 0; left: 0; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); pointer-events: none;">
            <path d="M 0 18 A 18 18 0 1 1 36 18 C 36 28, 18 46, 18 46 C 18 46, 0 28, 0 18 Z" fill="${color}" stroke="#fff" stroke-width="2"/>
            <circle cx="18" cy="18" r="11" fill="#fff" />
            <text x="18" y="23" font-size="14" text-anchor="middle" dominant-baseline="central">${icon}</text>
          </svg>
        `
        wrapper.appendChild(inner)

        // ホバー処理
        wrapper.addEventListener('mouseenter', () => {
          const z = map.getZoom()
          const sc = Math.max(0.4, Math.min(1.5, z / 15))
          inner.style.transform = `scale(${sc * 1.15}) translateY(-2px)`
        })
        wrapper.addEventListener('mouseleave', () => {
          const z = map.getZoom()
          const sc = Math.max(0.4, Math.min(1.5, z / 15))
          inner.style.transform = `scale(${sc})`
        })
        wrapper.addEventListener('click', () => handleClick(spot))

        const marker = new maplibregl.Marker({ element: wrapper, anchor: 'bottom' })
          .setLngLat([spot.lng, spot.lat])
          .addTo(map)
        
        map.on('zoom', () => {
          const z = map.getZoom()
          const sc = Math.max(0.4, Math.min(1.5, z / 15))
          inner.style.transform = `scale(${sc})`
        })

        if (spot.plan === 'premium') {
          const gold = document.createElement('div')
          gold.style.cssText = `
            position: absolute;
            top: -2px; right: 0;
            width: 12px; height: 12px;
            background: linear-gradient(135deg, #fcd34d, #d97706);
            border: 2px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10;
          `
          wrapper.appendChild(gold)
        }

        markersRef.current.push(marker)
      })
    }

    if (mapReadyRef.current) {
      render()
    } else {
      map.once('load', render)
    }
  }, [spots, activeCat, handleClick])

  // ── 現在地取得 ＆ 追跡 ──────────────────────────────────
  const handleLocate = useCallback(() => {
    const map = mapRef.current
    if (!map || isLocating || !mapReadyRef.current) return

    setIsLocating(true)
    
    // 一度だけ現在地に飛ぶ
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false)
        map.easeTo({ center: [coords.longitude, coords.latitude], zoom: 16.5, duration: 1200 })
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 5000 }
    )
    
    // 自動追跡を開始
    if (watchIdRef.current !== null) return
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { longitude: lng, latitude: lat, accuracy } = coords
        
        // 精度円
        const src = map.getSource('user-accuracy-src') as maplibregl.GeoJSONSource | undefined
        src?.setData({
          type: 'FeatureCollection',
          features: [geoCircle(lng, lat, accuracy)],
        })

        // ドット
        userDotRef.current?.remove()
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="position:relative;width:18px;height:18px;">
            <div style="
              position:absolute;inset:0;
              background:#3b82f6;border-radius:50%;
              border:3px solid #fff;
              box-shadow:0 2px 6px rgba(0,0,0,0.25);
              z-index:2;
            "></div>
            <div class="user-pulse-ring"></div>
          </div>`
        userDotRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map)
      },
      console.warn,
      { enableHighAccuracy: true, maximumAge: 10000 }
    )
  }, [isLocating])

  // マウント時に自動で現在地取得を開始
  useEffect(() => {
    handleLocate()
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [handleLocate])

  // ── レンダリング ──────────────────────────────────────
  return (
    <div className="relative w-full h-full">
      {/* パルスアニメーション */}
      <style>{`
        .user-pulse-ring {
          position: absolute;
          inset: -7px;
          background: rgba(74,144,226,.28);
          border-radius: 50%;
          animation: pulse-ring 1.8s ease-out infinite;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(.5); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .maplibregl-ctrl-bottom-right { bottom: 80px !important; }
      `}</style>

      {/* 地図本体 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* FAB ボタン群（右下） */}
      <div
        className="absolute bottom-6 right-4 flex flex-col gap-3 z-10"
      >
        {/* 現在地 */}
        <button
          disabled={isLocating}
          className="w-12 h-12 rounded-full elegant-panel flex items-center justify-center transition-transform hover:scale-105 active:scale-95 select-none text-[#5f8a8b] shadow-sm ml-auto"
          title="現在地を表示"
        >
          {isLocating ? (
            <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2"  x2="12" y2="6"  />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2"  y1="12" x2="6"  y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
