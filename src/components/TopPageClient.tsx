'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Spot } from '@/types/spot'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

const BGS = [
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542051812871-75ec301140bf?q=80&w=2000&auto=format&fit=crop'
]

export default function TopPageClient({ popularSpots }: { popularSpots: Spot[] }) {
  const { t } = useI18n()
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % BGS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* ヒーローセクション */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-stone-950">
        {/* 背景スライドショー */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={BGS[bgIndex]}
                alt="日本の絶景"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-stone-900/40 z-10" />
        </div>
        
        {/* コンテンツ */}
        <div className="relative z-20 text-center px-4 w-full max-w-4xl mx-auto flex flex-col items-center mt-28 pb-8">
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-2xl mb-6 leading-[1.2]"
          >
            あなただけの <br className="md:hidden" />
            <motion.span 
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
              className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-[length:200%_auto] bg-clip-text text-transparent inline-block tracking-tight"
            >
              &quot;名スポット&quot;
            </motion.span> を探そう
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            className="text-stone-100 text-lg md:text-xl max-w-2xl mb-12 font-medium drop-shadow-md whitespace-pre-line tracking-wide"
          >
            {t('top.hero.desc')}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
          >
            <Link 
              href="/map" 
              className="group relative px-10 py-5 bg-white/95 hover:bg-white text-stone-900 font-bold rounded-full transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md overflow-hidden flex items-center justify-center gap-3 w-fit mx-auto"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-200/50 to-orange-200/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2 text-xl tracking-wide">
                <span>{t('top.hero.button')}</span>
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </motion.svg>
              </span>
            </Link>
          </motion.div>
        </div>
        
        {/* 下部へのグラデーション */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent z-10 pointer-events-none" />
      </section>

      {/* コンテンツエリア */}
      <div className="relative z-20 px-4 py-16 space-y-24 max-w-5xl mx-auto w-full pb-32">
        
        {/* カテゴリ */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">
              {t('top.cat.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: '観光', icon: '⛩️', color: 'from-orange-100 to-amber-50 text-orange-700' },
              { id: '飲食', icon: '🍜', color: 'from-red-100 to-rose-50 text-red-700' },
              { id: '絶品スイーツ', idParam: 'スイーツ', icon: '🍦', color: 'from-pink-100 to-fuchsia-50 text-pink-700' },
              { id: '体験', icon: '🎨', color: 'from-blue-100 to-indigo-50 text-blue-700' },
            ].map((cat, i) => (
              <Link 
                key={i} 
                href={`/spots?tag=${encodeURIComponent(cat.idParam || cat.id)}`}
              >
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-stone-100/50"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-3 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.05)]`}>
                    <motion.span
                       whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                       transition={{ duration: 0.5 }}
                    >
                      {cat.icon}
                    </motion.span>
                  </div>
                  <span className="font-bold text-sm tracking-wide text-stone-700">{cat.id}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* トレンド */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">
              {t('top.spot.title')}
            </h2>
            <Link href="/spots?sort=popular" className="text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full transition-colors">
              {t('top.spot.more')}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularSpots.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/spots/${spot.id}`} className="group block h-full">
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="h-full bg-white rounded-3xl shadow-sm border border-stone-100/50 overflow-hidden flex flex-col"
                  >
                    <div className="h-48 bg-stone-200 relative overflow-hidden">
                      {spot.image_url ? (
                        <Image src={spot.image_url} alt={spot.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-5xl">
                          {spot.category === '観光' ? '⛩️' : spot.category === '飲食' ? '🍜' : '📍'}
                        </div>
                      )}
                      {spot.plan === 'premium' && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-700 border border-amber-200/50 shadow-sm flex items-center gap-1">
                          <span className="text-amber-500">✨</span> PR
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-md">{spot.category}</span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 group-hover:text-amber-600 transition-colors text-xl line-clamp-1 mb-2">{spot.name}</h3>
                      <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed flex-1">{spot.sub || spot.pr}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
