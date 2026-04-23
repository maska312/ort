'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getSectionStats } from '@/lib/supabase/history'
import { createPracticeSession } from '@/lib/supabase/quiz'
import { useLang } from '@/contexts/LangContext'
import SectionPicker from '@/components/practice/SectionPicker'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectionStats } from '@/lib/supabase/types'

export default function PracticePage() {
  const router = useRouter()
  const { lang, tr } = useLang()
  const [stats, setStats] = useState<SectionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [grammarDialog, setGrammarDialog] = useState<{ mode: 'full' | 'section', code?: string } | null>(null)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const data = await getSectionStats(user.id)
          setStats(data)
        }
      } catch (e) {
        console.error('Practice load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleCreateSession = async (mode: 'full' | 'section', sectionCode?: string, grammarLang?: 'ru' | 'ky') => {
    setCreating(true)
    try {
      const payload = await createPracticeSession(mode, sectionCode, grammarLang)
      router.push(`/quiz/${payload.sessionId}`)
    } catch (e) {
      console.error(e)
      setCreating(false)
    }
  }

  const handleSelectSection = (code: string, grammarLang?: 'ru' | 'ky') => {
    if (code === 'grammar_ru' || code === 'grammar_ky') {
      setGrammarDialog({ mode: 'section', code })
      return
    }
    handleCreateSession('section', code)
  }

  const handleFullTest = () => {
    setGrammarDialog({ mode: 'full' })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{tr.practice}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {lang === 'ky' ? 'Бөлүм тандап, даярданыңыз' : 'Выберите раздел и начните тренировку'}
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-700 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          {tr.sectionTest}
        </h2>
        <SectionPicker stats={stats} lang={lang} onSelectSection={handleSelectSection} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-700 flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          {tr.fullTest}
        </h2>
        <Card
          className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-indigo-100 p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 active:translate-y-0 bg-gradient-to-br from-indigo-50 to-purple-50"
          onClick={handleFullTest}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <div className="relative">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200/50 text-2xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-slate-800">{tr.fullTest}</h3>
            <p className="mt-1 text-sm text-slate-500">150 {tr.questions} · ~215 {tr.minutes}</p>
            <div className="mt-2 flex justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                📐 Математика
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                🔤 Аналогии
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                📖 Чтение
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                ✍️ Грамматика
              </span>
            </div>
            <Button
              className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:shadow-indigo-300/50 hover:-translate-y-0.5"
              disabled={creating}
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Загрузка...
                </span>
              ) : tr.startSection}
            </Button>
          </div>
        </Card>
      </div>

      {/* Grammar language dialog */}
      <Dialog open={!!grammarDialog} onOpenChange={() => setGrammarDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{tr.chooseGrammar}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200/50"
              onClick={() => {
                const mode = grammarDialog?.mode || 'section'
                const code = mode === 'section' ? 'grammar_ru' : undefined
                setGrammarDialog(null)
                handleCreateSession(mode, code, 'ru')
              }}
              disabled={creating}
            >
              🇷🇺 Русский язык
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                const mode = grammarDialog?.mode || 'section'
                const code = mode === 'section' ? 'grammar_ky' : undefined
                setGrammarDialog(null)
                handleCreateSession(mode, code, 'ky')
              }}
              disabled={creating}
            >
              🇰🇬 Кыргыз тили
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
