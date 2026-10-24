import { useEffect, useState } from 'react'
import { Bot } from 'lucide-react'

export default function RoverDialogue({ message: messageOverride }) {
  const text = messageOverride || 'Beep boop. R.O.V.E.R. online.'
  const [visibleText, setVisibleText] = useState('')

  useEffect(() => {
    setVisibleText('')
    let characterIndex = 0
    const interval = window.setInterval(() => {
      characterIndex += 1
      setVisibleText(text.slice(0, characterIndex))
      if (characterIndex >= text.length) {
        window.clearInterval(interval)
      }
    }, 24)

    return () => window.clearInterval(interval)
  }, [text])

  return (
    <div
      className="rover-dialogue flex items-start gap-3 rounded-lg border border-orange-900/60 bg-black/30 p-3"
    >
      <Bot className="mt-0.5 shrink-0 text-orange-300" size={22} />
      <div>
        <div className="text-xs uppercase tracking-widest text-orange-300/70">R.O.V.E.R.</div>
        <p aria-live="polite" className="rover-dialogue__text text-sm">{visibleText}<span aria-hidden="true" className="rover-dialogue__cursor">▌</span></p>
      </div>
    </div>
  )
}
