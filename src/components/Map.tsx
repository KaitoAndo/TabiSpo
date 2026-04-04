'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Spot } from '@/types/spot'

// ── 定数 ────────────────────────────────────────────────
const CENTER: [number, number] = [133.82220, 34.18470]
const ZOOM    = 16.2
const PITCH3D = 55
const PITCH2D = 0
const BEARING = -12
const TILE_URL = 'https://tiles.openfreemap.org/styles/liberty'

const CAT_COLOR: Record<string, string> = {
  '観光':    '#8b5e3c',
  '飲食':    '#c0392b',
  'スイーツ':'#c17bab',
  '体験':    '#2980b9',
  'お土産':  '#c17b4e',
  '酒蔵':    '#5a3e7a',
  '温泉・宿':'#27ae60',
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

  const [is3D,     setIs3D]     = useState(true)
  const [locating, setLocating] = useState(false)

  // ── マップ初期化 ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style:     TILE_URL,
      center:    CENTER,
      zoom:      ZOOM,
      pitch:     PITCH3D,
      bearing:   BEARING,
    })

    // スプライト未定義アイコンの警告を抑制（1×1 透明画像で代替）
    map.on('styleimagemissing', (e: { id: string }) => {
      if (map.hasImage(e.id)) return
      map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) })
    })

    map.on('load', () => {
      // 3D 建物レイヤー
      try {
        const layers = map.getStyle()?.layers ?? []
        const firstSymbol = layers.find(l => l.type === 'symbol')?.id

        map.addLayer(
          {
            id:     'kotohira-buildings-3d',
            type:   'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#d8c8a0',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                16, ['coalesce', ['get', 'render_height'], 5],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                16, ['coalesce', ['get', 'render_min_height'], 0],
              ],
              'fill-extrusion-opacity': 0.88,
            },
          },
          firstSymbol
        )
      } catch {
        // スタイルに openmaptiles ソースがない場合は無視
      }

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

        // ── SVG ピン（anchor:bottom でずれなし） ──
        const wrapper = document.createElement('div')
        wrapper.style.cssText = 'position:relative; width:30px; height:38px; cursor:pointer; transition:transform .15s ease;'
        wrapper.title = spot.name

        // SVG ピン本体：tip が要素の最下部に来るよう設計
        wrapper.innerHTML = `
          <svg width="30" height="38" viewBox="0 0 30 38"
            style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.35))">
            <path d="M15 2 C8.1 2 2.5 7.6 2.5 14.5
                     C2.5 23.5 15 36.5 15 36.5
                     C15 36.5 27.5 23.5 27.5 14.5
                     C27.5 7.6 21.9 2 15 2 Z"
              fill="${color}" stroke="rgba(255,255,255,0.92)" stroke-width="1.8"/>
            <circle cx="15" cy="14.5" r="5.5" fill="rgba(255,255,255,0.28)"/>
          </svg>
        `

        // premium は右上に金ドット
        if (spot.plan === 'premium') {
          const gold = document.createElement('div')
          gold.style.cssText = `
            position: absolute;
            top: 0; right: 0;
            width: 9px; height: 9px;
            background: #c4a870;
            border: 1.5px solid #fff;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          `
          wrapper.appendChild(gold)
        }

        wrapper.addEventListener('mouseenter', () => {
          wrapper.style.transform = 'scale(1.25) translateY(-3px)'
        })
        wrapper.addEventListener('mouseleave', () => {
          wrapper.style.transform = 'scale(1) translateY(0)'
        })
        wrapper.addEventListener('click', () => handleClick(spot))

        const marker = new maplibregl.Marker({ element: wrapper, anchor: 'bottom' })
          .setLngLat([spot.lng, spot.lat])
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    if (mapReadyRef.current) {
      render()
    } else {
      map.once('load', render)
    }
  }, [spots, activeCat, handleClick])

  // ── 現在地取得 ────────────────────────────────────────
  const handleLocate = useCallback(() => {
    const map = mapRef.current
    if (!map || locating || !mapReadyRef.current) return

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { longitude: lng, latitude: lat, accuracy } = coords
        setLocating(false)

        // 精度円更新
        const src = map.getSource('user-accuracy-src') as maplibregl.GeoJSONSource | undefined
        src?.setData({
          type: 'FeatureCollection',
          features: [geoCircle(lng, lat, accuracy)],
        })

        // 現在地ドット（パルス付き）
        userDotRef.current?.remove()
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="position:relative;width:16px;height:16px;">
            <div style="
              position:absolute;inset:0;
              background:#4a90e2;border-radius:50%;
              border:2.5px solid #fff;
              box-shadow:0 0 8px rgba(74,144,226,.8);
              z-index:1;
            "></div>
            <div class="user-pulse-ring"></div>
          </div>`
        userDotRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map)

        map.easeTo({ center: [lng, lat], zoom: 17, duration: 900 })
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [locating])

  // ── 2D / 3D 切替 ─────────────────────────────────────
  const toggle3D = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const nextPitch = is3D ? PITCH2D : PITCH3D
    map.easeTo({ pitch: nextPitch, duration: 500 })
    setIs3D(p => !p)
  }, [is3D])

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
        className="absolute bottom-4 right-3 flex flex-col gap-2 z-10"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.28))' }}
      >
        {/* 2D / 3D */}
        <button
          onClick={toggle3D}
          className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-95 select-none"
          style={{
            background: is3D ? '#c4a870' : '#fff',
            color:      is3D ? '#1c1006' : '#555',
            border: '2px solid rgba(0,0,0,.14)',
          }}
          title={is3D ? '2D 表示に切替' : '3D 表示に切替'}
        >
          {is3D ? '2D' : '3D'}
        </button>

        {/* 現在地 */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 select-none"
          style={{ border: '2px solid rgba(0,0,0,.14)' }}
          title="現在地を表示"
        >
          {locating ? (
            <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#4a90e2" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2"  x2="12" y2="5"  />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2"  y1="12" x2="5"  y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
