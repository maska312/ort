'use client'

import { MathJaxContext } from 'better-react-mathjax'
import { ReactNode } from 'react'

const config = {
  loader: { load: ['input/asciimath', 'output/chtml'] },
  asciimath: {
    delimiters: [['`', '`']]
  },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  }
}

export function MathProvider({ children }: { children: ReactNode }) {
  return (
    <MathJaxContext config={config}>
      {children}
    </MathJaxContext>
  )
}
