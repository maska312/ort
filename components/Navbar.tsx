'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { lang, setLang, tr } = useLang()
  const pathname = usePathname()

  // Hide navbar on quiz pages
  if (pathname.startsWith('/quiz/')) return null

  const links = [
    { href: '/dashboard', label: tr.dashboard, icon: '📊' },
    { href: '/practice', label: tr.practice, icon: '🎯' },
    { href: '/history', label: tr.history, icon: '📋' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
            <span className="text-xs font-black text-white">ОРТ</span>
          </div>
          <span className="text-sm font-semibold text-slate-500 tracking-wide">Преп</span>
        </Link>

        <div className="flex items-center gap-1 rounded-full bg-slate-100/80 p-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <span className="hidden sm:inline">{link.icon}</span>
                  {link.label}
                </button>
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => setLang(lang === 'ru' ? 'ky' : 'ru')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold uppercase text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
        >
          {lang === 'ru' ? 'KY' : 'RU'}
        </button>
      </div>
    </nav>
  )
}
