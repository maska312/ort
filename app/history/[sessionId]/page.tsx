'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAttemptDetail } from '@/lib/supabase/history'
import { useLang } from '@/contexts/LangContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AttemptDetail } from '@/lib/supabase/types'

export default function AttemptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { lang } = useLang()
  const sessionId = params.sessionId as string
  const [detail, setDetail] = useState<AttemptDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAttemptDetail(sessionId)
        setDetail(data)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) return <div className="mx-auto max-w-3xl p-6"><Skeleton className="h-96 rounded-2xl" /></div>
  if (!detail) return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Не найдено</div>

  const date = new Date(detail.startedAt)
  const timeMin = Math.round(detail.timeSpentSec / 60)

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.push('/history')} className="mb-2">← Назад</Button>

      <div className="rounded-2xl bg-white p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{detail.sectionTitle || 'Полный тест'}</h1>
            <p className="text-sm text-slate-500">
              {date.toLocaleDateString('ru-RU')} · {timeMin} мин
            </p>
          </div>
          <Badge variant={detail.percent >= 80 ? 'default' : 'secondary'}>
            {detail.score}/{detail.maxScore} ({detail.percent}%)
          </Badge>
        </div>
      </div>

      {detail.sections.length > 1 ? (
        <Tabs defaultValue={detail.sections[0].sectionCode}>
          <TabsList className="w-full">
            {detail.sections.map(s => (
              <TabsTrigger key={s.sectionCode} value={s.sectionCode} className="flex-1 text-xs">
                {s.sectionTitle}
              </TabsTrigger>
            ))}
          </TabsList>
          {detail.sections.map(s => (
            <TabsContent key={s.sectionCode} value={s.sectionCode}>
              <SectionAnswers section={s} />
            </TabsContent>
          ))}
        </Tabs>
      ) : detail.sections.length === 1 ? (
        <SectionAnswers section={detail.sections[0]} />
      ) : null}
    </div>
  )
}

function SectionAnswers({ section }: { section: AttemptDetail['sections'][0] }) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-white p-4 border">
        <p className="text-sm text-slate-600">
          Результат: <span className="font-bold">{section.score}/{section.maxScore}</span> ({section.percent}%)
        </p>
      </div>
      <Accordion>
        {section.answers.map((a, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2 text-left">
                <span className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-xs text-white shrink-0',
                  a.isCorrect ? 'bg-green-500' : 'bg-red-500'
                )}>
                  {a.isCorrect ? '✓' : '✗'}
                </span>
                <span className="line-clamp-1">{a.question.body_ru}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-7 text-sm">
                <p>Ваш ответ: <span className={a.isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {a.question.choices_ru[a.chosenIndex]}
                </span></p>
                {!a.isCorrect && (
                  <p>Правильный: <span className="text-green-600 font-medium">
                    {a.question.choices_ru[a.question.correct_index]}
                  </span></p>
                )}
                {a.question.explanation && (
                  <p className="text-slate-500 italic">{a.question.explanation}</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
