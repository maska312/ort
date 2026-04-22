'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { Button } from '@/components/ui/button'
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
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-black text-blue-600">ОРТ</span>
          <span className="text-sm font-medium text-slate-500">Преп</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'text-sm',
                  pathname === link.href && 'bg-blue-600 text-white'
                )}
              >
                <span className="mr-1.5 hidden sm:inline">{link.icon}</span>
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === 'ru' ? 'ky' : 'ru')}
          className="text-xs font-bold uppercase"
        >
          {lang === 'ru' ? 'KY' : 'RU'}
        </Button>
      </div>
    </nav>
  )
}
