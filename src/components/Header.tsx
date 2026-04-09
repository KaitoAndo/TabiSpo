'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'

export default function Header({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const { language, setLanguage, t } = useI18n()
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 glass-panel rounded-full transition-all duration-300 gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <Link href="/" className="flex items-center gap-2 group flex-shrink-0 relative">
        <motion.span 
          whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className="text-2xl origin-bottom"
        >
          ⛩️
        </motion.span>
        <motion.span 
          initial={{ backgroundPosition: '0% 50%' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
          className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 bg-[length:200%_auto] bg-clip-text text-transparent hidden sm:inline-block drop-shadow-sm"
        >
          TabiSpo
        </motion.span>
      </Link>

      {children && (
        <div className="flex-1 max-w-sm mx-auto">
          {children}
        </div>
      )}
      
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 言語切り替え */}
        <div className="flex items-center text-xs font-medium text-stone-400 gap-1 border-r border-stone-200 pr-3">
          <span 
            className={`cursor-pointer transition-colors ${language === 'ja' ? 'text-amber-600 font-bold' : 'hover:text-amber-600'}`}
            onClick={() => setLanguage('ja')}
          >
            JA
          </span>
          <span>/</span>
          <span 
            className={`cursor-pointer transition-colors ${language === 'en' ? 'text-amber-600 font-bold' : 'hover:text-amber-600'}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </span>
        </div>

        {user ? (
          <Link 
            href="/mypage" 
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200 text-amber-600 hover:scale-105 transition-transform shadow-sm"
          >
            <span className="font-bold text-sm">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
          </Link>
        ) : (
          <>
            <Link 
              href="/login" 
              className="text-xs font-bold text-stone-600 hover:text-amber-600 transition-colors"
            >
              {t('header.login')}
            </Link>
            <Link 
              href="/login" 
              className="text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2 rounded-full shadow-md shadow-orange-500/20 hover:scale-105 transition-transform whitespace-nowrap"
            >
              {t('header.signup')}
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
