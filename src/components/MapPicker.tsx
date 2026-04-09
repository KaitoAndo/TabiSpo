'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onChange: (lat: number, lng: number) => void
}

const DEFAULT_CENTER: [number, number] = [133.82220, 34.18470] // 琴平中心

export default function MapPicker({ initialLat, initialLng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initialCenter: [number, number] = (initialLng && initialLat) 
      ? [initialLng, initialLat] 
      : DEFAULT_CENTER

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: initialCenter,
      zoom: 15,
    })

    // 初期のピン作成
    const marker = new maplibregl.Marker({ draggable: true, color: '#ef4444' })
      .setLngLat(initialCenter)
      .addTo(map)
    
    // ドラッグで位置決定
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat()
      onChange(lngLat.lat, lngLat.lng)
    })

    // クリックで位置移動
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      onChange(e.lngLat.lat, e.lngLat.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [initialLat, initialLng, onChange])

  return (
    <div className="w-full h-64 bg-stone-200 rounded-xl overflow-hidden relative border border-stone-300">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-stone-700 shadow-sm pointer-events-none">
        マップをクリックするかピンをドラッグして位置を指定
      </div>
    </div>
  )
}
