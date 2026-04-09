'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'
import React from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  const tabs = [
    { label: t('nav.home'), href: '/', icon: '🏠' },
    { label: t('nav.map'), href: '/map', icon: '🗺️' },
    { label: t('nav.schedules'), href: '/schedules', icon: '🗓️' },
    { label: t('nav.mypage'), href: '/mypage', icon: '👤' },
  ]

  if (pathname.startsWith('/admin') || pathname.startsWith('/shop')) {
    return null
  }

  return (
    <>
      <div className="h-20" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav shadow-[0_-8px_32px_rgba(0,0,0,0.06)] box-content pb-[env(safe-area-inset-bottom)]">
        <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map(tab => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
            return (
                <li key={tab.href} className="flex-1 relative">
                <motion.div whileTap={{ scale: 0.85 }} className="w-full h-full">
                  <Link
                    href={tab.href}
                    className={`flex flex-col items-center justify-center w-full h-full py-2 z-10 relative cursor-pointer ${
                      isActive ? 'text-amber-600 font-bold' : 'text-stone-400 font-medium hover:text-amber-500 transition-colors'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavBubble"
                        className="absolute inset-0 bg-amber-50/80 rounded-2xl z-0 m-1 border border-amber-100/50"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <motion.span 
                      className="text-2xl relative z-10"
                      whileHover={!isActive ? { y: -3 } : { y: 0 }}
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {tab.icon}
                    </motion.span>
                    <span className="text-[10px] mt-0.5 relative z-10">{tab.label}</span>
                  </Link>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
