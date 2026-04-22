'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const data = await getSectionStats(user.id)
        setStats(data)
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
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{tr.practice}</h1>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{tr.sectionTest}</h2>
        <SectionPicker stats={stats} lang={lang} onSelectSection={handleSelectSection} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{tr.fullTest}</h2>
        <Card
          className="cursor-pointer p-6 text-center hover:shadow-lg transition-shadow border-2 border-blue-100 hover:border-blue-300"
          onClick={handleFullTest}
        >
          <div className="text-4xl mb-2">📝</div>
          <h3 className="text-xl font-bold text-slate-900">{tr.fullTest}</h3>
          <p className="mt-1 text-sm text-slate-500">150 {tr.questions} · ~215 {tr.minutes}</p>
          <Button className="mt-4" disabled={creating}>
            {creating ? '...' : tr.startSection}
          </Button>
        </Card>
      </div>

      {/* Grammar language dialog */}
      <Dialog open={!!grammarDialog} onOpenChange={() => setGrammarDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr.chooseGrammar}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
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
