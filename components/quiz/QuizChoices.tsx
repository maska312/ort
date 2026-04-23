'use client'

import { cn } from '@/lib/utils'
import { MathJax } from 'better-react-mathjax'

type Props = {
  choices: string[]
  selectedIndex: number | null
  correctIndex: number | null
  onSelect: (index: number) => void
  disabled?: boolean
}

const labels = ['A', 'B', 'C', 'D']

export default function QuizChoices({ choices, selectedIndex, correctIndex, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {choices.map((choice, index) => {
        const isSelected = selectedIndex === index
        const isCorrect = correctIndex !== null && index === correctIndex
        const isWrong = correctIndex !== null && isSelected && index !== correctIndex
        const showResult = correctIndex !== null

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={cn(
              'min-h-[56px] w-full rounded-2xl px-5 py-4 text-left transition-all duration-200',
              'flex items-center gap-4 border-2',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
              !showResult && !isSelected && 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50',
              !showResult && isSelected && 'border-blue-600 bg-blue-50 shadow-md',
              showResult && isCorrect && 'border-green-500 bg-green-50',
              showResult && isWrong && 'border-red-500 bg-red-50',
              showResult && !isCorrect && !isWrong && 'border-slate-200 bg-slate-50 opacity-60',
              disabled && 'cursor-not-allowed',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                !showResult && !isSelected && 'bg-slate-100 text-slate-600',
                !showResult && isSelected && 'bg-blue-600 text-white',
                showResult && isCorrect && 'bg-green-600 text-white',
                showResult && isWrong && 'bg-red-600 text-white',
                showResult && !isCorrect && !isWrong && 'bg-slate-200 text-slate-400',
              )}
            >
              {labels[index]}
            </span>
            <span className={cn(
              'flex-1 text-base',
              showResult && isCorrect && 'font-semibold text-green-800',
              showResult && isWrong && 'text-red-800 line-through',
            )}>
              <MathJax dynamic>{choice}</MathJax>
            </span>
            {showResult && isCorrect && <span className="text-green-600 text-xl">✓</span>}
            {showResult && isWrong && <span className="text-red-600 text-xl">✗</span>}
          </button>
        )
      })}
    </div>
  )
}
